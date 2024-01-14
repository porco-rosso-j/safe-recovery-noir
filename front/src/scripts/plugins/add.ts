import Safe from "@safe-global/protocol-kit";
import { sendSafeTx } from "../utils/safe";
import { pedersenHash } from "../utils/pedersen";
import { getKeyPairAndID } from "../utils/webauthn/webauthn";
import { getMerkleRootFromAddresses } from "../utils/merkle/merkle-helper";
import { getHashFromSecret } from "../utils/secret";
import { pluginIface } from "../utils/contracts";
import { txResult, error } from "./types";

export async function _addEcrecoverRecover(
	safeSDK: any,
	pluginAddr: string,
	address: string,
	timelock: number = 1
): Promise<txResult> {
	const hashedAddr = await pedersenHash([address]);
	console.log("hashedAddr: ", hashedAddr);

	const addK256RecoverTx = pluginIface.encodeFunctionData(
		"addEcrecoverRecover",
		[timelock, hashedAddr]
	);

	const safeTxData = {
		to: pluginAddr,
		data: addK256RecoverTx,
		value: "0",
	};

	return await sendSafeTx(safeSDK, safeTxData);
}

// costs about 1.6m gas
export async function _addWebAuthnRecover(
	safeSDK: Safe,
	pluginAddr: string,
	timelock: number = 1
): Promise<txResult> {
	const safeAddr = await safeSDK.getAddress();

	let res;
	try {
		res = await getKeyPairAndID(safeAddr);
	} catch (e) {
		console.log("res: ", res);
		return error;
	}

	console.log("res.id: ", res.id);
	console.log("res.pubkey: ", res.pubkeyHex);

	const addRecoveryData = pluginIface.encodeFunctionData("addWebAuthnRecover", [
		timelock,
		res.pubkeyHex[0],
		res.pubkeyHex[1],
		res.id,
	]);

	const safeTxData = {
		to: pluginAddr,
		data: addRecoveryData,
		value: "0",
	};

	return await sendSafeTx(safeSDK, safeTxData);
}

export async function _addSecretRecover(
	safeSDK: any,
	pluginAddr: string,
	timelock: number = 1,
	secret: string
): Promise<txResult> {
	// hash in circuit should also be pedersen
	const hashedSecret = await getHashFromSecret(secret);
	console.log("hashedSecret: ", hashedSecret);

	// const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
	const addSecreRecoverTx = pluginIface.encodeFunctionData("addSecretRecover", [
		timelock,
		hashedSecret,
	]);

	const safeTxData = {
		to: pluginAddr,
		data: addSecreRecoverTx,
		value: "0",
	};

	return await sendSafeTx(safeSDK, safeTxData);
}

export async function _addSocialRecover(
	safeSDK: any,
	pluginAddr: string,
	timelock: number = 1,
	threshold: number,
	guardians: string[]
): Promise<txResult> {
	console.log("guardians: ", guardians);

	// hash in circuit should also be pedersen
	const merkleRoot = await getMerkleRootFromAddresses(guardians);
	const addSocialRecoverTx = pluginIface.encodeFunctionData(
		"addSocialRecover",
		[timelock, threshold, merkleRoot]
	);

	const safeTxData = {
		to: pluginAddr,
		data: addSocialRecoverTx,
		value: "0",
	};

	return await sendSafeTx(safeSDK, safeTxData);
}
