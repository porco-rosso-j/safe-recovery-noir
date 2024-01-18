import { Contract, ethers, JsonRpcProvider, Signer, Wallet } from "ethers";
import {
	RecoveryPlugin,
	RecoveryPluginFac,
	SafeProtocolManager,
	SafeProtocolRegistry,
} from "src/scripts/artifacts/contracts/index";
import {
	LOCAL_URL,
	ALCHEMY_GOERLI,
	ALCHEMY_SEPOLIA,
	ENV,
} from "src/scripts/constants";

export const managerIface = new ethers.Interface(SafeProtocolManager.abi);

export const pluginIface = new ethers.Interface(RecoveryPlugin.abi);

export const pluginFacIface = new ethers.Interface(RecoveryPluginFac.abi);

export const provider = (chainId: number) => {
	let JSON_RPC_URL = "";

	if (ENV === "LOCAL") {
		JSON_RPC_URL = LOCAL_URL;
	} else {
		console.log("here.....: ");
		if (chainId === 5) {
			JSON_RPC_URL = ALCHEMY_GOERLI;
			console.log("JSON_RPC_URL..: ", JSON_RPC_URL);
		} else if (chainId === 11155111) {
			JSON_RPC_URL = ALCHEMY_SEPOLIA;
		} else {
			return;
		}

		return new JsonRpcProvider(JSON_RPC_URL);
	}
};

export const factory = (factoryAddr: string, chainId: number) => {
	return new ethers.Contract(
		factoryAddr,
		RecoveryPluginFac.abi,
		provider(chainId)
	);
};

export const registry = (registryAddr: string, chainId: number) => {
	return new ethers.Contract(
		registryAddr,
		SafeProtocolRegistry.abi,
		provider(chainId)
	);
};

export const manager = (managerAddr: string, chainId: number) => {
	return new ethers.Contract(
		managerAddr,
		SafeProtocolManager.abi,
		provider(chainId)
	);
};

export const plugin = (pluginAddr: string, chainId: number) => {
	return new ethers.Contract(pluginAddr, RecoveryPlugin.abi, provider(chainId));
};

export const pluginSigner = (pluginAddr: string, signer: Signer) => {
	return new ethers.Contract(pluginAddr, RecoveryPlugin.abi, signer);
};
