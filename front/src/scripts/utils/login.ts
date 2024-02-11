import { BrowserProvider, ethers, Signer } from "ethers";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";

const projectId = "50c757cbaeca7cb60747337b3eebaef9";
if (!projectId) {
	throw new Error("VITE_PROJECT_ID is not set");
}

const chains = [
	{
		chainId: 11155111,
		name: "Sepolia",
		currency: "ETH",
		explorerUrl: "https://sepolia.etherscan.io/",
		rpcUrl: "https://sepolia.gateway.tenderly.co",
	},
	// {
	// 	chainId: 5,
	// 	name: "Goerli",
	// 	currency: "ETH",
	// 	explorerUrl: "https://goerli.etherscan.io",
	// 	rpcUrl: "https://goerli.gateway.tenderly.co",
	// },
];

const ethersConfig = defaultConfig({
	metadata: {
		name: "Web3Modal",
		description: "Web3Modal Laboratory",
		url: "https://web3modal.com",
		icons: ["https://avatars.githubusercontent.com/u/37784886"],
	},
	// defaultChainId: 5,
	defaultChainId: 11155111,
	rpcUrl: "https://cloudflare-eth.com",
});

// 3. Create modal
createWeb3Modal({
	ethersConfig,
	chains,
	projectId,
	enableAnalytics: true,
});

// export const supportedChainID = 5;
export const supportedChainID = 11155111;

export const getSigner = async (walletProvider: any): Promise<Signer> => {
	console.log("getSigner walletProvider: ", walletProvider);
	const provider = new BrowserProvider(walletProvider);
	const signer = provider.getSigner();
	return signer;
};

export const switchNetwork = async (walletProvider: any) => {
	try {
		await walletProvider.request({
			method: "wallet_switchEthereumChain",
			params: [{ chainId: ethers.toQuantity(supportedChainID) }],
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
						chainId: ethers.toQuantity(supportedChainID),
						nativeCurrency: {
							name: "ETH",
							decimals: 18,
							symbol: "ETH",
						},
						rpcUrls: ["https://sepolia.gateway.tenderly.co"],
					},
				],
			});
		}
	}
};

export const getSafeSDK = async (
	safeAddr: string,
	signer: Signer
): Promise<Safe> => {
	const ethAdapter = new EthersAdapter({
		ethers,
		signerOrProvider: signer,
	});

	let safeSDK: Safe = null;

	try {
		safeSDK = await Safe.create({
			ethAdapter: ethAdapter,
			safeAddress: safeAddr,
			isL1SafeSingleton: true,
		});
	} catch {
		return null;
	}

	if ((await safeSDK.getOwners())[0] === (await signer.getAddress())) {
		return safeSDK;
	} else {
		console.log("not owner");
		return null;
	}
};
