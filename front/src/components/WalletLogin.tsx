import {
	Box,
	Input,
	Button,
	Text,
	useColorModeValue,
	Link,
} from "@chakra-ui/react";
import React, { useState, useContext, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import {
	getSafeSDK,
	supportedChainID,
	switchNetwork,
} from "../scripts/utils/login";
import {
	useWeb3Modal,
	useWeb3ModalProvider,
	useWeb3ModalState,
	useWeb3ModalAccount,
} from "@web3modal/ethers5/react";
import { providers, Signer } from "ethers";

const WalletLogin: React.FC = () => {
	const { safeAddress, saveSafeAddress, saveSafeSDK, saveSigner } =
		useContext(UserDataContext);
	const { walletProvider } = useWeb3ModalProvider();
	const modal = useWeb3Modal();
	const { chainId } = useWeb3ModalAccount();
	const { open, selectedNetworkId } = useWeb3ModalState();

	const [safeAddressInput, setSafeAddressInput] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	useEffect(() => {
		const timer = setTimeout(async () => {
			if (!walletProvider) {
				modal.open();
			}
		}, 10000);

		return () => clearTimeout(timer);
	}, [walletProvider, modal]);

	useEffect(() => {
		(async () => {
			console.log("walletProvider uf: ", walletProvider);
			if (walletProvider && chainId !== supportedChainID) {
				await switchNetwork(walletProvider);
			}
		})();
	});

	useEffect(() => {
		(async () => {
			if (walletProvider && safeAddress !== "") {
				try {
					// signer
					const signer = await getSigner();
					console.log("signer uf: ", signer);
					if (signer) saveSigner(signer);

					// safe sdk
					const safeSDK = await getSafeSDK(safeAddress, signer);
					if (safeSDK) {
						saveSafeSDK(safeSDK);
					}
				} catch (e) {
					console.log("e:", e);
				}
			}
		})();
	});

	const getSigner = async (): Promise<Signer> => {
		console.log("getSigner walletProvider: ", walletProvider);
		const provider = new providers.Web3Provider(walletProvider);
		const signer: Signer = provider.getSigner(0);
		return signer;
	};

	const onClickLogin = async () => {
		setErrorMessage("");

		console.log("selectedNetworkId: ", selectedNetworkId);
		console.log("open: ", open);

		if (!walletProvider) {
			setErrorMessage("Please connect your wallet");
			return;
		}

		console.log("chainId: ", chainId);
		console.log("selectedChainid: ", selectedNetworkId);
		if (chainId !== supportedChainID) {
			await switchNetwork(walletProvider);
		}

		const signer = await getSigner();
		console.log("signer: ", signer);
		if (!signer) {
			setErrorMessage("Please connect wallet first");
			return;
		}

		if (safeAddressInput !== "") {
			saveSafeAddress(safeAddressInput, true);
			const safeSDK = await getSafeSDK(safeAddressInput, signer);
			if (safeSDK) {
				saveSafeSDK(safeSDK);
			} else {
				setErrorMessage("Failed to instantiate safeSDK");
			}
		} else {
			setErrorMessage("plsease connect wallet and set your safe address");
			return;
		}
	};

	return (
		<Box>
			<Text
				mt={7}
				variant="h2"
				fontSize={30}
				textAlign="center"
				color={useColorModeValue("white", "")}
			>
				Safe Recovery Plugin powered by Noir ZKP
			</Text>
			<Box
				p={8}
				mx="auto"
				mt={20}
				borderRadius="lg"
				boxShadow="lg"
				backgroundColor={"#2e2e2e"}
			>
				<Text fontSize="xl" fontWeight="bold" mb={6}>
					Connect to wallet with your Safe Address
				</Text>
				<Box mb={4}>
					<Text mb={2}>Safe address:</Text>
					<Input
						placeholder="0xAbCd..."
						type="address"
						defaultValue={""}
						onChange={(e) => setSafeAddressInput(e.target.value)}
					/>
				</Box>
				<Text color="red.400" mb={10}>
					{errorMessage}
				</Text>
				<Button w="100%" onClick={onClickLogin}>
					Login
				</Button>
				<Text mt={7}>
					Don't have a Safe wallet?{" "}
					<Link
						ml={2}
						color="yellow.500"
						href="https://app.safe.global/new-safe/create"
						isExternal
						textDecoration="underline"
					>
						Create a new Safe
					</Link>
				</Text>
				{/* */}
			</Box>
		</Box>
	);
};

export default WalletLogin;
