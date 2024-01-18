import { useContext } from "react";
import { useViewContract } from "./index";
import { BrowserProvider, ethers, Signer } from "ethers";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import {
	createWeb3Modal,
	defaultConfig,
	useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { WALLET_CONNECT_PROJECT_ID, chainIds } from "src/scripts/constants";
import { UserDataContext } from "src/contexts/contextData";

const chains = [
	{
		chainId: 11155111,
		name: "Sepolia",
		currency: "ETH",
		explorerUrl: "https://sepolia.etherscan.io",
		rpcUrl: "wss://sepolia.gateway.tenderly.co",
	},
	{
		chainId: 5,
		name: "Goerli",
		currency: "ETH",
		explorerUrl: "https://goerli.etherscan.io",
		rpcUrl: "https://goerli.gateway.tenderly.co",
	},
];

const ethersConfig = defaultConfig({
	metadata: {
		name: "Web3Modal",
		description: "Web3Modal Laboratory",
		url: "https://web3modal.com",
		icons: ["https://avatars.githubusercontent.com/u/37784886"],
	},
	defaultChainId: 11155111,
	rpcUrl: "https://cloudflare-eth.com",
});

// 3. Create modal
createWeb3Modal({
	ethersConfig,
	chains,
	projectId: WALLET_CONNECT_PROJECT_ID,
	enableAnalytics: true,
});

const useLogin = () => {
	const { safeAddress } = useContext(UserDataContext);
	const { walletProvider } = useWeb3ModalProvider();
	const { getSafeOwner } = useViewContract();

	const getSigner = async (): Promise<Signer> => {
		console.log("getSigner walletProvider: ", walletProvider);
		const provider = new BrowserProvider(walletProvider);
		const signer = provider.getSigner();
		return signer;
	};

	const switchNetwork = async () => {
		try {
			await walletProvider.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: ethers.toQuantity(chainIds.goerli) }],
			});
			console.log("done");
		} catch (err) {
			// This error code indicates that the chain has not been added to MetaMask
			if (err.code === 4902) {
				await walletProvider.request({
					method: "wallet_addEthereumChain",
					params: [
						{
							chainName: "Sepolia",
							chainId: ethers.toQuantity(chainIds.goerli),
							nativeCurrency: {
								name: "ETH",
								decimals: 18,
								symbol: "ETH",
							},
							rpcUrls: ["https://sepolia.infura.io/v3/"],
						},
					],
				});
			}
		}
	};

	const getSafeSDK = async (
		signer: Signer,
		_safeAddress?: string
	): Promise<Safe> => {
		console.log("signer: ", signer);
		console.log("ethers: ", ethers);
		const ethAdapter = new EthersAdapter({
			ethers,
			signerOrProvider: signer,
		});

		let safeSDK: Safe = null;

		console.log("ethAdapter: ", ethAdapter);
		console.log("_safeAddress: ", _safeAddress);

		try {
			safeSDK = await Safe.create({
				ethAdapter: ethAdapter,
				safeAddress: _safeAddress ? _safeAddress : safeAddress,
				isL1SafeSingleton: true,
			});
			console.log("safeSDK t: ", safeSDK);
		} catch {
			return null;
		}

		const safeOwnerAddr = await getSafeOwner(safeSDK);
		console.log("safeOwnerAddr t: ", safeOwnerAddr);
		if (safeOwnerAddr === (await signer.getAddress())) {
			// if ((await safeSDK.getOwners())[0] === (await signer.getAddress())) {
			return safeSDK;
		} else {
			console.log("not owner");
			return null;
		}
	};

	return { getSigner, switchNetwork, getSafeSDK };
};

export default useLogin;
