import {
	Box,
	Input,
	Text,
	Button,
	Tooltip,
	FormControl,
	Select,
	Flex,
	Spinner,
	useDisclosure,
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import {
	_isMethodEnabled,
	_addSecretRecover,
} from "../../scripts/plugins/index";
import MethodRemoval from "./Removal";
import EnabledModal from "../Modals/EnabledModal";

const SecretWord = () => {
	const { safeSDK, pluginAddress } = useContext(UserDataContext);
	const [secretWord, setSecretWord] = useState<string>("");
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
					<Text mb={3} fontSize={15} mx="25px">
						1. Set secret word:
					</Text>
					<Input
						sx={{ w: "50%" }}
						size="sm"
						type="word"
						placeholder="secret"
						onChange={(e) => setSecretWord(e.target.value)}
					/>
					<Tooltip
						placement="right-start"
						label="`Delay` refers to the period of time before a recovery proposal
								can be executed.
                (Recommendaed => 
                prod: >30 days | test: <10 sec)"
					>
						<Text mt={3} mb={2} fontSize={15} mx="25px">
							2. Set delay:
						</Text>
					</Tooltip>
					<FormControl px={40}>
						<Box display="flex" alignItems="center">
							<Input
								size="sm"
								type="number"
								placeholder="10"
								onChange={(e) => setDelayValue(Number(e.target.value) * unit)}
							/>

							<Select
								size="sm"
								onChange={(e) => setUnit(Number(e.target.value))}
							>
								<option value="1">sec</option>
								<option value="60">min</option>
								<option value="3600">hour</option>
								<option value="86400">day</option>
							</Select>
						</Box>
					</FormControl>
					<Box
						sx={{ marginBottom: "6px" }}
						textAlign="center"
						alignItems="center"
					>
						<Button
							sx={{ mt: "35px" }}
							colorScheme="teal"
							w="55%"
							onClick={async () => {
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
							Enable this method
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
