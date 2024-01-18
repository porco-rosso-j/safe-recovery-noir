import {
	Signer,
	ethers,
	SigningKey,
	ContractTransactionResponse,
} from "ethers";
import { authenticateWebAuthn } from "../utils/webauthn/webauthn";
import { getNullifierHashAndHashPath } from "../utils/merkle/merkle-helper";
import {
	generateProofK256,
	generateProofP256,
	generateProofSecret,
	generateProofSocial,
} from "../utils/noir-proof";
import { recoveryPluginSigner, nonce, pluginIface } from "../utils/contracts";
import { parseUint8ArrayToBytes32 } from "../utils/helper";
import { txResult, error } from "./types";
import {
	computeMessage,
	getCredentialID,
	getGuardiansRoot,
	getHashedAddr,
	getRecoveryCount,
	getWebAuthnPubkey,
} from "./view";
import Safe from "@safe-global/protocol-kit";
import { sendSafeTx } from "../utils/safe";
import { NullifierHashAndHashPath } from "../utils/merkle/merkle-helper";

export async function _proposeRecovery(
	method: number,
	signer: Signer,
	pluginAddr: string,
	newThreshold: number,
	oldOwner: string,
	newOwner: string,
	secret?: string
): Promise<txResult> {
	let result: txResult;

	if (method === 1) {
		result = await _proposeEcrecoverRecover(
			signer,
			pluginAddr,
			newThreshold,
			oldOwner,
			newOwner
		);
	} else if (method === 2) {
		result = await _proposeFingerPrintRecover(
			signer,
			pluginAddr,
			newThreshold,
			oldOwner,
			newOwner
		);
	} else if (method === 3) {
		result = await _proposeSecretRecover(
			signer,
			pluginAddr,
			newThreshold,
			oldOwner,
			newOwner,
			secret
		);
	} else if (method === 4) {
		result = await _proposeSocialRecover(
			signer,
			pluginAddr,
			newThreshold,
			oldOwner,
			newOwner
		);
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

export async function _proposeEcrecoverRecover(
	signer: Signer,
	pluginAddr: string,
	newThreshold: number,
	oldOwner: string,
	newOwner: string
): Promise<txResult> {
	try {
		const [msg, signature] = await getMsgAndSig(
			signer,
			1,
			await signer.getAddress()
		);
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

		const hashedAddr = await getHashedAddr(pluginAddr);

		const ret = await generateProofK256(
			hashedAddr,
			ethers.getBytes(pubkey).slice(1, 65),
			ethers.getBytes(signature).slice(0, -1),
			ethers.getBytes(msgHash)
		);

		console.log("ret.proof: ", ret.proof);

		const tx: ContractTransactionResponse = await recoveryPluginSigner(
			signer,
			pluginAddr
		).proposeEcrecoverRecover(
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

export async function _proposeFingerPrintRecover(
	signer: Signer,
	pluginAddr: string,
	newThreshold: number,
	oldOwner: string,
	newOwner: string
): Promise<txResult> {
	try {
		const credentialId = await getCredentialID(pluginAddr);

		const [signature, webauthnInputs] = await authenticateWebAuthn(
			credentialId
		);

		const pubkey = await getWebAuthnPubkey(pluginAddr);

		console.log("webauthnInputs: ", webauthnInputs);
		console.log("signature: ", signature);

		console.log("pubkey: ", pubkey);

		const message = await computeMessage(webauthnInputs, pluginAddr);
		console.log("message: ", message);

		const ret = await generateProofP256(
			ethers.getBytes(signature),
			ethers.getBytes(pubkey[0]),
			ethers.getBytes(pubkey[1]),
			ethers.getBytes(message)
		);

		const tx = await recoveryPluginSigner(
			signer,
			pluginAddr
		).proposeWebAuthnRecover(
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
export async function _proposeSecretRecover(
	signer: Signer,
	pluginAddr: string,
	newThreshold: number,
	oldOwner: string,
	newOwner: string,
	secret: string
): Promise<txResult> {
	console.log("oldOwner: ", oldOwner);
	console.log("newOwner: ", newOwner);
	console.log("newThreshold: ", newThreshold);

	const ret = await generateProofSecret(secret);
	console.log("ret: ", ret);

	try {
		const tx = await recoveryPluginSigner(
			signer,
			pluginAddr
		).proposeSecretRecover(
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

export async function _proposeSocialRecover(
	signer: Signer,
	pluginAddr: string,
	newThreshold: number,
	oldOwner: string,
	newOwner: string
): Promise<txResult> {
	const signerAddr = await signer.getAddress();
	const [msg, signature] = await getMsgAndSig(signer, 4, signerAddr);
	if (msg === "" || signature === "") return error;

	try {
		const msgHash: string = ethers.hashMessage(msg);
		const pubkey: string = SigningKey.recoverPublicKey(msgHash, signature);

		const _proposalId = (await getRecoveryCount(pluginAddr)) + 1;
		const proposalId = "0x" + _proposalId.toString();

		const root = await getGuardiansRoot(pluginAddr);
		console.log("root: ", root);

		const response: NullifierHashAndHashPath =
			await getNullifierHashAndHashPath(root, signerAddr, proposalId);

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

		const tx = await recoveryPluginSigner(
			signer,
			pluginAddr
		).proposeSocialRecover(
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

export async function _approveSocialRecovery(
	signer: Signer,
	pluginAddr: string,
	proposalId: number
): Promise<txResult> {
	const [msg, signature] = await getMsgAndSig(
		signer,
		4,
		await signer.getAddress()
	);
	if (msg === "" || signature === "") return error;
	const msgHash: string = ethers.hashMessage(msg);
	const pubkey: string = SigningKey.recoverPublicKey(msgHash, signature);

	const root = await getGuardiansRoot(pluginAddr);

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
		const tx = await recoveryPluginSigner(
			signer,
			pluginAddr
		).approveSocialRecovery(
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

export async function _executeRecover(
	signer: Signer,
	pluginAddr: string,
	proposalId: number
): Promise<txResult> {
	try {
		const tx = await recoveryPluginSigner(signer, pluginAddr).execRecovery(
			proposalId,
			{
				gasLimit: 500000,
			}
		);
		console.log("tx: ", tx);
		return await sendTx(tx);
	} catch (e) {
		console.log("e: ", e);
		return error;
	}
}

export async function _rejectRecover(
	safeSDK: Safe,
	safeAddr: string,
	pluginAddr: string,
	proposalId: number
): Promise<txResult> {
	const rejectionTx = pluginIface.encodeFunctionData("rejectRecovery", [
		proposalId,
	]);

	const _data = ethers.solidityPacked(
		["bytes", "address"],
		[rejectionTx, safeAddr]
	);
	console.log("data: ", _data);

	const rejectionTxnTxData = {
		to: pluginAddr,
		data: _data,
		value: "0",
	};

	return await sendSafeTx(safeSDK, [rejectionTxnTxData]);
}

const getMsgAndSig = async (
	signer: Signer,
	type: number,
	address: string
): Promise<any> => {
	let methodStr;
	if (type === 1) {
		methodStr = "ecrecover_recovery";
	} else if (type === 4) {
		methodStr = "social_recovery";
	}

	const user_nonce = await nonce(address);
	const msg =
		"safe_recover_" +
		methodStr +
		"_address_" +
		address +
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
