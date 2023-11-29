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
import { getSafeSDK, getSigner, switchNetwork } from "../scripts/utils/login";

const WalletLogin: React.FC = () => {
	const { saveSafeAddress, saveSafeSDK, saveSigner } =
		useContext(UserDataContext);
	const [safeAddressInput, setSafeAddressInput] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	useEffect(() => {
		(async () => {
			await switchNetwork();
		})();
	});

	useEffect(() => {
		(async () => {
			try {
				const signer = await getSigner();
				if (signer) saveSigner(signer);

				const storedData = localStorage.getItem(`safe_address`);
				const _safeAddress = storedData ? JSON.parse(storedData) : undefined;
				console.log("_safeAddress: ", _safeAddress);
				if (_safeAddress) {
					saveSafeAddress(_safeAddress);
					const safeSDK = await getSafeSDK(_safeAddress, signer);
					if (safeSDK) {
						saveSafeSDK(safeSDK);
					}
				}
			} catch (e) {
				console.log("e:", e);
			}
		})();
	});

	const onClickLogin = async () => {
		setErrorMessage("");
		await switchNetwork();
		const signer = await getSigner();
		if (signer) saveSigner(signer);

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
				// backgroundColor={"gray.800"}
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
				<Text color="red.500" mb={4}>
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
