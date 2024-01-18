/* eslint-disable @typescript-eslint/no-use-before-define */
import { useContext, useEffect, useState } from "react";
import { Contract, ethers } from "ethers";
import { RecoveryPlugin } from "src/scripts/artifacts/contracts/index";
import { ContractDataContext, UserDataContext } from "src/contexts/contextData";

const usePluginData = () => {
	// const { signer } = useContext(UserDataContext);
	// const { , pluginAddress } =
	// 	useContext(ContractDataContext);
	// const [recoveryPluginContract, setRecoveryPluginContract] =
	// 	useState<Contract>(null);
	// const [recoveryPluginSigner, setRecoveryPluginSigner] =
	// 	useState<Contract>(null);
	// useEffect(() => {
	// 	if (provider && signer && contractAddrs) {
	// 		if (pluginAddress && provider) {
	// 			setRecoveryPluginContract(
	// 				new ethers.Contract(pluginAddress, RecoveryPlugin.abi, signer)
	// 			);
	// 			setRecoveryPluginSigner(
	// 				new ethers.Contract(pluginAddress, RecoveryPlugin.abi, signer)
	// 			);
	// 		}
	// 	}
	// }, [provider, contractAddrs, pluginAddress, signer]);
	// return {
	// 	recoveryPluginContract,
	// 	recoveryPluginSigner,
	// };
};

export default usePluginData;
