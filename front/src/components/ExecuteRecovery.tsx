import {
	Box,
	Input,
	Flex,
	Button,
	Text,
	VStack,
	HStack,
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import { shortenAddress } from "../scripts/utils/address";
import {
	_approveSocialRecovery,
	_executeRecover,
	_rejectRecover,
	getNewOwnerForPoposal,
	_getIsRecoveryExecutable,
	getProposals,
	getSocialRecoveryThreshold,
} from "../scripts/plugins/index";
import { Proposal } from "../scripts/plugins/types";

const ExecuteRecovery = (props) => {
	const { safeSDK, signer, saveCurrentOwner } = useContext(UserDataContext);
	const [expectedNewOwner, setExpectedNewOwner] = useState<string>("");
	const [proposalId, setProposalId] = useState<number>(0);
	const [isRecoveryExecutable, setIsRecoveryExecutable] =
		useState<boolean>(false);
	const [proposals, setProposals] = useState<Proposal[]>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [socialRecoveryThreshold, setSocialRecoveryThreshold] =
		useState<number>(0);

	useEffect(() => {
		const fetchProposals = async () => {
			try {
				const proposalsFetched = await getProposals();
				setProposals(proposalsFetched);
			} catch (error) {
				console.error("Error fetching proposals:", error);
			}
		};

		fetchProposals();
	}, []);

	useEffect(() => {
		(async () => {
			if (proposalId !== 0 && proposals[proposalId].type === 4) {
				setSocialRecoveryThreshold(await getSocialRecoveryThreshold());
			}
		})();
	});

	useEffect(() => {
		(async () => {
			if (proposalId !== 0) {
				const expectedNewOwner = await getNewOwnerForPoposal(proposalId);
				console.log("expectedNewOwner: ", expectedNewOwner);
				setExpectedNewOwner(expectedNewOwner);
			}
		})();
	});

	useEffect(() => {
		(async () => {
			if (proposalId !== 0) {
				const IsRecoveryExecutable = await _getIsRecoveryExecutable(proposalId);
				// const IsRecoveryExecutable = await _getIsRecoveryExecutable(signer, proposalId);
				console.log("IsRecoveryExecutable: ", IsRecoveryExecutable);
				setIsRecoveryExecutable(IsRecoveryExecutable);
			}
		})();
	});

	const typeName = (type: number) => {
		if (type === 1) {
			return "Backup Address";
		} else if (type === 2) {
			return "Fingerprint";
		} else if (type === 3) {
			return "Secret";
		} else if (type === 4) {
			return "Social";
		}
	};

	const handleSetProposalId = (id: number) => {
		console.log("id: ", id);
		console.log("proposals.length: ", proposals.length);
		if (id < proposals.length) {
			setProposalId(id);
		} else {
			console.log("invalid id");
		}
	};

	return (
		<Box pt="3px">
			<Text mb={5} fontSize={15} mx="75px">
				Choose proposal and execute ⚡️
			</Text>
			<Box mb={5}>
				<label>Proposal ID:</label>
				<Input
					ml={3}
					sx={{ w: "50px" }}
					size="sm"
					placeholder="2"
					onChange={(e) => handleSetProposalId(Number(e.target.value))}
				/>
			</Box>
			<Box>
				{proposalId === 0 ? (
					<Box>
						<VStack spacing={4} align="stretch">
							{proposals.map((proposal) => (
								<Box
									key={proposal.id}
									p={2}
									borderWidth="1px"
									borderRadius="md"
									_hover={{ shadow: "md", cursor: "pointer" }}
									onClick={() => {
										handleSetProposalId(proposal.id);
									}}
								>
									<HStack spacing={4}>
										<Text ml={3}>ID: {proposal.id}</Text>
										<Text flex={1}>{typeName(proposal.type)} Recovery</Text>
										{proposal.isExecutable ? (
											<Text color={"green"}> Executable</Text>
										) : (
											<Text color={"red.400"}> Non Executable</Text>
										)}
									</HStack>
								</Box>
							))}
						</VStack>
					</Box>
				) : (
					<Box>
						<Flex
							p={5}
							mx="auto"
							mt="3"
							mb="5"
							borderRadius="lg"
							borderColor={"white"}
							borderWidth={"0.5px"}
							justifyContent="space-between" // Align the button to the right
							alignItems="center" // Vertically center the button
							flexDirection="column"
						>
							<Text as="b" mb={3} fontSize={16} justifyContent="center">
								Proposal {proposalId} Detail
							</Text>
							<Flex alignItems="strech">
								<VStack spacing={1} fontSize={15} align="start" mr={15}>
									<Text color="white">・ Method Type:</Text>
									<Text color="white">・ New Owner:</Text>
									<Text color="white">・ Old Owner:</Text>
									<Text color="white">・ New Threshold:</Text>
									{proposals[proposalId].type === 4 ? (
										<Text color="white">・ Current Approval Count:</Text>
									) : null}
									{proposals[proposalId].type === 4 ? (
										<Text color="white">・ Approval Threshold:</Text>
									) : null}
									<Text color="white">・ Executable:</Text>
								</VStack>
								<VStack spacing={1} fontSize={15} align="end">
									<Text>{typeName(proposals[proposalId].type)} Recovery</Text>
									<Text>
										{shortenAddress(proposals[proposalId].newOwners[0])}
									</Text>
									<Text>
										{shortenAddress(proposals[proposalId].oldOwners[0])}
									</Text>
									<Text>{proposals[proposalId].threshold}</Text>
									{proposals[proposalId].type === 4 ? (
										<Box>
											<Text>{proposals[proposalId].approvals}</Text>
											<Text>{socialRecoveryThreshold}</Text>
										</Box>
									) : null}
									<Text>{isRecoveryExecutable ? "Yes" : "No"}</Text>
								</VStack>
							</Flex>
							<HStack>
								{safeSDK ? (
									<Button
										sx={{ mt: "35px", mr: "30px" }}
										colorScheme="red"
										// w="55%"
										onClick={async () => {
											if (!proposals[proposalId].rejected) {
												await _rejectRecover(signer, proposalId);
											} else {
												setErrorMessage(
													"This proposal has already been rejected"
												);
											}
										}}
									>
										Reject
									</Button>
								) : null}
								{proposals[proposalId].type === 4 &&
								proposals[proposalId].approvals < socialRecoveryThreshold ? (
									<Button
										sx={{ mt: "35px" }}
										colorScheme="teal"
										// w="55%"
										onClick={async () => {
											if (true) {
												// double-approve should fail.
												await _approveSocialRecovery(signer, proposalId);
												proposals[proposalId].approvals += 1;
											} else {
												setErrorMessage("This proposal can't be executed");
											}
										}}
									>
										Approve
									</Button>
								) : (
									<Button
										sx={{ mt: "35px" }}
										colorScheme="teal"
										// w="55%"
										onClick={async () => {
											if (isRecoveryExecutable) {
												const res = await _executeRecover(signer, proposalId);
												if (res) {
													saveCurrentOwner(expectedNewOwner);
												}
											} else {
												setErrorMessage("This proposal can't be executed");
											}
										}}
									>
										Execute
									</Button>
								)}
							</HStack>

							{errorMessage !== "" ? (
								<Text mt={4} color="red.500" mb={4}>
									{errorMessage}
								</Text>
							) : null}
							{/* </Box> */}
							<Button
								fontSize={15}
								mt="20px"
								h="25px"
								color="white"
								bgColor="gray.600"
								onClick={async () => {
									setProposalId(0);
								}}
							>
								back
							</Button>
						</Flex>
					</Box>
				)}
			</Box>
		</Box>
	);
};

export default ExecuteRecovery;
