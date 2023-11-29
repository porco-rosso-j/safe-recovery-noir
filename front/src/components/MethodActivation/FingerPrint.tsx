import {
	Box,
	Button,
	Text,
	Tooltip,
	FormControl,
	Select,
	Input,
	Flex,
	VStack,
	Spinner,
	useDisclosure,
	Link,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { inputStyle } from "src/theme";
import { useContext, useState, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import {
	_isMethodEnabled,
	_addWebAuthnRecover,
} from "../../scripts/plugins/index";
import MethodRemoval from "./Removal";
import EnabledModal from "../Modals/EnabledModal";

const EnableFingerPrint = () => {
	const { safeSDK, pluginAddress } = useContext(UserDataContext);
	const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false);
	const [unit, setUnit] = useState<number>(1);
	const [delayValue, setDelayValue] = useState(0);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [openProposedModal, setOpenProposedModal] = useState(false);
	const [result, setResult] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			const isEnabled = await _isMethodEnabled(2, pluginAddress);
			console.log("isEnabled: ", isEnabled);
			if (isEnabled) {
				setIsMethodEnabled(isEnabled);
			}
		})();
	});
	// Function to open the modal from the parent
	const openModal = () => {
		setOpenProposedModal(true);
		onOpen();
	};

	// Function to close the modal from the parent
	const closeModal = () => {
		setOpenProposedModal(false);
		onClose();
	};

	return (
		<Box pt="10px">
			{!isMethodEnabled ? (
				<Box>
					<Text mb={8} fontSize={15} mx="25px">
						{"Create a keypair that is generated from your fingerprint via "}
						<Link
							textDecoration="underline"
							href="https://webauthn.io/"
							isExternal
						>
							WebAuthn
						</Link>
						{". Private key will be stored on your device securely."}
					</Text>
					<Flex
						mt="20px"
						mx="auto"
						justifyContent="center"
						alignItems="strech"
						w="100%"
					>
						<VStack spacing={4} fontSize={14} align="start">
							<Flex justifyContent="space-between" alignItems="center">
								<Tooltip
									placement="bottom-start"
									label="`Delay Period` refers to the period of time until a recovery proposal becomes executable after the proposal is made.
                  *Recommendation: >30 days in prod. <10 seconds in test."
								>
									<InfoIcon mr={2} mt={0.5} boxSize={3} />
								</Tooltip>
								<Text>1. Delay period :</Text>
							</Flex>
						</VStack>
						<VStack spacing={3.5} fontSize={14} align="end" w="345px" ml={2}>
							<FormControl>
								<Box display="flex" alignItems="center">
									<Input
										sx={inputStyle}
										textAlign="center"
										size="xl"
										mr="10px"
										type="number"
										placeholder="10"
										onChange={(e) =>
											setDelayValue(Number(e.target.value) * unit)
										}
									/>
									<Select
										w={"30%"}
										size="xl"
										borderRadius={"2px"}
										sx={{
											textAlign: "center", // Center the text horizontally
											pr: "15px", // Add padding on the left side
											pb: "4px",
										}}
										onChange={(e) => setUnit(Number(e.target.value))}
									>
										<option value="1">sec</option>
										<option value="60">min</option>
										<option value="3600">hour</option>
										<option value="86400">day</option>
									</Select>
								</Box>
							</FormControl>
						</VStack>
					</Flex>
					<Box
						sx={{ marginBottom: "6px" }}
						textAlign="center"
						alignItems="center"
					>
						<Button
							sx={{ mt: "35px" }}
							colorScheme="teal"
							w="35%"
							onClick={async () => {
								setLoading(true);
								const ret = await _addWebAuthnRecover(
									safeSDK,
									pluginAddress,
									delayValue
								);
								console.log("ret: ", ret);
								if (ret.result) {
									setResult(true);
								} else if (!ret.result && ret.txHash === "") {
									console.log("ret.result: ", ret.result);
									setErrorMessage("Something went wrong");
									setLoading(false);
									return;
								}
								setTxHash(ret.txHash);
								openModal();
								setLoading(false);
							}}
						>
							Enable method
						</Button>
						{loading && (
							<Flex justifyContent="center" alignItems="center">
								<Spinner mt={10} color="gray.300" />
							</Flex>
						)}
						<Text mt={4} color="red.500" mb={4}>
							{errorMessage}
						</Text>
					</Box>
				</Box>
			) : (
				<Box>
					This method has already been enabled
					<MethodRemoval method={2} />
				</Box>
			)}
			<EnabledModal
				isOpen={isOpen || openProposedModal}
				onOpen={onOpen}
				onClose={closeModal}
				result={result}
				txHash={txHash}
				enable={true}
			/>
		</Box>
	);
};

export default EnableFingerPrint;
