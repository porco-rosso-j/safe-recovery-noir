import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import Safe, {
	SwapOwnerTxParams,
	ContractNetworksConfig,
} from "@safe-global/protocol-kit";
import { SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types";
import { ethers } from "ethers";
import { contracts } from "./constants/addresses";
import RecoveryPlugin from "./artifacts/RecoveryPluginNoir.json";
import RecoveryPluginFac from "./artifacts/RecoveryPluginNoirFactory.json";
import SafeProtocolManager from "./artifacts/SafeProtocolManager.json";
import SafeAbi from "./artifacts/Safe.json";

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
// const provider = new ethers.providers.JsonRpcProvider(
// 	"https://rpc.ankr.com/eth_goerli"
// );

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

	const managerIface = new ethers.utils.Interface(SafeProtocolManager.abi);
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

async function sendSafeTx(
	safeSDK: Safe,
	safeTx: SafeTransactionDataPartial
): Promise<any> {
	const safeTransaction = await safeSDK.createTransaction({
		safeTransactionData: safeTx,
	});
	console.log("safeTransaction: ", safeTransaction);
	const txResponse = await safeSDK.executeTransaction(safeTransaction, {
		gasLimit: 300000,
	});
	console.log("txResponse: ", txResponse);
	const res = await txResponse.transactionResponse?.wait();
	console.log("res:", res);
}

export async function _proposeRecoveryWebAuthn(
	pluginAddr: string,
	oldOwnerAddresses: string[],
	newOwnerAddresses: string[],
	newThreshold: number,
	webauthnInputs: any
) {
	const recoveryPlugin = new ethers.Contract(
		pluginAddr,
		RecoveryPlugin.abi,
		provider
	);
	let proof;

	try {
		const tx = await (
			await recoveryPlugin.proposeWebAuthnRecovery(
				oldOwnerAddresses,
				newOwnerAddresses,
				newThreshold,
				proof,
				webauthnInputs,
				{
					gasLimit: 1000000,
				}
			)
		).wait();
		console.log("txhash: ", tx.transactionHash);
	} catch (e) {
		console.log("e: ", e);
	}
}

export async function _executeRecover(pluginAddr: string, recoveryId: number) {
	const recoveryPlugin = new ethers.Contract(
		pluginAddr,
		RecoveryPlugin.abi,
		provider
	);

	try {
		const tx = await (
			await recoveryPlugin.proposeWebAuthnRecovery(recoveryId, {
				gasLimit: 1000000,
			})
		).wait();
		console.log("txhash: ", tx.transactionHash);
	} catch (e) {
		console.log("e: ", e);
	}
}

export async function getSafePluginAddress(safeAddr: any): Promise<string> {
	const pluginFac = new ethers.Contract(
		contracts.recoveryPluginFac,
		RecoveryPluginFac.abi,
		provider
	);
	return await pluginFac.getPluginAddr(safeAddr);
}

export async function isPluginEnabled(
	safe: string,
	pluginAddr: string
): Promise<boolean> {
	const manager = new ethers.Contract(
		contracts.safeProotcolManager,
		SafeProtocolManager.abi,
		provider
	);
	// console.log("wat: ", );
	return await manager.isPluginEnabled(safe, pluginAddr);
}

// export async function isPluginEnabled(pluginAddr: any): Promise<boolean> {
// 	const plugin = new ethers.Contract(pluginAddr, RecoveryPlugin.abi, provider);
// 	console.log("wat: ", await plugin.isWebAuthnRecoverEnabled());
// 	return await plugin.isWebAuthnRecoverEnabled();
// }

export async function getSafeOwners(safe: string): Promise<string[]> {
	const safeContract = new ethers.Contract(safe, SafeAbi, provider);
	// console.log("wat: ", );
	return await safeContract.getOwners();
}

export async function getCredentialID(pluginAddr: any): Promise<string> {
	const plugin = new ethers.Contract(pluginAddr, RecoveryPlugin.abi, provider);
	return await plugin.credentialId();
}
