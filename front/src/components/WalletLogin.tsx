import {
	Box,
	Input,
	Button,
	Text,
	useColorModeValue,
	Link,
	VStack,
} from "@chakra-ui/react";
import React, { useState, useContext } from "react";
import UserDataContext from "src/contexts/userData";
import {
	getSafeSDK,
	getSigner,
	supportedChainID,
	switchNetwork,
} from "../scripts/utils/login";
import {
	useWeb3ModalProvider,
	useWeb3ModalState,
	useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { getSafeOwners } from "src/scripts/utils/safe";

const WalletLogin: React.FC = () => {
	const { saveSafeAddress, saveSafeSDK, saveSigner } =
		useContext(UserDataContext);
	const { walletProvider } = useWeb3ModalProvider();

	const { chainId } = useWeb3ModalAccount();
	const { open, selectedNetworkId } = useWeb3ModalState();

	const [safeAddressInput, setSafeAddressInput] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

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

		const signer = await getSigner(walletProvider);
		console.log("signer: ", signer);
		if (!signer) {
			setErrorMessage("Please connect wallet first");
			return;
		}

		saveSigner(signer);

		if (safeAddressInput !== "") {
			saveSafeAddress(safeAddressInput, true);
			const safeSDK = await getSafeSDK(safeAddressInput, signer);
			if (safeSDK) {
				console.log("safeSDK: ", safeSDK);
				saveSafeSDK(safeSDK);
			} else {
				setErrorMessage("Failed to instantiate safeSDK");
			}
		} else {
			setErrorMessage("plsease connect wallet and set your safe address");
			return;
		}
	};

	const handleSafeAddressInput = async (address: string) => {
		setErrorMessage("");
		if (address !== "") {
			try {
				const owners = await getSafeOwners(address);
				console.log("owners: ", owners);
				if (owners.length === 1) {
					setSafeAddressInput(address);
				} else {
					setErrorMessage(
						"SafeRecover hasn't added support for Safe with multi signers yet"
					);
				}
			} catch (e) {
				console.log("e: ", e);
				setErrorMessage("Invalid Safe address");
			}
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
				<Text textAlign={"center"} fontSize="xl" fontWeight="bold" mb={3}>
					Connect wallet and enter your Safe Address!
				</Text>
				<VStack justifyContent={"center"} display={"flex"} gap={2}>
					<Text fontSize="15" mb={1}>
						1. Connect Safe owner's wallet via Wallet Connect <br />
						2. Enter your Safe address below <br />
						3. Press 'Enter the app' button <br />
					</Text>
					<Text fontSize={14} mb={5} color={"yellow.200"}>
						Note: please use signle-signer Safe, as this app hasn't <br />
						added support for multi-signer Safe yet.
					</Text>
				</VStack>
				<Box mb={4}>
					<Text mb={2}>Safe address:</Text>
					<Input
						placeholder="0xAbCd..."
						type="address"
						defaultValue={""}
						onChange={(e) => handleSafeAddressInput(e.target.value)}
					/>
				</Box>
				{errorMessage !== "" ? (
					<Text color="red.400" mb={5}>
						{errorMessage}
					</Text>
				) : null}
				<Button w="100%" onClick={onClickLogin}>
					Enter the app
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
