import { ethers, Signer } from "ethers";
import { contracts } from "./constants/addresses";
import RecoveryPlugin from "./artifacts/contracts/RecoveryPluginNoir.json";
import { pedersen } from "./utils/pedersen";
import { sendSafeTx } from "./safe";
import { getKeyPairAndID } from "./webauthn-utils";
import Safe from "@safe-global/protocol-kit";
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

export async function _isMethodEnabled(moduleId: number): Promise<boolean> {
	const plugin = new ethers.Contract(
		contracts.recoveryPlugin,
		RecoveryPlugin.abi,
		provider
	);

	let ret;
	if (moduleId === 1) {
		ret = await plugin.isEcrecoverRecoverEnabled();
	} else if (moduleId === 2) {
		ret = await plugin.isWebAuthnRecoverEnabled();
	} else {
		return false;
	}
	return ret;
}

export async function _addEcrecoverRecover(
	safeSDK: any,
	address: string
): Promise<string> {
	const delay = daysToMilliseconds(45);
	//const delay = 10000; // 10 sec
	const hashedAddr = await pedersen(address, "0");

	const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
	const enablePluginTx = pluginIface.encodeFunctionData("addEcrecoverRecover", [
		delay,
		hashedAddr,
	]);

	const safeTxData = {
		to: contracts.recoveryPlugin,
		data: enablePluginTx,
		value: "0",
	};

	await sendSafeTx(safeSDK, safeTxData);
	return address;
}

// costs about 1.6m gas
export async function _addWebAuthnRecover(safeSDK: Safe) {
	const delay = daysToMilliseconds(45);
	//const delay = 10000; // 10 sec
	const safeAddr = await safeSDK.getAddress();
	const res = await getKeyPairAndID(safeAddr);

	console.log("res.id: ", res.id);
	console.log("res.pubkey: ", res.pubkey);

	const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
	const addRecoveryData = pluginIface.encodeFunctionData("addWebAuthnRecover", [
		delay,
		res.pubkey,
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
