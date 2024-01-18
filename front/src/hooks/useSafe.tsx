import { useContext } from "react";
import { error, txResult } from "src/scripts/types";
import {
	MetaTransactionData,
	SafeTransactionDataPartial,
} from "@safe-global/safe-core-sdk-types";
import { ContractTransactionResponse, ethers } from "ethers";
import useViewContract from "./useViewContract";
import { ContractDataContext, UserDataContext } from "src/contexts/contextData";
import { chainIds } from "src/scripts/constants";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";
import {
	managerIface,
	pluginFacIface,
	registry,
} from "src/scripts/utils/contracts";

const useSafe = () => {
	const { safeSDK, safeAddress } = useContext(UserDataContext);
	const { managerAddr, pluginFacAddr } = useContext(ContractDataContext);
	const { chainId } = useWeb3ModalAccount();
	const { getSafePluginAddress } = useViewContract();

	async function enableModuleOnSafe(): Promise<[txResult, string]> {
		const pluginDeployTx = pluginFacIface.encodeFunctionData(
			"createRecoveryPluginNoir",
			[safeAddress, 0]
		);

		const enableModuletx = await safeSDK.createEnableModuleTx(managerAddr);

		const safeTransactionData: MetaTransactionData[] = [
			// factory.createRecoveryPluginNoir()
			{
				to: pluginFacAddr,
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

		const batchResult = await sendSafeTx(safeTransactionData);

		// check deployment and safe tx
		const isModuleEnabled = await safeSDK.isModuleEnabled(managerAddr);

		const pluginAddress = await getSafePluginAddress();
		// contracts.recoveryPlugin = pluginAddress;

		console.log("pluginAddress: ", pluginAddress);
		console.log("isModuleEnabled: ", isModuleEnabled);

		if (isModuleEnabled && pluginAddress !== "") {
			return [batchResult, pluginAddress];
		} else {
			return [error, ""];
		}
	}

	async function addModule(pluginAddress: string): Promise<txResult> {
		try {
			const registryContract = registry(pluginAddress, chainId);
			const tx: ContractTransactionResponse = await registryContract.addModule(
				pluginAddress,
				1,
				{
					gasLimit: 200000,
				}
			);
			await tx.wait();
			return { result: true, txHash: tx.hash };
		} catch (e) {
			console.log("error:", e);
			return error;
		}
	}

	async function enablePluginOnProtocolManager(
		pluginAddress: string
	): Promise<txResult> {
		const enablePluginTx = managerIface.encodeFunctionData("enablePlugin", [
			// contracts.recoveryPlugin,
			pluginAddress,
			2,
		]);

		console.log("enablePluginTx: ", enablePluginTx);
		/*
        ethers.solidityPackedKeccak256(types, values)
        ethers.solidityPackedSha256(types, values)
        */
		const _data = ethers.solidityPacked(
			["bytes", "address"],
			[enablePluginTx, safeAddress]
		);
		console.log("data: ", _data);

		const enablePluginTxData: SafeTransactionDataPartial = {
			to: managerAddr,
			data: _data,
			value: "0",
		};

		return await sendSafeTx([enablePluginTxData]);
	}

	async function sendSafeTx(safeTx: MetaTransactionData[]): Promise<txResult> {
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
	return {
		enableModuleOnSafe,
		enablePluginOnProtocolManager,
		addModule,
		sendSafeTx,
	};
};

export default useSafe;
