import Safe from "@safe-global/protocol-kit";
import { sendSafeTx } from "../utils/safe";
import { contracts } from "../constants/addresses";
import { pedersenHash } from "../utils/pedersen";
import { getKeyPairAndID } from "../utils/webauthn/webauthn";
import { getMerkleRootFromAddresses } from "../utils/merkle/merkle-helper";
import { getHashFromSecret } from "../utils/secret";
import { pluginIface } from "../utils/contracts";

// const delay = daysToMilliseconds(45);
const delay = 10; // 10 sec

export async function _addEcrecoverRecover(
	safeSDK: any,
	address: string
): Promise<string> {
	// hash in circuit should also be pedersen
	const hashedAddr = await pedersenHash([address]);
	console.log("hashedAddr: ", hashedAddr);

	// const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
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

	// const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
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

export async function _addSecretRecover(safeSDK: any, secret: string) {
	// hash in circuit should also be pedersen
	const hashedSecret = await getHashFromSecret(secret);
	console.log("hashedSecret: ", hashedSecret);

	// const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
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

	// const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
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
