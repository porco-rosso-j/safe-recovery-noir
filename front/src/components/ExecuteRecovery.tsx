import {
	Box,
	Input,
	Flex,
	Button,
	Text,
	VStack,
	HStack,
	Spinner,
	useDisclosure,
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
import ExecutedModal from "./Modals/ExecuteModal";

const ExecuteRecovery = (props) => {
	const { safeSDK, safeAddress, signer, saveCurrentOwner, pluginAddress } =
		useContext(UserDataContext);
	const [expectedNewOwner, setExpectedNewOwner] = useState<string>("");
	const [proposalId, setProposalId] = useState<number>(0);
	const [isRecoveryExecutable, setIsRecoveryExecutable] =
		useState<boolean>(false);
	const [proposals, setProposals] = useState<Proposal[]>([]);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [socialRecoveryThreshold, setSocialRecoveryThreshold] =
		useState<number>(0);
	const [loading, setLoading] = useState(false);
	const [txHash, setTxHash] = useState<string>("");
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [openProposedModal, setOpenProposedModal] = useState(false);
	const [result, setResult] = useState<boolean>(false);
	const [functionType, setFunctionType] = useState<number>(0);
	const [loadingProposals, setLoadingProposals] = useState<boolean>(true);
	useEffect(() => {
		const fetchProposals = async () => {
			try {
				const proposalsFetched = await getProposals(pluginAddress);
				setProposals(proposalsFetched);
				setLoadingProposals(false);
			} catch (error) {
				console.error("Error fetching proposals:", error);
			}
		};

		// setLoadingProposals(true);
		// console.log("loadingProposals before: ", loadingProposals);
		fetchProposals();
		setLoadingProposals(true);
		console.log("loadingProposals after: ", loadingProposals);
	}, []);

	useEffect(() => {
		(async () => {
			if (proposalId !== 0 && proposals[proposalId].type === 4) {
				setSocialRecoveryThreshold(
					await getSocialRecoveryThreshold(pluginAddress)
				);
			}
		})();
	});

	useEffect(() => {
		(async () => {
			if (proposalId !== 0) {
				const expectedNewOwner = await getNewOwnerForPoposal(
					proposalId,
					pluginAddress
				);
				console.log("expectedNewOwner: ", expectedNewOwner);
				setExpectedNewOwner(expectedNewOwner);
			}
		})();
	});

	useEffect(() => {
		(async () => {
			if (proposalId !== 0) {
				const IsRecoveryExecutable = await _getIsRecoveryExecutable(
					pluginAddress,
					proposalId
				);
				// const IsRecoveryExecutable = await _getIsRecoveryExecutable(signer, proposalId);
				console.log("IsRecoveryExecutable: ", IsRecoveryExecutable);
				setIsRecoveryExecutable(IsRecoveryExecutable);
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
					onChange={(e) => {
						handleSetProposalId(Number(e.target.value));
					}}
				/>
			</Box>
			<Box>
				{proposalId === 0 ? (
					<Box>
						<Box>
							{!loadingProposals ? (
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
							) : (
								<Box>
									<Text mt={10}>Loading proposals...</Text>
									<Flex justifyContent="center" alignItems="center">
										<Spinner mt={10} mb={5} color="gray.300" />
									</Flex>
								</Box>
							)}
						</Box>
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
								{safeSDK && safeAddress !== "" ? (
									<Button
										sx={{ mt: "35px", mr: "30px" }}
										// colorScheme="#F56565"
										bg="#C53030"
										color="white"
										_hover={{
											bg: "#9B2C2C",
										}}
										onClick={async () => {
											setErrorMessage("");
											if (!proposals[proposalId].rejected) {
												setLoading(true);
												console.log("safeAddress: ", safeAddress);
												const ret = await _rejectRecover(
													safeSDK,
													pluginAddress,
													safeAddress,
													proposalId
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
												setFunctionType(3);
												openModal();
												setLoading(false);
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
										onClick={async () => {
											// double-approve should fail.
											setErrorMessage("");
											setLoading(true);
											const ret = await _approveSocialRecovery(
												signer,
												pluginAddress,
												proposalId
											);
											console.log("ret: ", ret);
											if (ret.result) {
												setResult(true);
												proposals[proposalId].approvals += 1;
											} else if (!ret.result && ret.txHash === "") {
												console.log("ret.result: ", ret.result);
												setErrorMessage("Something went wrong");
												setLoading(false);
												return;
											}
											setTxHash(ret.txHash);
											setFunctionType(2);
											openModal();
											setLoading(false);
										}}
									>
										Approve
									</Button>
								) : (
									<Button
										sx={{ mt: "35px" }}
										colorScheme="teal"
										// w="35%"
										onClick={async () => {
											if (isRecoveryExecutable) {
												setErrorMessage("");
												setLoading(true);
												const ret = await _executeRecover(
													signer,
													pluginAddress,
													proposalId
												);
												console.log("ret: ", ret);
												if (ret.result) {
													setResult(true);
													saveCurrentOwner(expectedNewOwner);
												} else if (!ret.result && ret.txHash === "") {
													console.log("ret.result: ", ret.result);
													setErrorMessage("Something went wrong");
													setLoading(false);
													return;
												}
												setTxHash(ret.txHash);
												setFunctionType(1);
												openModal();
												setLoading(false);
											} else {
												setErrorMessage("This proposal can't be executed");
											}
										}}
									>
										Execute
									</Button>
								)}
							</HStack>
							{loading && (
								<Flex justifyContent="center" alignItems="center">
									<Spinner mt={10} mb={5} color="gray.300" />
								</Flex>
							)}
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
				<ExecutedModal
					isOpen={isOpen || openProposedModal}
					onOpen={onOpen}
					onClose={closeModal}
					result={result}
					txHash={txHash}
					functionType={functionType}
					setFunctionType={setFunctionType}
				/>
			</Box>
		</Box>
	);
};

export default ExecuteRecovery;
