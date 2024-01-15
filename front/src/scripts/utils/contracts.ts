import { Signer, ethers, Wallet } from "ethers";
import {
	RecoveryPlugin,
	RecoveryPluginFac,
	SafeProtocolManager,
	SafeAbi,
	SafeProtocolRegistry,
} from "../artifacts/contracts/index";
import { contracts, privatekeys } from "../constants/addresses";

const ALCHEMY_GOERLI = process.env.REACT_APP_ALCHEMY_GOERLI;
const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
export const provider = new ethers.JsonRpcProvider(
	process.env.REACT_APP_ENV === "LOCAL"
		? "http://127.0.0.1:8545"
		: ALCHEMY_GOERLI
);

export const nonce = async (address: string): Promise<number> => {
	return await provider.getTransactionCount(address);
};
export const dummyWallet = new Wallet(privatekeys[0], provider);

export const managerIface = new ethers.Interface(SafeProtocolManager.abi);

export const manager = new ethers.Contract(
	contracts.safeProotcolManager,
	SafeProtocolManager.abi,
	provider
);

export const registry = new ethers.Contract(
	contracts.safeProtocolRegistry,
	SafeProtocolRegistry.abi,
	new Wallet(PRIVATE_KEY, provider)
);

export const pluginIface = new ethers.Interface(RecoveryPlugin.abi);
export const pluginFacIface = new ethers.Interface(RecoveryPluginFac.abi);

export const pluginFac = new ethers.Contract(
	contracts.recoveryPluginFac,
	RecoveryPluginFac.abi,
	provider
);

export const recoveryPluginContract = (pluginAddr: string) => {
	return new ethers.Contract(pluginAddr, RecoveryPlugin.abi, provider);
};

export const recoveryPluginSigner = (signer: Signer, pluginAddr: string) => {
	return new ethers.Contract(pluginAddr, RecoveryPlugin.abi, signer);
};

export const safeContract = (safeAddr: string) => {
	return new ethers.Contract(safeAddr, SafeAbi, provider);
};
