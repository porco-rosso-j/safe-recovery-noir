import {
	Box,
	Input,
	Flex,
	Button,
	Text,
	VStack,
	Link,
	Spinner,
	useDisclosure,
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import {
	_isMethodEnabled,
	getRecoveryCount,
	_proposeRecovery,
} from "../scripts/plugins/index";
import { addresses } from "src/scripts/constants/addresses";
import ProposedModal from "./Modals/ProposedModal";

const ProposeRecovery = (props) => {
	const { safeAddress, signer, currentOwner, pluginAddress } =
		useContext(UserDataContext);
	const [ownerReplaced, setOwnerReplaced] = useState<string>(currentOwner);
	// const [pendingNewOwner, setPendingNewOwner] = useState<string>(addresses[0]);
	const [pendingNewOwner, setPendingNewOwner] = useState<string>("");
	const [threshold, setThreshold] = useState<number>(0);
	const [secret, setSecret] = useState<string>("");
	const [recoveryCount, setRecoveryCount] = useState<number>(0);
	const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [openProposedModal, setOpenProposedModal] = useState(false);
	const [result, setResult] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			const isEnabled = await _isMethodEnabled(props.method, pluginAddress);
			console.log("isEnabled: ", isEnabled);
			setIsMethodEnabled(isEnabled);
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

	return (
		<Box pt="3px">
			{/* {closeSuccess ? ( */}
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
									// defaultValue={addresses[0]} // should delete in testnet
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
								setErrorMessage("");
								if (
									pendingNewOwner !== "" &&
									ownerReplaced !== "" &&
									pendingNewOwner !== ownerReplaced
								) {
									setLoading(true);

									console.log("method: ", props.method);
									console.log("secret: ", secret);
									const ret = await _proposeRecovery(
										props.method,
										signer,
										pluginAddress,
										threshold,
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
									openModal();
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
					{loading && (
						<Flex justifyContent="center" alignItems="center">
							<Spinner mt={10} color="gray.300" />
						</Flex>
					)}
					<Text mt={4} color="red.500" mb={4}>
						{errorMessage}
					</Text>
					<ProposedModal
						isOpen={isOpen || openProposedModal}
						onOpen={onOpen}
						onClose={closeModal}
						result={result}
						txHash={txHash}
						recoveryCount={recoveryCount}
					/>
				</Box>
			</Box>
		</Box>
	);
};

export default ProposeRecovery;
