import Safe from "@safe-global/protocol-kit";
import { SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types";
import { ethers } from "ethers";
import { contracts } from "../constants/addresses";
import { managerIface, manager, pluginFac, safeContract } from "./contracts";

export async function enablePlugin(
	safeAddr: string,
	safeSDK: Safe
): Promise<any> {
	const enableModuletx = await safeSDK.createEnableModuleTx(
		contracts.safeProotcolManager
	);

	const enableModuleTx: SafeTransactionDataPartial = {
		to: enableModuletx.data.to,
		data: enableModuletx.data.data,
		value: enableModuletx.data.value,
	};

	await sendSafeTx(safeSDK, enableModuleTx);

	// const managerIface = new ethers.utils.Interface(SafeProtocolManager.abi);
	const enablePluginTx = managerIface.encodeFunctionData("enablePlugin", [
		contracts.recoveryPlugin,
		2,
	]);

	console.log("enablePluginTx: ", enablePluginTx);
	const _data = ethers.utils.solidityPack(
		["bytes", "address"],
		[enablePluginTx, safeAddr]
	);
	console.log("data: ", _data);

	// enablePlugin(plugin)
	const enablePluginTxData: SafeTransactionDataPartial = {
		to: contracts.safeProotcolManager,
		data: _data,
		value: "0",
	};

	await sendSafeTx(safeSDK, enablePluginTxData);
}

export async function sendSafeTx(
	safeSDK: Safe,
	safeTx: SafeTransactionDataPartial
): Promise<any> {
	const safeTransaction = await safeSDK.createTransaction({
		safeTransactionData: safeTx,
	});
	console.log("safeTransaction: ", safeTransaction);
	const txResponse = await safeSDK.executeTransaction(safeTransaction, {
		gasLimit: 3000000,
	});
	console.log("txResponse: ", txResponse);
	const res = await txResponse.transactionResponse?.wait();
	console.log("res:", res);
}

export async function getSafePluginAddress(safeAddr: any): Promise<string> {
	return await pluginFac.getPluginAddr(safeAddr);
}

export async function isPluginEnabled(safe: string): Promise<boolean> {
	return await manager.isPluginEnabled(safe, contracts.recoveryPlugin);
}

export async function getSafeOwners(safe: string): Promise<string[]> {
	return await safeContract(safe).getOwners();
}
