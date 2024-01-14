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
	useDisclosure,
} from "@chakra-ui/react";
import { InfoIcon, AddIcon } from "@chakra-ui/icons";
import { inputStyle } from "src/theme";
import { useState } from "react";
import MethodRemoval from "./Removal";
import EnabledModal from "../Modals/EnabledModal";
import { Timelock, TimelockInput } from "./Common";
import { useIsMethodEnabled, useAddRecover } from "src/hooks";

const SocialRecovery = (props: { methodIndex: number }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isMethodEnabled } = useIsMethodEnabled(props.methodIndex);
	const { loading, errorMessage, txHash, result, setErrorMessage, addRecover } =
		useAddRecover(onOpen);

	const [errorMessage2, setErrorMessage2] = useState<string>("");

	const [timeLock, setTimelock] = useState(0);
	const [threshold, setThreshold] = useState<number>(0);
	const [guardians, setGuardians] = useState<string[]>([""]);

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
							*Please include addresses controlled by your family, friend, and
							people closed to you as well as your back up addresses.
						</Text>
					</Tooltip>
					<Box mt="10px" textAlign="center" alignItems="center">
						<Flex justifyContent="space-between">
							<VStack spacing={1} flex={1} fontSize={14}>
								<Text color="red.400" mb={2}>
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
								<Timelock index={2} />
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
								<TimelockInput setTimelock={setTimelock} />
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
							isLoading={loading}
							loadingText="Enabling"
							onClick={async () => {
								await addRecover({
									methodIndex: props.methodIndex,
									timeLock,
									threshold,
									guardians,
								});
							}}
						>
							Enable method
						</Button>
						<Text mt={4} color="red.400" mb={4}>
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
				isOpen={isOpen}
				onOpen={onOpen}
				onClose={onClose}
				result={result}
				txHash={txHash}
				enable={true}
			/>
		</Box>
	);
};

export default SocialRecovery;
