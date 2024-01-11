import {
	Box,
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
	_getIsRecoveryExecutable,
	getSocialRecoveryThreshold,
} from "../scripts/plugins/index";
import ExecutedModal from "./Modals/ExecuteModal";
import { calcTimeDiff, typeName } from "src/scripts/utils/helper";
import { Proposal as ProposalType, txResult } from "../scripts/plugins/types";

const Proposal = (props: {
	proposal: ProposalType;
	proposalId: number;
	setProposalId: (id: number) => void;
}) => {
	const { safeSDK, safeAddress, signer, saveCurrentOwner, pluginAddress } =
		useContext(UserDataContext);
	const { isOpen, onOpen, onClose } = useDisclosure();

	// const [proposalId, setProposalId] = useState<number>(0);
	const [functionType, setFunctionType] = useState<number>(0);
	const [socialRecoveryThreshold, setSocialRecoveryThreshold] =
		useState<number>(0);

	const [nonExecutableReason, setNonExecutableReason] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");

	const [isRecoveryExecutable, setIsRecoveryExecutable] =
		useState<boolean>(true);
	const [fucntionResult, setFunctionResult] = useState<boolean>(false);
	const [openProposedModal, setOpenProposedModal] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		(async () => {
			if (props.proposalId !== 0) {
				const IsRecoveryExecutable = await _getIsRecoveryExecutable(
					pluginAddress,
					props.proposalId
				);
				console.log("IsRecoveryExecutable: ", IsRecoveryExecutable);
				setIsRecoveryExecutable(IsRecoveryExecutable.result);
				if (!IsRecoveryExecutable.result) {
					setNonExecutableReason(IsRecoveryExecutable.reason);
				}

				if (props.proposal.type === 4) {
					setSocialRecoveryThreshold(
						await getSocialRecoveryThreshold(pluginAddress)
					);
				}
			}
		})();
	});

	const handleFunction = async (funcType: number) => {
		setErrorMessage("");
		setLoading(true);

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
		setLoading(false);
		openModal();
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
						{!isRecoveryExecutable ? (
							<Text ml={4} color="red.500">
								*Reason:
							</Text>
						) : null}
						{!isRecoveryExecutable &&
						nonExecutableReason === "DELAY_NOT_EXPIRED" ? (
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
							<Text>{props.proposal.threshold}</Text>
						) : null}
						<Text>{isRecoveryExecutable ? "Yes" : "No"}</Text>

						{!isRecoveryExecutable ? (
							<Text color="red.500">{nonExecutableReason}</Text>
						) : null}
						{!isRecoveryExecutable &&
						nonExecutableReason === "DELAY_NOT_EXPIRED" ? (
							<Text>{calcTimeDiff(props.proposal.deadline)}</Text>
						) : null}
					</VStack>
				</Flex>
				<HStack>
					{safeSDK && safeAddress !== "" ? (
						<Button
							sx={{ mt: "35px", mr: "30px" }}
							bg="#C53030"
							color="white"
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
					props.proposal.approvals < socialRecoveryThreshold ? (
						<Button
							sx={{ mt: "35px" }}
							colorScheme="blue"
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
							onClick={() => {
								handleFunction(1);
							}}
							isDisabled={!isRecoveryExecutable}
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
				<Button
					fontSize={15}
					mt="20px"
					h="25px"
					color="white"
					bgColor="gray.600"
					onClick={async () => {
						props.setProposalId(0);
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

export default Proposal;
