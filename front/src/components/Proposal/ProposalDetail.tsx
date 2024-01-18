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
import { shortenAddress } from "src/scripts/utils/address";
import ExecutedModal from "../Modals/ExecuteModal";
import { calcTimeDiff, typeName } from "src/scripts/utils/helper";
import { ProposalType, txResult } from "src/scripts/plugins/types";
import { getProposal } from "src/scripts/plugins/view";
import useProposeRecover from "src/hooks/useProposeRecover";
import ProposalStatus from "./ProposalStatus";

const ProposalDetail = (props: {
	proposal: ProposalType;
	proposalId: number;
	setProposalId?: (id: number) => void;
	fromProposeTab: boolean;
	setOpenProposal?: (value: boolean) => void;
}) => {
	const { safeSDK, safeAddress, saveCurrentOwner, pluginAddress } =
		useContext(UserDataContext);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [proposeStatus, setProposeStatus] = useState<number>(0);
	console.log("proposeStatus: ", proposeStatus);
	const { _approveSocialRecovery, _executeRecover, _rejectRecover } =
		useProposeRecover(setProposeStatus);

	const [functionType, setFunctionType] = useState<number>(0);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");

	const [fucntionResult, setFunctionResult] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
	const [loadingIndex, setLoadingIndex] = useState<number>(0);

	const [proposal, setProposal] = useState<ProposalType>(props.proposal);
	const [refreshing, setRefreshing] = useState(false);

	const isApprovable =
		proposal.type === 4 && proposal.approvals < proposal.approvealThreshold;

	const handleFunction = async (funcType: number) => {
		setErrorMessage("");
		handleLoading(funcType, true);

		let ret: txResult = { result: false, txHash: "" };

		if (funcType === 1) {
			ret = await _executeRecover(props.proposalId);
		} else if (funcType === 2) {
			ret = await _approveSocialRecovery(props.proposalId);
		} else {
			ret = await _rejectRecover(props.proposalId);
		}

		if (ret.result) {
			setFunctionResult(true);
			if (funcType === 1) {
				saveCurrentOwner(proposal.newOwners[0], true);
			}
		} else if (!ret.result && ret.txHash === "") {
			console.log("ret.result: ", ret.result);
			setErrorMessage("Something went wrong");
			setLoading(false);
			setProposeStatus(0);
			return;
		}
		setTxHash(ret.txHash);
		setFunctionType(funcType);
		handleLoading(funcType, false);
		onOpen();
		setLoading(false);
		setProposeStatus(0);
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

	console.log("loadingIndex:", loadingIndex);

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
						<Text>・ Status:</Text>
						{proposal.status === 0 ? <Text>・ Executable:</Text> : null}
						{proposal.status === 0 && !proposal.isExecutable.result ? (
							<Text ml={4} color="red.400">
								*Reason:
							</Text>
						) : null}
						{proposal.status === 0 &&
						!proposal.isExecutable.result &&
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

						{proposal.status === 0 ? (
							<Text>Proposed</Text>
						) : proposal.status === 1 ? (
							<Text color={"blue.400"}>Executed</Text>
						) : proposal.status === 2 ? (
							<Text color="red.400">Rejected</Text>
						) : null}

						{proposal.status === 0 && proposal.isExecutable.result ? (
							<Text color="green.400"> Yes </Text>
						) : proposal.status === 0 && !proposal.isExecutable.result ? (
							<Text color="red.400"> No </Text>
						) : null}
						{proposal.status === 0 && !proposal.isExecutable.result ? (
							<Text color="red.400">{proposal.isExecutable.reason}</Text>
						) : null}
						{proposal.status === 0 &&
						!proposal.isExecutable.result &&
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
								await handleFunction(3);
							}}
							isDisabled={proposal.status === 1 || proposal.status === 2}
						>
							Reject
						</Button>
					) : null}
					{isApprovable ? (
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

				<ProposalStatus
					loading={loading}
					methodIndex={props.proposal.type}
					statusIndex={proposeStatus}
					isApproval={true}
				/>

				{errorMessage !== "" ?? (
					<Text mt={4} color="red.400" mb={4}>
						{errorMessage}
					</Text>
				)}
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
				isOpen={isOpen}
				onOpen={onOpen}
				onClose={onClose}
				fucntionResult={fucntionResult}
				txHash={txHash}
				functionType={functionType}
				setFunctionType={setFunctionType}
			/>
		</Box>
	);
};

export default ProposalDetail;
