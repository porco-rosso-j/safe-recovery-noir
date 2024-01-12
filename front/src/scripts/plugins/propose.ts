import { ethers, Signer, utils } from "ethers";
import { authenticateWebAuthn } from "../utils/webauthn/webauthn";
import { getNullifierHashAndHashPath } from "../utils/merkle/merkle-helper";
import {
	generateProofK256,
	generateProofP256,
	generateProofSecret,
	generateProofSocial,
} from "../utils/noir-proof";
import {
	recoveryPluginSigner,
	dummyWallet,
	nonce,
	pluginIface,
} from "../utils/contracts";
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
import { contracts } from "../constants/addresses";
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

async function sendTx(tx: any): Promise<txResult> {
	try {
		const txResponse = await tx.wait();
		console.log("txResponse: ", txResponse);
		return { result: true, txHash: txResponse.transactionHash };
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
	const [msg, signature] = await getMsgAndSig(
		signer,
		1,
		await signer.getAddress()
	);
	if (msg === "" || signature === "") return error;

	const msgHash: string = ethers.utils.hashMessage(msg);
	const pubkey: string = utils.recoverPublicKey(
		msgHash,
		utils.arrayify(signature)
	);

	const hashedAddr = await getHashedAddr(pluginAddr);

	const ret = await generateProofK256(
		hashedAddr,
		utils.arrayify(pubkey).slice(1, 65),
		utils.arrayify(signature).slice(0, -1),
		utils.arrayify(msgHash)
	);

	const pubInputMsgHash = await parseUint8ArrayToBytes32(
		utils.arrayify(msgHash)
	);
	console.log("pubInputMsgHash: ", pubInputMsgHash);
	console.log("ret.proof: ", ret.proof);

	try {
		const tx = await recoveryPluginSigner(
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
			utils.arrayify(signature),
			utils.arrayify(pubkey[0]),
			utils.arrayify(pubkey[1]),
			utils.arrayify(message)
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
	const [msg, signature] = await getMsgAndSig(
		signer,
		4,
		await signer.getAddress()
	);
	if (msg === "" || signature === "") return error;

	try {
		const msgHash: string = ethers.utils.hashMessage(msg);
		const pubkey: string = utils.recoverPublicKey(
			msgHash,
			utils.arrayify(signature)
		);

		const proposalId = Number(await getRecoveryCount(pluginAddr)) + 1;
		const root = await getGuardiansRoot(pluginAddr);

		const response: NullifierHashAndHashPath =
			await getNullifierHashAndHashPath(
				root,
				await signer.getAddress(),
				proposalId.toString()
			);

		const ret = await generateProofSocial(
			root,
			response.nullHash,
			proposalId.toString(),
			utils.arrayify(pubkey).slice(1, 65),
			utils.arrayify(signature).slice(0, -1),
			utils.arrayify(msgHash),
			response.index.toString(),
			response.hashPath
		);

		const pubInputMsgHash = await parseUint8ArrayToBytes32(
			utils.arrayify(msgHash)
		);
		console.log("pubInputMsgHash: ", pubInputMsgHash);

		console.log("here?");
		console.log("oldOwner: ", oldOwner);
		console.log("newOwner: ", newOwner);
		console.log("ret.proof: ", ret.proof);
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
	const msgHash: string = ethers.utils.hashMessage(msg);
	const pubkey: string = utils.recoverPublicKey(
		msgHash,
		utils.arrayify(signature)
	);

	const root = await getGuardiansRoot(pluginAddr);

	const { index, nullHash, hashPath } = await getNullifierHashAndHashPath(
		root,
		await signer.getAddress(),
		proposalId.toString()
	);

	const ret = await generateProofSocial(
		root,
		nullHash,
		proposalId.toString(),
		utils.arrayify(pubkey).slice(1, 65),
		utils.arrayify(signature).slice(0, -1),
		utils.arrayify(msgHash),
		index.toString(),
		hashPath
	);

	const pubInputMsgHash = await parseUint8ArrayToBytes32(
		utils.arrayify(msgHash)
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
	// dummy tx to move blocks in local test
	// await dummyWallet.sendTransaction({ to: await dummyWallet.getAddress() });

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

	const _data = ethers.utils.solidityPack(
		["bytes", "address"],
		[rejectionTx, safeAddr]
	);
	console.log("data: ", _data);

	const rejectionTxnTxData = {
		to: pluginAddr,
		data: _data,
		// data: rejectionTx,
		value: "0",
	};

	return await sendSafeTx(safeSDK, rejectionTxnTxData);
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
