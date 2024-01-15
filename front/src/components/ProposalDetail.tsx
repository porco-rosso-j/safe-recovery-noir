import {
	Box,
	Flex,
	Button,
	Text,
	VStack,
	HStack,
	useDisclosure,
	Spinner,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { useContext, useState } from "react";
import UserDataContext from "src/contexts/userData";
import { shortenAddress } from "../scripts/utils/address";
import {
	_approveSocialRecovery,
	_executeRecover,
	_rejectRecover,
} from "../scripts/plugins/index";
import ExecutedModal from "./Modals/ExecuteModal";
import { calcTimeDiff, typeName } from "src/scripts/utils/helper";
import { ProposalType, txResult } from "../scripts/plugins/types";
import { getProposal } from "src/scripts/plugins/view";

const ProposalDetail = (props: {
	proposal: ProposalType;
	proposalId: number;
	setProposalId?: (id: number) => void;
	fromProposeTab: boolean;
	setOpenProposal?: (value: boolean) => void;
}) => {
	const { safeSDK, safeAddress, signer, saveCurrentOwner, pluginAddress } =
		useContext(UserDataContext);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [functionType, setFunctionType] = useState<number>(0);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");

	const [fucntionResult, setFunctionResult] = useState<boolean>(false);
	const [openProposedModal, setOpenProposedModal] = useState(false);
	const [loading, setLoading] = useState(false);
	const [loadingIndex, setLoadingIndex] = useState<number>(0);

	const [proposal, setProposal] = useState<ProposalType>(props.proposal);
	const [refreshing, setRefreshing] = useState(false);

	const handleFunction = async (funcType: number) => {
		setErrorMessage("");
		handleLoading(funcType, true);

		let ret: txResult = { result: false, txHash: "" };

		if (funcType === 1) {
			ret = await _executeRecover(signer, pluginAddress, props.proposalId);
		} else if (funcType === 2) {
			ret = await _approveSocialRecovery(
				signer,
				pluginAddress,
				props.proposalId
			);
		} else {
			ret = await _rejectRecover(
				safeSDK,
				safeAddress,
				pluginAddress,
				props.proposalId
			);
		}

		if (ret.result) {
			setFunctionResult(true);
			if (funcType === 1) {
				console.log("saveCurrentOwner called?: ");
				saveCurrentOwner(proposal.newOwners[0], true);
				console.log("saveCurrentOwner called 2?: ");
			}
		} else if (!ret.result && ret.txHash === "") {
			console.log("ret.result: ", ret.result);
			setErrorMessage("Something went wrong");
			setLoading(false);
			return;
		}
		setTxHash(ret.txHash);
		setFunctionType(funcType);
		handleLoading(funcType, false);
		openModal();
		setLoading(false);
		handleRefreshProposal();
	};

	const handleRefreshProposal = async () => {
		setRefreshing(true);
		try {
			const refreshedProposal = await getProposal(
				props.proposalId,
				pluginAddress
			);
			setProposal(refreshedProposal);
		} catch (e) {
			console.log("e: ", e);
		}

		setRefreshing(false);
	};

	const handleLoading = (index: number, loading: boolean) => {
		if (index === 1 && loading) {
			setLoadingIndex(index);
			setLoading(loading);
		} else if (index === 2 && loading) {
			setLoadingIndex(index);
			setLoading(loading);
		} else if (index === 3 && loading) {
			setLoadingIndex(index);
			setLoading(loading);
		}
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
		<Box mt={3}>
			<Flex
				p={5}
				mx="auto"
				mb="5"
				borderRadius="lg"
				borderColor={"white"}
				borderWidth={"0.5px"}
				justifyContent="space-between" // Align the button to the right
				alignItems="center" // Vertically center the button
				flexDirection="column"
			>
				<Flex alignItems="center" width="100%" mb={3}>
					<Flex flex="1" justifyContent="center" ml={14}>
						<Text as="b" fontSize={16}>
							Proposal {Number(props.proposalId)} Detail
						</Text>
					</Flex>

					<Button
						onClick={handleRefreshProposal}
						leftIcon={
							<RepeatIcon color={"white"} _hover={{ color: "green" }} />
						}
						backgroundColor={"transparent"}
						_hover={{ bg: "transparent" }}
					></Button>
					{refreshing ? <Spinner size={"xs"} /> : null}
				</Flex>
				<Flex alignItems="strech">
					<VStack spacing={1} fontSize={15} color="white" align="start" mr={15}>
						<Text>・ Method Type:</Text>
						<Text>・ New Owner:</Text>
						<Text>・ Old Owner:</Text>
						<Text>・ New Multi-sig Threshold:</Text>
						{proposal.type === 4 ? (
							<Text>・ Current Approval Count:</Text>
						) : null}
						{proposal.type === 4 ? <Text>・ Approval Threshold:</Text> : null}
						<Text>・ Executable:</Text>
						{!proposal.isExecutable.result ? (
							<Text ml={4} color="red.400">
								*Reason:
							</Text>
						) : null}
						{!proposal.isExecutable.result &&
						proposal.isExecutable.reason === "TIMELOCK_NOT_ENDED" ? (
							<Text>・ Executable After:</Text>
						) : null}
					</VStack>
					<VStack spacing={1} fontSize={15} align="end">
						<Text>{typeName(Number(proposal.type))} Recovery</Text>
						<Text>{shortenAddress(proposal.newOwners[0])}</Text>
						<Text>{shortenAddress(proposal.oldOwners[0])}</Text>
						<Text>{Number(proposal.threshold)}</Text>
						{proposal.type === 4 ? (
							<Text>{Number(proposal.approvals)}</Text>
						) : null}
						{proposal.type === 4 ? (
							<Text>{Number(proposal.approvealThreshold)}</Text>
						) : null}
						{proposal.isExecutable.result ? (
							<Text color="green.400"> Yes </Text>
						) : (
							<Text color="red.400"> No </Text>
						)}
						{!proposal.isExecutable.result ? (
							<Text color="red.400">{proposal.isExecutable.reason}</Text>
						) : null}
						{!proposal.isExecutable.result &&
						proposal.isExecutable.reason === "TIMELOCK_NOT_ENDED" ? (
							<Text>{calcTimeDiff(Number(proposal.timeLockEnd))}</Text>
						) : null}
					</VStack>
				</Flex>
				<HStack>
					{safeSDK && safeAddress !== "" ? (
						<Button
							sx={{ mt: "35px", mr: "30px" }}
							bg="#C53030"
							color="white"
							isLoading={loading && loadingIndex === 3}
							loadingText="Rejecting"
							_hover={{
								bg: "#9B2C2C",
							}}
							onClick={async () => {
								if (!proposal.rejected) {
									await handleFunction(3);
								} else {
									setErrorMessage("This proposal has already been rejected");
								}
							}}
							isDisabled={proposal.rejected}
						>
							Reject
						</Button>
					) : null}
					{proposal.type === 4 &&
					proposal.approvals < proposal.approvealThreshold ? (
						<Button
							sx={{ mt: "35px" }}
							colorScheme="blue"
							isLoading={loading && loadingIndex === 2}
							loadingText="Approving"
							onClick={() => {
								handleFunction(2);
							}}
						>
							Approve
						</Button>
					) : (
						<Button
							sx={{ mt: "35px" }}
							colorScheme="teal"
							isLoading={loading && loadingIndex === 1}
							loadingText="Executing"
							onClick={() => {
								handleFunction(1);
							}}
							isDisabled={!proposal.isExecutable.result}
						>
							Execute
						</Button>
					)}
				</HStack>
				{loading && loadingIndex === 2 ? (
					<Text mt={5}>
						{" "}
						*you need to sign a message on connected wallet <br /> to generate
						zk-proof{" "}
					</Text>
				) : null}
				{errorMessage !== "" ? (
					<Text mt={4} color="red.400" mb={4}>
						{errorMessage}
					</Text>
				) : null}
				<Button
					fontSize={15}
					mt="30px"
					h="30px"
					pb="2px"
					color="white"
					bgColor="gray.600"
					onClick={async () => {
						if (props.fromProposeTab) {
							props.setOpenProposal(false);
						} else {
							props.setProposalId(0);
						}
					}}
				>
					back
				</Button>
			</Flex>

			<ExecutedModal
				isOpen={isOpen || openProposedModal}
				onOpen={onOpen}
				onClose={closeModal}
				fucntionResult={fucntionResult}
				txHash={txHash}
				functionType={functionType}
				setFunctionType={setFunctionType}
			/>
		</Box>
	);
};

export default ProposalDetail;
