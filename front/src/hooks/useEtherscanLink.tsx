import { useWeb3ModalAccount } from "@web3modal/ethers/react";

const useEtherscanLink = () => {
	const { chainId } = useWeb3ModalAccount();

	const etherscanLink = (txHash: string) => {
		let chainName = "";
		if (chainId === 5) {
			chainName = "goerli";
		} else if (chainId === 11155111) {
			chainName = "sepolia";
		}

		return "https://" + chainName + ".etherscan.io/tx/" + txHash;
	};

	return { etherscanLink };
};

export default useEtherscanLink;
