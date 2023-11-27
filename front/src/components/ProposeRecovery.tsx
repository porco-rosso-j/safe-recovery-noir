import { Box, Input, Flex, Button, Text, VStack } from "@chakra-ui/react";
import { useContext, useState, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import {
	_isMethodEnabled,
	getRecoveryCount,
	_proposeRecovery,
} from "../scripts/plugins/index";
import { addresses } from "src/scripts/constants/addresses";

const ProposeRecovery = (props) => {
	const { safeAddress, signer, currentOwner } = useContext(UserDataContext);
	const [ownerReplaced, setOwnerReplaced] = useState<string>(currentOwner);
	const [pendingNewOwner, setPendingNewOwner] = useState<string>(addresses[0]);
	const [threshold, setThreshold] = useState<number>(0);
	const [secret, setSecret] = useState<string>("");
	const [recoveryCount, setRecoveryCount] = useState<number>(0);
	const [closeSuccess, setCloseSuccess] = useState<boolean>(true);
	const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>("");

	useEffect(() => {
		(async () => {
			const isEnabled = await _isMethodEnabled(props.method);
			console.log("isEnabled: ", isEnabled);
			setIsMethodEnabled(isEnabled);
		})();
	});

	const handleCloseSuccess = () => {
		setCloseSuccess(true);
	};

	return (
		<Box pt="3px">
			{closeSuccess ? (
				<Box>
					<Text mb={3} fontSize={15} mx="75px">
						Propose recovery. The old owner will be replaced with the new owner.
					</Text>
					<Box mt="10px" textAlign="center" alignItems="center">
						<Flex justifyContent="space-between">
							<VStack spacing={1} flex={1}>
								<Box display="flex" alignItems="center" mt={4}>
									<label>1. old owner: </label>
									<Input
										ml={3}
										sx={{ w: "300px" }}
										size="sm"
										type="address"
										placeholder="0xAbCd..."
										defaultValue={currentOwner}
										onChange={(e) => setOwnerReplaced(e.target.value)}
									/>
								</Box>
								<Box display="flex" alignItems="center" mt={4}>
									<label>2. new owner: </label>
									<Input
										ml={3}
										sx={{ w: "300px" }}
										size="sm"
										type="address"
										placeholder="0xAbCd..."
										defaultValue={addresses[0]}
										onChange={(e) => setPendingNewOwner(e.target.value)}
									/>
								</Box>
								<Box display="flex" alignItems="center" mt={4}>
									<label>3. new threshold:</label>
									<Input
										ml={3}
										sx={{ w: "300px" }}
										size="sm"
										placeholder="1"
										onChange={(e) => setThreshold(Number(e.target.value))}
									/>
								</Box>
								{props.method === 3 ? (
									<Box display="flex" alignItems="center" mt={4}>
										<label>secret: </label>
										<Input
											ml={3}
											sx={{ w: "300px" }}
											size="sm"
											placeholder="satoshi123"
											onChange={(e) => setSecret(e.target.value)}
										/>
									</Box>
								) : null}
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
								if (isMethodEnabled) {
									if (
										pendingNewOwner !== "" &&
										ownerReplaced !== "" &&
										pendingNewOwner !== ownerReplaced
									) {
										// const _newOwner = await _proposeEcrecoverRecover(signer, threshold, ownerReplaced, pendingNewOwner);
										console.log("method: ", props.method);
										console.log("secret: ", secret);
										await _proposeRecovery(
											props.method,
											signer,
											threshold,
											ownerReplaced,
											pendingNewOwner,
											secret,
											safeAddress
										);
										const _recoveryCount = await getRecoveryCount();
										setRecoveryCount(Number(_recoveryCount));
										setCloseSuccess(false);
									} else {
										// console.log("pending owner address not set");
										setErrorMessage("Addresses not correctly set");
									}
								} else {
									setErrorMessage("This method hasn't been enabled");
								}
							}}
						>
							Propose Recovery
						</Button>
						<Text mt={4} color="red.500" mb={4}>
							{errorMessage}
						</Text>
					</Box>
				</Box>
			) : (
				<Box mt={5}>
					<VStack spacing={1}>
						<Text>
							Successfully proposed! Recovery Id for your proposal:{" "}
							{recoveryCount}
						</Text>
						{/* other work:
                - when can this proposal be executed
                - recovery count should be read from event instead of public state
                - 
                 */}
						<Text as="u" pt={5} onClick={handleCloseSuccess}>
							Create new proposal?
						</Text>
					</VStack>
				</Box>
			)}
		</Box>
	);
};

export default ProposeRecovery;
