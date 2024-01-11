import {
	Box,
	Input,
	Flex,
	Button,
	Text,
	VStack,
	Tooltip,
	IconButton,
	CloseButton,
	Spinner,
	useDisclosure,
} from "@chakra-ui/react";
import { InfoIcon, AddIcon } from "@chakra-ui/icons";
import { inputStyle } from "src/theme";
import { useContext, useState, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import {
	_isMethodEnabled,
	_addSocialRecover,
} from "../../scripts/plugins/index";
import MethodRemoval from "./Removal";
import EnabledModal from "../Modals/EnabledModal";
import { DelayPeriod, DelayInputForm } from "./Common";

const SocialRecovery = () => {
	const { safeSDK, pluginAddress } = useContext(UserDataContext);
	const [threshold, setThreshold] = useState<number>(0);
	const [guardians, setGuardians] = useState<string[]>([""]);
	const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false);
	const [delayValue, setDelayValue] = useState(0);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [errorMessage2, setErrorMessage2] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [openProposedModal, setOpenProposedModal] = useState(false);
	const [result, setResult] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			const isMethodEnabled = await _isMethodEnabled(4, pluginAddress);
			console.log("isMethodEnabled: ", isMethodEnabled);
			if (isMethodEnabled) {
				setIsMethodEnabled(isMethodEnabled);
			}
		})();
	});

	const addGuardian = (newValue, index) => {
		const updatedGuardians = [...guardians];
		setErrorMessage2("");
		if (updatedGuardians.includes(newValue) || newValue === "") {
			setErrorMessage2("Invalid/Duplicated guardian address");
			return;
		}
		updatedGuardians[index] = newValue;
		setGuardians(updatedGuardians);
	};

	const removeGuardian = (index) => {
		const updatedGuardians = [...guardians];
		updatedGuardians.splice(index, 1);
		setGuardians(updatedGuardians);
	};
	const handleAddGuardian = () => {
		setGuardians([...guardians, ""]);
	};

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
					<Tooltip
						placement="right"
						label="These addresses won't be publicly revealed as only the
						merkle root of the addresses is stored on smart contract. 
                        It's recommended to set, at least, more than three guardians"
					>
						<Text mb={3} fontSize={15} mx="25px">
							1. Guardian addresses. <br></br>
							*Should include addresses controlled by your family, friend, and
							people closed to you as well as your back up addresses.
						</Text>
					</Tooltip>
					<Box mt="10px" textAlign="center" alignItems="center">
						<Flex justifyContent="space-between">
							<VStack spacing={1} flex={1} fontSize={14}>
								<Text color="red.500" mb={2}>
									{errorMessage2}
								</Text>
								{guardians.map((address, index) => (
									<Box key={index} display="flex" alignItems="center" mt={1}>
										<label>{index + 1}:</label>
										<Input
											ml={3}
											sx={inputStyle}
											textAlign="center"
											w="350px"
											size="xl"
											type="address"
											placeholder={`0x...`}
											value={address}
											onChange={(e) => {
												const newValue = e.target.value;
												if (newValue === "") {
													removeGuardian(index); // Remove if input is empty
												} else {
													addGuardian(newValue, index); // Update the input
												}
											}}
										/>
										<IconButton
											ml={1}
											size="xl"
											icon={<CloseButton />}
											colorScheme="black"
											onClick={() => removeGuardian(index)}
											aria-label={`Remove Guardian ${index + 1}`}
										/>
									</Box>
								))}
								<IconButton
									mt={2}
									mb={4}
									w="15%"
									size="xl"
									icon={<AddIcon />}
									colorScheme="black"
									onClick={handleAddGuardian}
									aria-label="Add Guardian"
								/>
							</VStack>
						</Flex>
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
										label="Guardian threshold is the minimum approval count that is necessary to execute social recovery proposal."
									>
										<InfoIcon mr={2} mt={0.5} boxSize={3} color="blue.500" />
									</Tooltip>
									<Text>2. Guardian threshold :</Text>
								</Flex>
								<DelayPeriod index={2} />
							</VStack>
							<VStack spacing={3.5} fontSize={14} align="end" w="300px" ml={2}>
								<Input
									sx={inputStyle}
									textAlign="center"
									size="xl"
									type="address"
									placeholder="2"
									onChange={(e) => {
										setErrorMessage("");
										const threshold = Number(e.target.value);
										if (threshold <= guardians.length) {
											setThreshold(threshold);
										} else {
											setErrorMessage(
												"threshold should be lower than the number of guardins"
											);
										}
									}}
								/>
								<DelayInputForm setDelayValue={setDelayValue} />
							</VStack>
						</Flex>
					</Box>
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
								if (threshold === 0 || threshold > guardians.length) {
									setErrorMessage("Invalid threshold");
									return;
								}
								console.log("guardians.length: ", guardians.length);
								console.log("threshold: ", threshold);

								setLoading(true);
								const ret = await _addSocialRecover(
									safeSDK,
									pluginAddress,
									delayValue,
									threshold,
									guardians
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
					<MethodRemoval method={4} />
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

export default SocialRecovery;
