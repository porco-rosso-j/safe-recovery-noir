import { ethers, Signer } from "ethers";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";

const projectId = "50c757cbaeca7cb60747337b3eebaef9";
if (!projectId) {
	throw new Error("VITE_PROJECT_ID is not set");
}

const chains = [
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
	defaultChainId: 5,
	rpcUrl: "https://cloudflare-eth.com",
});

// 3. Create modal
createWeb3Modal({
	ethersConfig,
	chains,
	projectId,
	enableAnalytics: true,
	// themeMode: "light",
	// themeVariables: {
	// 	"--w3m-color-mix": "#00DCFF",
	// 	"--w3m-color-mix-strength": 20,
	// },
});

// declare global {
// 	interface Window {
// 		ethereum: any;
// 	}
// }

export const supportedChainID = 5;

// export const getSigner = async (): Promise<Signer> => {
// 	const provider = new providers.Web3Provider(window.ethereum);
// 	await provider.send("eth_requestAccounts", []);
// 	const signer: Signer = provider.getSigner(0);
// 	console.log("signer: ", signer);
// 	return signer;
// };

// export const switchNetwork = async () => {
// 	if (window.ethereum.networkVersion !== supportedChainID) {
// 		try {
// 			// await window.ethereum.request({
// 			// 	method: "wallet_switchEthereumChain",
// 			// 	params: [{ chainId: ethers.utils.hexValue(supportedChainID) }],
// 			// });

// 			console.log("done");
// 		} catch (err) {
// 			// This error code indicates that the chain has not been added to MetaMask
// 			if (err.code === 4902) {
// 				// await window.ethereum.request({
// 				// 	method: "wallet_addEthereumChain",
// 				// 	params: [
// 				// 		{
// 				// 			chainName: "Goerli",
// 				// 			chainId: ethers.utils.hexValue(supportedChainID),
// 				// 			nativeCurrency: {
// 				// 				name: "ETH",
// 				// 				decimals: 18,
// 				// 				symbol: "ETH",
// 				// 			},
// 				// 			rpcUrls: ["https://goerli.infura.io/v3/"],
// 				// 		},
// 				// 	],
// 				// });
// 			}
// 		}
// 	}
// };

export const switchNetwork = async (walletProvider: any) => {
	try {
		await walletProvider.request({
			method: "wallet_switchEthereumChain",
			params: [{ chainId: ethers.utils.hexValue(supportedChainID) }],
		});
		console.log("done");
	} catch (err) {
		// This error code indicates that the chain has not been added to MetaMask
		if (err.code === 4902) {
			await walletProvider.request({
				method: "wallet_addEthereumChain",
				params: [
					{
						chainName: "Goerli",
						chainId: ethers.utils.hexValue(supportedChainID),
						nativeCurrency: {
							name: "ETH",
							decimals: 18,
							symbol: "ETH",
						},
						rpcUrls: ["https://goerli.infura.io/v3/"],
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

	let safeSDK;
	try {
		console.log("safeAddr: ", safeAddr);
		safeSDK = await Safe.create({
			ethAdapter: ethAdapter,
			safeAddress: safeAddr,
			isL1SafeMasterCopy: true,
		});
		console.log("safeSDK: ", safeSDK);
	} catch {
		// setErrorMessage("Failed to set SafeSDK");
		console.log("Failed to set SafeSDK", safeSDK);
		return null;
	}

	if ((await safeSDK.getOwners())[0] === (await signer.getAddress())) {
		// saveSafeSDK(safeSDK);
		return safeSDK;
	} else {
		console.log("not owner");
		return null;
	}
};
