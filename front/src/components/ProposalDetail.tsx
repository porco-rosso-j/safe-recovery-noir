import {
	Box,
	Flex,
	Button,
	Text,
	VStack,
	HStack,
	useDisclosure,
} from "@chakra-ui/react";
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
	const [loadingIndex, setLoadingIndex] = useState(0);

	// use effect to update give prposal's contents

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
			if (funcType === 1 || funcType === 2) {
				saveCurrentOwner(props.proposal.newOwners[0]);
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
		<Box mt={10}>
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
				<Text as="b" mb={3} fontSize={16} justifyContent="center">
					Proposal {props.proposalId} Detail
				</Text>
				<Flex alignItems="strech">
					<VStack spacing={1} fontSize={15} color="white" align="start" mr={15}>
						<Text>・ Method Type:</Text>
						<Text>・ New Owner:</Text>
						<Text>・ Old Owner:</Text>
						<Text>・ New Multi-sig Threshold:</Text>
						{props.proposal.type === 4 ? (
							<Text>・ Current Approval Count:</Text>
						) : null}
						{props.proposal.type === 4 ? (
							<Text>・ Approval Threshold:</Text>
						) : null}
						<Text>・ Executable:</Text>
						{!props.proposal.isExecutable.result ? (
							<Text ml={4} color="red.400">
								*Reason:
							</Text>
						) : null}
						{!props.proposal.isExecutable.result &&
						props.proposal.isExecutable.reason === "TIMELOCK_NOT_ENDED" ? (
							<Text>・ Executable After:</Text>
						) : null}
					</VStack>
					<VStack spacing={1} fontSize={15} align="end">
						<Text>{typeName(props.proposal.type)} Recovery</Text>
						<Text>{shortenAddress(props.proposal.newOwners[0])}</Text>
						<Text>{shortenAddress(props.proposal.oldOwners[0])}</Text>
						<Text>{props.proposal.threshold}</Text>
						{props.proposal.type === 4 ? (
							<Text>{props.proposal.approvals}</Text>
						) : null}
						{props.proposal.type === 4 ? (
							<Text>{props.proposal.approvealThreshold}</Text>
						) : null}
						{props.proposal.isExecutable.result ? (
							<Text color="green.400"> Yes </Text>
						) : (
							<Text color="red.400"> No </Text>
						)}
						{!props.proposal.isExecutable.result ? (
							<Text color="red.400">{props.proposal.isExecutable.reason}</Text>
						) : null}
						{!props.proposal.isExecutable.result &&
						props.proposal.isExecutable.reason === "TIMELOCK_NOT_ENDED" ? (
							<Text>{calcTimeDiff(props.proposal.timeLockEnd)}</Text>
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
								if (!props.proposal.rejected) {
									await handleFunction(3);
								} else {
									setErrorMessage("This proposal has already been rejected");
								}
							}}
							isDisabled={props.proposal.rejected}
						>
							Reject
						</Button>
					) : null}
					{props.proposal.type === 4 &&
					props.proposal.approvals < props.proposal.approvealThreshold ? (
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
							isDisabled={!props.proposal.isExecutable.result}
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
