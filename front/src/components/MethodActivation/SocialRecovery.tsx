import {
	Box,
	Input,
	Flex,
	Button,
	Text,
	VStack,
	Tooltip,
	FormControl,
	Select,
	IconButton,
	CloseButton,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useContext, useState, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import {
	_isMethodEnabled,
	_addSocialRecover,
} from "../../scripts/plugins/index";
import MethodRemoval from "./Removal";

const SocialRecovery = () => {
	const { safeSDK } = useContext(UserDataContext);
	const [threshold, setThreshold] = useState<number>(0);
	const [guardians, setGuardians] = useState<string[]>([""]);
	const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false);
	const [unit, setUnit] = useState<number>(1);
	const [delayValue, setDelayValue] = useState(0);

	useEffect(() => {
		(async () => {
			const isMethodEnabled = await _isMethodEnabled(4);
			console.log("isMethodEnabled: ", isMethodEnabled);
			if (isMethodEnabled) {
				setIsMethodEnabled(isMethodEnabled);
			}
		})();
	});

	const addGuardian = (newValue, index) => {
		const updatedGuardians = [...guardians];
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
						label="They won't be publicly revealed as only the
						merkle root of the addresses is stored on smart contract. 
                        It's recommended to set, at least, more than three guardians"
					>
						<Text mb={3} fontSize={15} mx="25px">
							Set guardian addresses.
						</Text>
					</Tooltip>
					<Box mt="10px" textAlign="center" alignItems="center">
						<Flex justifyContent="space-between">
							<VStack spacing={1} flex={1}>
								{guardians.map((address, index) => (
									<Box key={index} display="flex" alignItems="center" mt={3}>
										<label>{index + 1}:</label>
										<Input
											ml={3}
											sx={{ w: "300px" }}
											size="sm"
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
											size="sm"
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
									size="sm"
									icon={<AddIcon />}
									colorScheme="black"
									onClick={handleAddGuardian}
									aria-label="Add Guardian"
								/>
								<Box display="flex" alignItems="center" mt={3}>
									<label>Approval threshold by guardians:</label>
									<Input
										ml={4}
										sx={{ w: "70px" }}
										size="sm"
										placeholder="2"
										onChange={(e) => {
											const threshold = Number(e.target.value);
											if (threshold <= guardians.length) {
												setThreshold(threshold);
											} else {
												console.log("threshold > guardians.length");
											}
										}}
									/>
								</Box>
								<Box display="flex" alignItems="center" mt={3}>
									<Tooltip
										placement="right-start"
										label="`Delay` refers to the period of time before a recovery proposal can be executed. 
                                        (Recommendaed => prod: >30 days | test: <10 sec)"
									>
										<label>Delay:</label>
									</Tooltip>
									<FormControl px={3}>
										<Box display="flex" alignItems="center">
											<Input
												size="sm"
												type="number"
												placeholder="10"
												onChange={(e) =>
													setDelayValue(Number(e.target.value) * unit)
												}
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
								</Box>
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
							w="55%"
							onClick={async () => {
								if (guardians[0] !== "" && threshold !== 0) {
									await _addSocialRecover(
										safeSDK,
										delayValue,
										threshold,
										guardians
									);
									const _isMthodEnabled = await _isMethodEnabled(4);
									if (_isMthodEnabled) {
										setIsMethodEnabled(_isMthodEnabled);
									}
								} else {
									console.log("pending owner address not set");
								}
							}}
						>
							Enable this method
						</Button>
					</Box>
				</Box>
			) : (
				<Box>
					This method has already been enabled
					<MethodRemoval method={4} />
				</Box>
			)}
		</Box>
	);
};

export default SocialRecovery;
