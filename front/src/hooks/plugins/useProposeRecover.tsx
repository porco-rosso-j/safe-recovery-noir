import { error, txResult } from "src/scripts/types";
import { useContext, useEffect, useState } from "react";
import {
	Contract,
	ContractTransactionResponse,
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
import { useViewContract, useSafe } from "../index";
import { ContractDataContext, UserDataContext } from "src/contexts/contextData";
import { pluginIface, pluginSigner } from "src/scripts/utils/contracts";

const useProposeRecover = () => {
	const { signer, safeAddress, pluginAddress } = useContext(UserDataContext);
	const {
		getRecoveryCount,
		getGuardiansRoot,
		computeMessage,
		getCredentialID,
		getHashedAddr,
		getWebAuthnPubkey,
	} = useViewContract();
	const { sendSafeTx } = useSafe();
	const [proposeStatus, setProposeStatus] = useState<number>(0);
	// 1. proposed
	// 2. proof generated
	// 3. broadcasted

	const [recoveryPluginSigner, setRecoveryPluginSigner] =
		useState<Contract>(null);

	useEffect(() => {
		if (pluginAddress && signer) {
			console.log('"this!');
			setRecoveryPluginSigner(pluginSigner(pluginAddress, signer));
		}
	}, [pluginAddress, signer]);

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

		const hashedAddr = await getHashedAddr();

		setProposeStatus(2);
		const ret = await generateProofK256(
			hashedAddr,
			ethers.getBytes(pubkey).slice(1, 65),
			ethers.getBytes(signature).slice(0, -1),
			ethers.getBytes(msgHash)
		);

		console.log("ret.proof: ", ret.proof);

		try {
			const tx: ContractTransactionResponse =
				await recoveryPluginSigner.proposeEcrecoverRecover(
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
			return error;
		}
	}

	async function _proposeFingerPrintRecover(
		newThreshold: number,
		oldOwner: string,
		newOwner: string
	): Promise<txResult> {
		try {
			const credentialId = await getCredentialID();

			const [signature, webauthnInputs] = await authenticateWebAuthn(
				credentialId
			);

			const pubkey = await getWebAuthnPubkey();

			console.log("webauthnInputs: ", webauthnInputs);
			console.log("signature: ", signature);

			console.log("pubkey: ", pubkey);

			const message = await computeMessage(webauthnInputs);
			console.log("message: ", message);

			setProposeStatus(2);
			const ret = await generateProofP256(
				ethers.getBytes(signature),
				ethers.getBytes(pubkey[0]),
				ethers.getBytes(pubkey[1]),
				ethers.getBytes(message)
			);

			const tx = await recoveryPluginSigner.proposeWebAuthnRecover(
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
		console.log("oldOwner: ", oldOwner);
		console.log("newOwner: ", newOwner);
		console.log("newThreshold: ", newThreshold);

		setProposeStatus(2);
		const ret = await generateProofSecret(secret);
		console.log("ret: ", ret);

		try {
			const tx = await recoveryPluginSigner.proposeSecretRecover(
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

			const _proposalId = (await getRecoveryCount()) + 1;
			const proposalId = "0x" + _proposalId.toString();

			const root = await getGuardiansRoot();
			console.log("root: ", root);

			const response: NullifierHashAndHashPath =
				await getNullifierHashAndHashPath(root, signerAddr, proposalId);

			setProposeStatus(2);
			const ret = await generateProofSocial(
				root,
				response.nullHash,
				proposalId,
				ethers.getBytes(pubkey).slice(1, 65),
				ethers.getBytes(signature).slice(0, -1),
				ethers.getBytes(msgHash),
				response.index.toString(),
				response.hashPath
			);

			const pubInputMsgHash = await parseUint8ArrayToBytes32(
				ethers.getBytes(msgHash)
			);
			console.log("pubInputMsgHash: ", pubInputMsgHash);

			const tx = await recoveryPluginSigner.proposeSocialRecover(
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

	async function _approveSocialRecovery(proposalId: number): Promise<txResult> {
		const [msg, signature] = await getMsgAndSig(4);
		if (msg === "" || signature === "") return error;
		const msgHash: string = ethers.hashMessage(msg);
		const pubkey: string = SigningKey.recoverPublicKey(msgHash, signature);

		const root = await getGuardiansRoot();

		const { index, nullHash, hashPath } = await getNullifierHashAndHashPath(
			root,
			await signer.getAddress(),
			// utils.hexlify(proposalId)
			"0x" + proposalId.toString()
		);

		const ret = await generateProofSocial(
			root,
			nullHash,
			proposalId.toString(),
			ethers.getBytes(pubkey).slice(1, 65),
			ethers.getBytes(signature).slice(0, -1),
			ethers.getBytes(msgHash),
			index.toString(),
			hashPath
		);

		const pubInputMsgHash = await parseUint8ArrayToBytes32(
			ethers.getBytes(msgHash)
		);
		console.log("pubInputMsgHash: ", pubInputMsgHash);

		try {
			const tx = await recoveryPluginSigner.approveSocialRecovery(
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
			const tx = await recoveryPluginSigner.execRecovery(proposalId, {
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

		return await sendSafeTx([rejectionTxnTxData]);
	}

	const getMsgAndSig = async (type: number): Promise<any> => {
		const signerAddr = await signer.getAddress();
		let methodStr;
		if (type === 1) {
			methodStr = "ecrecover_recovery";
		} else if (type === 4) {
			methodStr = "social_recovery";
		}

		const user_nonce = await signer.getTransactionCount(signerAddr);
		const msg =
			"safe_recover_" +
			methodStr +
			"_address_" +
			signerAddr +
			"_nonce_" +
			user_nonce;

		let signature: string;
		try {
			signature = await signer.signMessage(msg);
		} catch (e) {
			console.log("error: ", e);
			return ["", ""];
		}

		return [msg, signature];
	};

	return {
		proposeStatus,
		_proposeRecovery,
		_approveSocialRecovery,
		_executeRecover,
		_rejectRecover,
	};
};

export default useProposeRecover;
