import { error, txResult } from "src/scripts/plugins/types";
import { useContext } from "react";
import {
	ContractTransactionResponse,
	Signer,
	SigningKey,
	ethers,
} from "ethers";
import { parseUint8ArrayToBytes32 } from "src/scripts/utils/helper";
import { authenticateWebAuthn } from "src/scripts/utils/webauthn/webauthn";
import {
	NullifierHashAndHashPath,
	getNullifierHashAndHashPath,
} from "src/scripts/utils/merkle/merkle-helper";
import {
	generateProofK256,
	generateProofP256,
	generateProofSecret,
	generateProofSocial,
} from "src/scripts/utils/noir-proof";
import {
	computeMessage,
	getCredentialID,
	getGuardiansRoot,
	getHashedAddr,
	getRecoveryCount,
	getWebAuthnPubkey,
} from "src/scripts/plugins/view";
import { sendSafeTx } from "src/scripts/utils/safe";
import UserDataContext from "src/contexts/userData";
import {
	recoveryPluginSigner,
	pluginIface,
	nonce,
} from "src/scripts/utils/contracts";

const useProposeRecover = (setProposeStatus: (index: number) => void) => {
	const { signer, safeAddress, safeSDK, pluginAddress } =
		useContext(UserDataContext);

	const plugin = recoveryPluginSigner(signer, pluginAddress);
	console.log("plugin: ", plugin);
	console.log("signer: ", signer);
	console.log(" safeAddress : ", safeAddress);
	console.log("pluginAddress: ", pluginAddress);

	async function _proposeRecovery(
		method: number,
		newThreshold: number,
		oldOwner: string,
		newOwner: string,
		secret?: string
	): Promise<txResult> {
		let result: txResult;

		setProposeStatus(1);

		if (method === 1) {
			result = await _proposeEcrecoverRecover(newThreshold, oldOwner, newOwner);
		} else if (method === 2) {
			result = await _proposeFingerPrintRecover(
				newThreshold,
				oldOwner,
				newOwner
			);
		} else if (method === 3) {
			result = await _proposeSecretRecover(
				newThreshold,
				oldOwner,
				newOwner,
				secret
			);
		} else if (method === 4) {
			result = await _proposeSocialRecover(newThreshold, oldOwner, newOwner);
		} else {
			console.log("unrecognized method index");
			return error;
		}

		return result;
	}

	async function sendTx(tx: ContractTransactionResponse): Promise<txResult> {
		setProposeStatus(4);
		try {
			const txResponse = await tx.wait();
			console.log("txResponse: ", txResponse);
			return { result: true, txHash: txResponse.hash };
		} catch (e) {
			return { result: false, txHash: tx.hash };
		}
	}

	async function _proposeEcrecoverRecover(
		newThreshold: number,
		oldOwner: string,
		newOwner: string
	): Promise<txResult> {
		try {
			const [msg, signature] = await getMsgAndSig(1);
			if (msg === "" || signature === "") return error;

			const msgHash: string = ethers.hashMessage(msg);
			const pubkey: string = SigningKey.recoverPublicKey(msgHash, signature);
			console.log("msgHash: ", msgHash);
			console.log("pubkey: ", pubkey);
			console.log("msgHash len: ", ethers.dataLength(msgHash));
			console.log("pubkey len: ", ethers.dataLength(pubkey));

			console.log("msgHash getBytes: ", ethers.getBytes(msgHash));
			const pubInputMsgHash = await parseUint8ArrayToBytes32(
				ethers.getBytes(msgHash)
			);

			console.log("pubInputMsgHash: ", pubInputMsgHash);

			const hashedAddr = await getHashedAddr(pluginAddress);

			setProposeStatus(2);
			const ret = await generateProofK256(
				hashedAddr,
				ethers.getBytes(pubkey).slice(1, 65),
				ethers.getBytes(signature).slice(0, -1),
				ethers.getBytes(msgHash)
			);
			setProposeStatus(3);

			console.log("ret.proof: ", ret.proof);

			const tx: ContractTransactionResponse =
				await plugin.proposeEcrecoverRecover(
					[oldOwner],
					[newOwner],
					newThreshold,
					ret.proof,
					pubInputMsgHash
					// { gasLimit: 2000000 }
				);

			console.log("tx: ", tx);
			return await sendTx(tx);
		} catch (e) {
			console.log("e: ", e);
			return { result: false, txHash: "" };
		}
	}

	async function _proposeFingerPrintRecover(
		newThreshold: number,
		oldOwner: string,
		newOwner: string
	): Promise<txResult> {
		try {
			const credentialId = await getCredentialID(pluginAddress);

			const [signature, webauthnInputs] = await authenticateWebAuthn(
				credentialId
			);

			console.log("webauthnInputs: ", webauthnInputs);
			console.log("signature: ", signature);

			const pubkey = await getWebAuthnPubkey(pluginAddress);

			console.log("pubkey: ", pubkey);

			const message = await computeMessage(webauthnInputs, pluginAddress);
			console.log("message: ", message);

			setProposeStatus(2);
			const ret = await generateProofP256(
				ethers.getBytes(signature),
				ethers.getBytes(pubkey[0]),
				ethers.getBytes(pubkey[1]),
				ethers.getBytes(message)
			);
			setProposeStatus(3);

			const tx = await plugin.proposeWebAuthnRecover(
				[oldOwner],
				[newOwner],
				newThreshold,
				ret.proof,
				webauthnInputs
				// { gasLimit: 2000000 }
			);
			console.log("tx: ", tx);
			return await sendTx(tx);
		} catch (e) {
			console.log("e: ", e);
			return error;
		}
	}
	async function _proposeSecretRecover(
		newThreshold: number,
		oldOwner: string,
		newOwner: string,
		secret: string
	): Promise<txResult> {
		try {
			console.log("oldOwner: ", oldOwner);
			console.log("newOwner: ", newOwner);
			console.log("newThreshold: ", newThreshold);

			setProposeStatus(2);
			const ret = await generateProofSecret(secret);
			setProposeStatus(3);
			console.log("ret: ", ret);

			const tx = await plugin.proposeSecretRecover(
				[oldOwner],
				[newOwner],
				newThreshold,
				ret.proof
				// { gasLimit: 1000000 }
			);
			console.log("tx: ", tx);
			return await sendTx(tx);
		} catch (e) {
			console.log("e: ", e);
			return error;
		}
	}

	async function _proposeSocialRecover(
		newThreshold: number,
		oldOwner: string,
		newOwner: string
	): Promise<txResult> {
		const signerAddr = await signer.getAddress();
		const [msg, signature] = await getMsgAndSig(4);
		if (msg === "" || signature === "") return error;

		try {
			const msgHash: string = ethers.hashMessage(msg);
			const pubkey: string = SigningKey.recoverPublicKey(msgHash, signature);
			const _proposalId = (await getRecoveryCount(pluginAddress)) + 1;
			const proposalId = `0x${_proposalId.toString(16).padStart(2, "0")}`;
			console.log("padded proposalid: ", proposalId);

			const root = await getGuardiansRoot(pluginAddress);
			console.log("root: ", root);

			const response: NullifierHashAndHashPath =
				await getNullifierHashAndHashPath(root, signerAddr, proposalId);

			setProposeStatus(2);
			const ret = await generateProofSocial(
				root,
				response.nullHash,
				_proposalId.toString(),
				ethers.getBytes(pubkey).slice(1, 65),
				ethers.getBytes(signature).slice(0, -1),
				ethers.getBytes(msgHash),
				response.index.toString(),
				response.hashPath
			);
			setProposeStatus(3);

			const pubInputMsgHash = await parseUint8ArrayToBytes32(
				ethers.getBytes(msgHash)
			);
			console.log("pubInputMsgHash: ", pubInputMsgHash);

			const tx = await plugin.proposeSocialRecover(
				[oldOwner],
				[newOwner],
				newThreshold,
				ret.proof,
				response.nullHash,
				pubInputMsgHash
				// { gasLimit: 2000000 }
			);
			console.log("tx: ", tx);
			return await sendTx(tx);
		} catch (e) {
			console.log("e: ", e);
			return error;
		}
	}

	async function _approveSocialRecovery(
		_proposalId: number
	): Promise<txResult> {
		try {
			const [msg, signature] = await getMsgAndSig(4);
			if (msg === "" || signature === "") return error;
			const msgHash: string = ethers.hashMessage(msg);
			const pubkey: string = SigningKey.recoverPublicKey(msgHash, signature);

			const root = await getGuardiansRoot(pluginAddress);
			const proposalId = `0x${_proposalId.toString(16).padStart(2, "0")}`;

			const { index, nullHash, hashPath } = await getNullifierHashAndHashPath(
				root,
				await signer.getAddress(),
				proposalId
			);

			setProposeStatus(2);
			const ret = await generateProofSocial(
				root,
				nullHash,
				_proposalId.toString(),
				ethers.getBytes(pubkey).slice(1, 65),
				ethers.getBytes(signature).slice(0, -1),
				ethers.getBytes(msgHash),
				index.toString(),
				hashPath
			);
			setProposeStatus(3);

			const pubInputMsgHash = await parseUint8ArrayToBytes32(
				ethers.getBytes(msgHash)
			);
			console.log("pubInputMsgHash: ", pubInputMsgHash);

			const tx = await plugin.approveSocialRecovery(
				proposalId,
				ret.proof,
				nullHash,
				pubInputMsgHash
				// { gasLimit: 2000000 }
			);
			console.log("tx: ", tx);
			return await sendTx(tx);
		} catch (e) {
			console.log("e: ", e);
			return error;
		}
	}

	async function _executeRecover(proposalId: number): Promise<txResult> {
		try {
			const tx = await plugin.execRecovery(proposalId, {
				gasLimit: 500000,
			});
			console.log("tx: ", tx);
			return await sendTx(tx);
		} catch (e) {
			console.log("e: ", e);
			return error;
		}
	}

	async function _rejectRecover(proposalId: number): Promise<txResult> {
		const rejectionTx = pluginIface.encodeFunctionData("rejectRecovery", [
			proposalId,
		]);

		const _data = ethers.solidityPacked(
			["bytes", "address"],
			[rejectionTx, safeAddress]
		);
		console.log("data: ", _data);

		const rejectionTxnTxData = {
			to: pluginAddress,
			data: _data,
			value: "0",
		};

		return await sendSafeTx(safeSDK, [rejectionTxnTxData]);
	}

	const getMsgAndSig = async (type: number): Promise<any> => {
		const signerAddr = await signer.getAddress();
		let methodStr;
		if (type === 1) {
			methodStr = "ecrecover_recovery";
		} else if (type === 4) {
			methodStr = "social_recovery";
		}

		const user_nonce = await nonce(signerAddr);

		const message = `[safe_recover signature]
		\nmethod: ${methodStr} 
		\nsigner_address: ${signerAddr} 
		\nsigner nonce: ${user_nonce}
		\nplugin_address: ${pluginAddress} 
		\nsafe_address: ${safeAddress}
		`;

		let signature: string;
		try {
			signature = await signer.signMessage(message);
		} catch (e) {
			console.log("error: ", e);
			return ["", ""];
		}

		return [message, signature];
	};

	return {
		_proposeRecovery,
		_approveSocialRecovery,
		_executeRecover,
		_rejectRecover,
	};
};

export default useProposeRecover;
