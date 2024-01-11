import {
	Box,
	Input,
	Text,
	Button,
	Tooltip,
	Flex,
	Spinner,
	useDisclosure,
	VStack,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { inputStyle } from "src/theme";
import { useContext, useState, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import {
	_isMethodEnabled,
	_addSecretRecover,
} from "../../scripts/plugins/index";
import MethodRemoval from "./Removal";
import EnabledModal from "../Modals/EnabledModal";
import { DelayPeriod, DelayInputForm } from "./Common";

const SecretWord = () => {
	const { safeSDK, pluginAddress } = useContext(UserDataContext);
	const [secretWord, setSecretWord] = useState<string>("");
	const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false);
	const [delayValue, setDelayValue] = useState(0);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [openProposedModal, setOpenProposedModal] = useState(false);
	const [result, setResult] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			const _isPluginEnabled = await _isMethodEnabled(3, pluginAddress);
			console.log("isPluginEnabled: ", _isPluginEnabled);
			if (_isPluginEnabled) {
				setIsMethodEnabled(_isPluginEnabled);
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
						Store a secret passoword that will be used to recover Safe.
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
									label="`Secret word` is a password with the length less than 10, which should be kept securely."
								>
									<InfoIcon mr={2} mt={0.5} boxSize={3} color="blue.500" />
								</Tooltip>
								<Text>1. Secret word :</Text>
							</Flex>
							<DelayPeriod index={2} />
						</VStack>
						<VStack spacing={3.5} fontSize={14} align="end" w="345px" ml={2}>
							<Input
								sx={inputStyle}
								textAlign="center"
								size="xl"
								placeholder="satoshi123"
								onChange={(e) => {
									setErrorMessage("");
									console.log("e: ", e.target.value);
									console.log("length: ", e.target.value.length);
									if (e.target.value.length > 10) {
										setErrorMessage(
											"secret word's length shoule be less than 10"
										);
										return;
									}
									setSecretWord(e.target.value);
								}}
							/>
							<DelayInputForm setDelayValue={setDelayValue} />
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
								setErrorMessage("");
								if (secretWord !== "") {
									setLoading(true);
									const ret = await _addSecretRecover(
										safeSDK,
										pluginAddress,
										delayValue,
										secretWord
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
								} else {
									setErrorMessage("new owner address not set");
								}
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
					<MethodRemoval method={3} />
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

export default SecretWord;
