import { ethers, Signer, utils } from "ethers";
import { contracts } from "./constants/addresses";
import RecoveryPlugin from "./artifacts/contracts/RecoveryPluginNoir.json";
import { pedersen, pedersen_new } from "./utils/pedersen";
import { sendSafeTx } from "./safe";
import { getKeyPairAndID } from "./webauthn-utils";
import { getMerkleRootFromAddresses } from "./merkle";
import { getHashFromSecret } from "./utils/secret";
import Safe from "@safe-global/protocol-kit";
import { privatekeys } from "./constants/addresses";
import { arrayify } from "ethers/lib/utils";
import {
	generateProofK256,
	generateProofP256,
	generateProofSecret,
} from "./noir/proof";
import {
	authenticateWebAuthn,
	getPubkeyByCredentialId,
} from "./webauthn-utils";
import { Noir } from "@noir-lang/noir_js";

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const plugin = new ethers.Contract(
	contracts.recoveryPlugin,
	RecoveryPlugin.abi,
	provider
);
// const delay = daysToMilliseconds(45);
const delay = 10; // 10 sec

export async function _isMethodEnabled(moduleId: number): Promise<boolean> {
	let ret;
	if (moduleId === 1) {
		ret = await plugin.isEcrecoverRecoverEnabled();
	} else if (moduleId === 2) {
		ret = await plugin.isWebAuthnRecoverEnabled();
	} else if (moduleId === 3) {
		ret = await plugin.isSecretRecoverEnabled();
	} else if (moduleId === 4) {
		ret = await plugin.isSocialRecoverEnabled();
	} else {
		return false;
	}
	return ret;
}

export async function _addEcrecoverRecover(
	safeSDK: any,
	address: string
): Promise<string> {
	// hash in circuit should also be pedersen
	const hashedAddr = await pedersen_new([address], 1);
	console.log("hashedAddr: ", hashedAddr);

	const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
	const addK256RecoverTx = pluginIface.encodeFunctionData(
		"addEcrecoverRecover",
		[delay, hashedAddr]
	);

	const safeTxData = {
		to: contracts.recoveryPlugin,
		data: addK256RecoverTx,
		value: "0",
	};

	await sendSafeTx(safeSDK, safeTxData);
	return address;
}

// costs about 1.6m gas
export async function _addWebAuthnRecover(safeSDK: Safe) {
	const safeAddr = await safeSDK.getAddress();
	const res = await getKeyPairAndID(safeAddr);

	console.log("res.id: ", res.id);
	console.log("res.pubkey: ", res.pubkey);
	console.log("res.pubkey: ", res.pubkeyHex);

	const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
	const addRecoveryData = pluginIface.encodeFunctionData("addWebAuthnRecover", [
		delay,
		res.pubkey,
		res.pubkeyHex[0],
		res.pubkeyHex[1],
		res.id,
	]);

	const safeTxData = {
		to: contracts.recoveryPlugin,
		data: addRecoveryData,
		value: "0",
	};

	await sendSafeTx(safeSDK, safeTxData);
}

function daysToMilliseconds(days) {
	return days * 24 * 60 * 60 * 1000;
}

export async function _addSecretRecover(safeSDK: any, secret: string) {
	// hash in circuit should also be pedersen
	const hashedSecret = await getHashFromSecret(secret);
	console.log("hashedSecret: ", hashedSecret);

	const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
	const addSecreRecoverTx = pluginIface.encodeFunctionData("addSecretRecover", [
		delay,
		hashedSecret,
	]);

	const safeTxData = {
		to: contracts.recoveryPlugin,
		data: addSecreRecoverTx,
		value: "0",
	};

	await sendSafeTx(safeSDK, safeTxData);
}

export async function _addSocialRecover(
	safeSDK: any,
	threshold: number,
	guardians: string[]
) {
	console.log("guardians: ", guardians);

	// hash in circuit should also be pedersen
	const merkleRoot = await getMerkleRootFromAddresses(guardians);

	const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
	const addSocialRecoverTx = pluginIface.encodeFunctionData(
		"addSocialRecover",
		[delay, threshold, merkleRoot]
	);

	const safeTxData = {
		to: contracts.recoveryPlugin,
		data: addSocialRecoverTx,
		value: "0",
	};

	await sendSafeTx(safeSDK, safeTxData);
}

export async function _proposeRecovery(
	method: number,
	signer: Signer,
	newThreshold: number,
	oldOwner: string,
	newOwner: string,
	secret: string,
	safeAddr: string
): Promise<string> {
	if (method === 1) {
		await _proposeEcrecoverRecover(signer, newThreshold, oldOwner, newOwner);
	} else if (method === 2) {
		await _proposeFingerPrintRecover(
			signer,
			newThreshold,
			oldOwner,
			newOwner,
			safeAddr
		);
	} else if (method === 3) {
		await _proposeSecretRecover(
			signer,
			newThreshold,
			oldOwner,
			newOwner,
			secret
		);
	} else if (method === 4) {
		await _proposeSocialRecover(signer, newThreshold, oldOwner, newOwner);
	} else {
		console.log("unrecognized method index");
		return "";
	}

	return newOwner;
}

export async function _proposeEcrecoverRecover(
	signer: Signer,
	newThreshold: number,
	oldOwner: string,
	newOwner: string
): Promise<string> {
	const msg = "k256";
	const signature: string = await signer.signMessage(msg);
	const msgHash: string = ethers.utils.hashMessage(msg);
	const pubkey: string = utils.recoverPublicKey(
		msgHash,
		utils.arrayify(signature)
	);

	const hashedAddr = await getHashedAddr();

	const ret = await generateProofK256(
		hashedAddr,
		arrayify(pubkey).slice(1, 65),
		arrayify(signature).slice(0, -1),
		arrayify(msgHash)
	);

	const plugin = new ethers.Contract(
		contracts.recoveryPlugin,
		RecoveryPlugin.abi,
		signer
	);

	const pubInputMsgHash = await parseUint8ArrayToBytes32(arrayify(msgHash));
	console.log("pubInputMsgHash: ", pubInputMsgHash);

	const txResponse = await (
		await plugin.proposeEcrecoverRecover(
			[oldOwner],
			[newOwner],
			newThreshold,
			//ret.proof,
			ret,
			pubInputMsgHash,
			{ gasLimit: 2000000 }
		)
	).wait();

	console.log("txResponse: ", txResponse);

	// testing purpose to increase block.timestamp
	await signer.sendTransaction({ to: await signer.getAddress() });

	return newOwner;
}

export async function _proposeFingerPrintRecover(
	signer: Signer,
	newThreshold: number,
	oldOwner: string,
	newOwner: string,
	safeAddr: string
) {
	const plugin = new ethers.Contract(
		contracts.recoveryPlugin,
		RecoveryPlugin.abi,
		signer
	);
	const credentialId = await getCredentialID(safeAddr);
	const [signature, webauthnInputs] = await authenticateWebAuthn(credentialId);
	//const pubkey = await getPubkeyByCredentialId([credentialId]);
	const pubkey = await getWebAuthnPubkey();

	console.log("webauthnInputs: ", webauthnInputs);
	console.log("signature: ", signature);

	console.log("pubkey: ", pubkey);

	const message = await computeMessage(webauthnInputs);
	console.log("message: ", message);

	const ret = await generateProofP256(
		arrayify(signature),
		arrayify(pubkey[0]),
		arrayify(pubkey[1]),
		arrayify(message)
	);

	// const pubInputMsgHash = await parseUint8ArrayToBytes32(arrayify(msgHash));
	// console.log("pubInputMsgHash: ", pubInputMsgHash);

	const txResponse = await (
		await plugin.proposeWebAuthnRecover(
			[oldOwner],
			[newOwner],
			newThreshold,
			ret,
			//ret.proof,
			webauthnInputs,
			{ gasLimit: 2000000 }
		)
	).wait();

	console.log("txResponse: ", txResponse);

	await sleep(10000); // Wait for 10 seconds
	// testing purpose to increase block.timestamp
	await signer.sendTransaction({ to: await signer.getAddress() });

	//return newOwner;
}
export async function _proposeSecretRecover(
	signer: Signer,
	newThreshold: number,
	oldOwner: string,
	newOwner: string,
	secret: string
) {
	console.log("oldOwner: ", oldOwner);
	console.log("newOwner: ", newOwner);
	console.log("newThreshold: ", newThreshold);

	const plugin = new ethers.Contract(
		contracts.recoveryPlugin,
		RecoveryPlugin.abi,
		signer
	);

	const ret = await generateProofSecret(secret);
	console.log("ret: ", ret);

	const txResponse = await (
		await plugin.proposeSecretRecover(
			[oldOwner],
			[newOwner],
			newThreshold,
			ret,
			//ret.proof,
			{ gasLimit: 2000000 }
		)
	).wait();

	console.log("txResponse: ", txResponse);

	await sleep(10000); // Wait for 10 seconds
	// testing purpose to increase block.timestamp
	await signer.sendTransaction({ to: await signer.getAddress() });
}

export async function _proposeSocialRecover(
	signer: Signer,
	newThreshold: number,
	oldOwner: string,
	newOwner: string
) {}

export async function _executeRecover(
	signer: Signer,
	proposalId: number
): Promise<boolean> {
	const plugin = new ethers.Contract(
		contracts.recoveryPlugin,
		RecoveryPlugin.abi,
		signer
	);

	const tx = await plugin.execRecovery(proposalId, { gasLimit: 500000 });
	await tx.wait();

	return true;
}

export async function getNewOwnerForPoposal(
	proposalId: number
): Promise<string> {
	const res = await plugin.getPendingNewOwners(proposalId);
	console.log("res: ", res);

	//plugin.
	return res[0];
}

export async function _getIsRecoveryExecutable(
	//signer: Signer,
	proposalId: number
): Promise<boolean> {
	return await plugin.getIsRecoveryExecutable(proposalId);

	// this func also takes into account that
	// previous swap execution may invalidates this one
}

export async function getHashedAddr(): Promise<string> {
	return await plugin.hashed_address();
}

export async function getRecoveryCount(): Promise<number> {
	return plugin.recoveryCount();
}

// async function test(msgHash: string, v, r, s) {
// 	const signature = Buffer.concat(
// 		[exports.setLength(r, 32), exports.setLength(s, 32)],
// 		64
// 	);
// 	const recovery = v - 27;
// 	if (recovery !== 0 && recovery !== 1) {
// 		throw new Error("Invalid signature v value");
// 	}
// 	const senderPubKey = ethers.utils.computePublicKey()(
// 		msgHash,
// 		signature,
// 		recovery
// 	);
// 	return secp256k1.publicKeyConvert(senderPubKey, false).slice(1);
// }

export async function parseUint8ArrayToBytes32(
	value: Uint8Array
): Promise<string[]> {
	let array: string[] = [];
	let i = 0;
	for (i; i < value.length; i++) {
		array[i] = utils.hexZeroPad(`0x${value[i].toString(16)}`, 32);
	}
	return array;
}

export async function getCredentialID(pluginAddr: any): Promise<string> {
	return plugin.credentialId();
}

export async function getWebAuthnPubkey(): Promise<any> {
	const pubkey = await plugin.getPubkeyXY();
	console.log("pubkey: ", pubkey);
	// const x = await plugin.getPubkeyXY()[0];
	// const y = await plugin.getPubkeyXY()[1];
	return pubkey;
}

export async function computeMessage(webAuthnInputs: any): Promise<string> {
	return await plugin._computeMessage(webAuthnInputs);
}

async function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
