import {
	Box,
	Input,
	Flex,
	Button,
	Text,
	VStack,
	useDisclosure,
} from "@chakra-ui/react";
import { inputStyle } from "src/theme";
import { useContext, useState } from "react";
import UserDataContext from "src/contexts/userData";
import { getRecoveryCount, _proposeRecovery } from "../scripts/plugins/index";
import { getProposal } from "src/scripts/plugins/view";
import ProposedModal from "./Modals/ProposedModal";
import ProposalDetail from "./ProposalDetail";
import { ProposalType } from "../scripts/plugins/types";
import useIsMethodEnabled from "src/hooks/useIsMethodEnabled";

const ProposeRecovery = (props: {
	methodIndex: number;
	setTabIndex: (index: number) => void;
}) => {
	const { signer, currentOwner, pluginAddress } = useContext(UserDataContext);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isMethodEnabled } = useIsMethodEnabled(props.methodIndex);

	const [ownerReplaced, setOwnerReplaced] = useState<string>(currentOwner);
	const [pendingNewOwner, setPendingNewOwner] = useState<string>("");
	const [threshold, setThreshold] = useState<number>(1);
	const [secret, setSecret] = useState<string>("");
	const [recoveryCount, setRecoveryCount] = useState<number>(0);

	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");

	const [result, setResult] = useState<boolean>(false);
	const [proposal, setProposal] = useState<ProposalType>(null);
	const [openProposal, setOpenProposal] = useState<boolean>(false);

	console.log("currentOwner: ", currentOwner);

	const handleCheckProposal = async () => {
		console.log("handleCheckProposal in ProposeRecovery");

		const proposal = await getProposal(BigInt(recoveryCount), pluginAddress);
		console.log("proposal");
		setProposal(proposal);
		console.log("proposal set: ", proposal);
		setOpenProposal(true);
		console.log("setOpenProposal");
	};

	const handleCheckProposalHistory = () => {
		console.log("tab to 2");
		props.setTabIndex(2);
	};

	return (
		<Box pt="3px">
			{openProposal ? (
				<Box>
					<ProposalDetail
						proposal={proposal}
						proposalId={BigInt(recoveryCount)}
						fromProposeTab={true}
						setOpenProposal={setOpenProposal}
					/>
					<Text
						onClick={handleCheckProposalHistory}
						cursor="pointer"
						_hover={{ color: "cyan" }}
						mt={7}
					>
						Check other proposals?
					</Text>
				</Box>
			) : (
				<Box>
					<Box>
						<Text mb={8} fontSize={15}>
							The old owner will be replaced with the new owner.
						</Text>
						<Flex
							mt="20px"
							mx="auto"
							justifyContent="center"
							alignItems="strech"
							w="100%"
						>
							<VStack spacing={3.5} fontSize={14} align="start">
								<Text>1. Old owner :</Text>
								<Text>2. New owner :</Text>
								<Text>3. New Threshold :</Text>
								{props.methodIndex === 3 ? <Text>4. Secret word :</Text> : null}
							</VStack>
							<VStack spacing={3} fontSize={14} align="end" w="345px" ml={2}>
								<Input
									sx={inputStyle}
									textAlign="center"
									size="xl"
									placeholder="0x1AbCd..."
									defaultValue={currentOwner}
									onChange={(e) => setOwnerReplaced(e.target.value)}
								/>
								<Input
									sx={inputStyle}
									textAlign="center"
									size="xl"
									placeholder="0x2EfgH..."
									onChange={(e) => setPendingNewOwner(e.target.value)}
								/>
								<Input
									sx={inputStyle}
									textAlign="center"
									size="xl"
									placeholder="1"
									defaultValue={1}
									onChange={(e) => setThreshold(Number(e.target.value))}
								/>
								{props.methodIndex === 3 ? (
									<Input
										sx={inputStyle}
										textAlign="center"
										size="xl"
										placeholder="satoshi123"
										onChange={(e) => setSecret(e.target.value)}
									/>
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
							w="35%"
							isLoading={loading}
							loadingText="Executing"
							onClick={async () => {
								if (isMethodEnabled) {
									setErrorMessage("");
									if (
										pendingNewOwner !== "" &&
										ownerReplaced !== "" &&
										pendingNewOwner !== ownerReplaced
									) {
										setLoading(true);

										console.log("method: ", props.methodIndex);
										console.log("secret: ", secret);
										const ret = await _proposeRecovery(
											BigInt(props.methodIndex),
											signer,
											pluginAddress,
											BigInt(threshold),
											ownerReplaced,
											pendingNewOwner,
											secret
										);
										console.log("ret: ", ret);
										if (ret.result) {
											const _recoveryCount = await getRecoveryCount(
												pluginAddress
											);
											setRecoveryCount(Number(_recoveryCount));
											setResult(true);
										} else if (!ret.result && ret.txHash === "") {
											console.log("ret.result: ", ret.result);
											setErrorMessage("Something went wrong");
											setLoading(false);
											return;
										}
										setTxHash(ret.txHash);
										onOpen();
										setLoading(false);
									} else {
										setErrorMessage("Addresses not correctly set");
									}
								} else {
									setErrorMessage("This method hasn't been enabled");
								}
							}}
						>
							Propose Recovery
						</Button>
						{loading && (props.methodIndex === 1 || props.methodIndex === 4) ? (
							<Text mt={5}>
								{" "}
								*you need to sign a message on connected wallet <br /> to
								generate zk-proof{" "}
							</Text>
						) : loading && props.methodIndex === 2 ? (
							<Text mt={5}>
								{" "}
								*you need to provide TouchID fingerprint or Yubikey PIN <br />
								for WebAuthn to generate zk-proof{" "}
							</Text>
						) : null}
						<Text mt={4} color="red.400" mb={4}>
							{errorMessage}
						</Text>
						<ProposedModal
							isOpen={isOpen}
							onOpen={onOpen}
							onClose={onClose}
							result={result}
							txHash={txHash}
							recoveryCount={recoveryCount}
							handleCheckProposal={handleCheckProposal}
						/>
					</Box>
				</Box>
			)}
		</Box>
	);
};

export default ProposeRecovery;
