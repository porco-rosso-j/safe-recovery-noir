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
import { inputStyle } from "src/theme";
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
				<Text mb={8} fontSize={15}>
					Propose recovery. The old owner will be replaced with the new owner.
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
						{props.method === 3 ? <Text>4. Secret :</Text> : null}
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
							// defaultValue={addresses[0]} // should delete in testnet
							onChange={(e) => setPendingNewOwner(e.target.value)}
						/>
						<Input
							sx={inputStyle}
							textAlign="center"
							size="xl"
							placeholder="1"
							onChange={(e) => setThreshold(Number(e.target.value))}
						/>
						{props.method === 3 ? (
							<Input
								sx={inputStyle}
								textAlign="center"
								size="xl"
								placeholder="satoshi123"
								onChange={(e) => setThreshold(Number(e.target.value))}
							/>
						) : null}
					</VStack>
				</Flex>
			</Box>
			<Box sx={{ marginBottom: "6px" }} textAlign="center" alignItems="center">
				<Button
					sx={{ mt: "35px" }}
					colorScheme="teal"
					w="35%"
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
									const _recoveryCount = await getRecoveryCount(pluginAddress);
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
	);
};

export default ProposeRecovery;
