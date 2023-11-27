import { Signer, ethers, Wallet } from "ethers";
import {
	RecoveryPlugin,
	RecoveryPluginFac,
	SafeProtocolManager,
	SafeAbi,
} from "../artifacts/contracts/index";
import { contracts, privatekeys } from "../constants/addresses";

export const provider = new ethers.providers.JsonRpcProvider(
	"http://127.0.0.1:8545"
);

export const nonce = async (address: string): Promise<number> => {
	return await provider.getTransactionCount(address);
};
export const dummyWallet = new Wallet(privatekeys[0], provider);

export const managerIface = new ethers.utils.Interface(SafeProtocolManager.abi);

export const manager = new ethers.Contract(
	contracts.safeProotcolManager,
	SafeProtocolManager.abi,
	provider
);

export const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);

export const recoveryPlugin = new ethers.Contract(
	contracts.recoveryPlugin,
	RecoveryPlugin.abi,
	provider
);

export const recoveryPluginSigner = (signer: Signer) => {
	return new ethers.Contract(
		contracts.recoveryPlugin,
		RecoveryPlugin.abi,
		signer
	);
};

export const pluginFac = new ethers.Contract(
	contracts.recoveryPluginFac,
	RecoveryPluginFac.abi,
	provider
);

export const safeContract = (safeAddr: string) => {
	return new ethers.Contract(safeAddr, SafeAbi, provider);
};
