import Safe from "@safe-global/protocol-kit";
import { SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types";
import { ethers } from "ethers";
import { contracts } from "../constants/addresses";
import { managerIface, manager, pluginFac, safeContract } from "./contracts";
import { _isSafeModuleEnabled } from "../plugins/view";
import { txResult, error } from "../plugins/types";

export async function enableModuleOnSafe(safeSDK: Safe): Promise<txResult> {
	const enableModuletx = await safeSDK.createEnableModuleTx(
		contracts.safeProotcolManager
	);

	const enableModuleTx: SafeTransactionDataPartial = {
		to: enableModuletx.data.to,
		data: enableModuletx.data.data,
		value: enableModuletx.data.value,
	};

	const enableModuleResult = await sendSafeTx(safeSDK, enableModuleTx);
	const isModuleEnabled = await _isSafeModuleEnabled(
		safeSDK,
		contracts.safeProotcolManager
	);
	console.log("isModuleEnabled: ", isModuleEnabled);
	if (!isModuleEnabled) {
		return {
			result: enableModuleResult.result,
			txHash: enableModuleResult.txHash,
		};
	}

	return enableModuleResult;
}

export async function enablePluginOnProtocolManager(
	safeAddr: string,
	safeSDK: Safe
): Promise<txResult> {
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

	const enablePluginTxData: SafeTransactionDataPartial = {
		to: contracts.safeProotcolManager,
		data: _data,
		value: "0",
	};

	return await sendSafeTx(safeSDK, enablePluginTxData);
}

export async function sendSafeTx(
	safeSDK: Safe,
	safeTx: SafeTransactionDataPartial
): Promise<txResult> {
	try {
		const safeTransaction = await safeSDK.createTransaction({
			safeTransactionData: safeTx,
		});
		console.log("safeTransaction: ", safeTransaction);
		const txResponse = await safeSDK.executeTransaction(safeTransaction, {
			gasLimit: 3000000,
		});
		console.log("txResponse: ", txResponse);
		const res: ethers.ContractReceipt =
			await txResponse.transactionResponse?.wait();
		console.log("res:", res);

		return { result: true, txHash: res.transactionHash };
	} catch (e) {
		console.log("error: ", e);
		return error;
	}
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
