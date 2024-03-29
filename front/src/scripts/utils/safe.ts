import Safe from "@safe-global/protocol-kit";
import {
	SafeTransactionDataPartial,
	MetaTransactionData,
} from "@safe-global/safe-core-sdk-types";
import { ethers } from "ethers";
import { contracts } from "../constants/addresses";
import {
	managerIface,
	manager,
	registry,
	pluginFac,
	pluginFacIface,
	safeContract,
} from "./contracts";
import { _isSafeModuleEnabled } from "../plugins/view";
import { txResult, error } from "../plugins/types";

// make this batch : enable manager on Safe & deploy safeRecover
// add module on registry
export async function enableModuleOnSafe(
	safeSDK: Safe,
	safeAddress: string
): Promise<[txResult, any]> {
	console.log("safeSDK: ", safeSDK);
	console.log("contracts.safeProotcolManager: ", contracts.safeProotcolManager);
	console.log("safeAddress: ", safeAddress);
	const pluginDeployTx = pluginFacIface.encodeFunctionData(
		"createRecoveryPluginNoir",
		[safeAddress, 0]
	);

	const enableModuletx = await safeSDK.createEnableModuleTx(
		contracts.safeProotcolManager
	);

	const safeTransactionData: MetaTransactionData[] = [
		// factory.createRecoveryPluginNoir()
		{
			to: contracts.recoveryPluginFac,
			data: pluginDeployTx,
			value: "0",
		},
		// safe.enableModule(manager)
		{
			to: enableModuletx.data.to,
			data: enableModuletx.data.data,
			value: enableModuletx.data.value,
		},
	];

	const batchResult = await sendSafeTx(safeSDK, safeTransactionData);

	// check deployment and safe tx
	const isModuleEnabled = await _isSafeModuleEnabled(
		safeSDK,
		contracts.safeProotcolManager
	);

	const pluginAddress = await getSafePluginAddress(safeAddress);
	// contracts.recoveryPlugin = pluginAddress;

	console.log("pluginAddress: ", pluginAddress);
	console.log("isModuleEnabled: ", isModuleEnabled);
	if (isModuleEnabled && pluginAddress !== "") {
		return [batchResult, pluginAddress];
	} else {
		return [error, ""];
	}
}

export async function addModule(pluginAddress: string): Promise<txResult> {
	try {
		const tx = await registry.addModule(pluginAddress, 1, {
			gasLimit: 200000,
		});
		await tx.wait();
		return { result: true, txHash: tx.hash };
	} catch (e) {
		console.log("error:", e);
		return error;
	}
}

export async function enablePluginOnProtocolManager(
	safeAddr: string,
	safeSDK: Safe,
	pluginAddr: string
): Promise<txResult> {
	const enablePluginTx = managerIface.encodeFunctionData("enablePlugin", [
		pluginAddr,
		2,
	]);

	console.log("enablePluginTx: ", enablePluginTx);
	const _data = ethers.solidityPacked(
		["bytes", "address"],
		[enablePluginTx, safeAddr]
	);
	console.log("data: ", _data);

	const enablePluginTxData: SafeTransactionDataPartial = {
		to: contracts.safeProotcolManager,
		data: _data,
		value: "0",
	};

	return await sendSafeTx(safeSDK, [enablePluginTxData]);
}

export async function sendSafeTx(
	safeSDK: Safe,
	safeTx: MetaTransactionData[]
): Promise<txResult> {
	try {
		const safeTransaction = await safeSDK.createTransaction({
			transactions: safeTx,
		});
		console.log("safeTransaction: ", safeTransaction);
		const txResponse = await safeSDK.executeTransaction(safeTransaction, {
			gasLimit: 1000000,
		});
		console.log("txResponse: ", txResponse);
		const res: ethers.ContractTransactionReceipt =
			await txResponse.transactionResponse?.wait();
		console.log("res:", res);

		return { result: true, txHash: res.hash };
	} catch (e) {
		console.log("error: ", e);
		return error;
	}
}

export async function getSafePluginAddress(safeAddr: string): Promise<string> {
	try {
		return await pluginFac.getPluginAddr(safeAddr);
	} catch (e) {
		console.log("erorr:", e);
		return "";
	}
	// return await pluginFac.getPluginAddr(safeAddr);
}

export async function getIsPluginEnabled(
	safe: string,
	pluginAddr: string
): Promise<boolean> {
	return await manager.isPluginEnabled(safe, pluginAddr);
}

export async function getSafeOwner(safe: string): Promise<string> {
	const owners = await safeContract(safe).getOwners();
	return owners[0];
}

export async function getSafeOwners(safe: string): Promise<string[]> {
	return await safeContract(safe).getOwners();
}

// async function computePluginAddr(safeAddr: string): Promise<string> {
// 	return await pluginFac.getAddress(safeAddr, 0);
// }
