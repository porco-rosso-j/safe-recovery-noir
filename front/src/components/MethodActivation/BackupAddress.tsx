import {
	Box,
	Input,
	Button,
	Text,
	VStack,
	Select,
	Tooltip,
	FormControl,
	Flex,
	Spinner,
	useDisclosure,
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import {
	_isMethodEnabled,
	_addEcrecoverRecover,
} from "../../scripts/plugins/index";
import MethodRemoval from "./Removal";
import EnabledModal from "../Modals/EnabledModal";

const EnableBackupAddress = () => {
	const { safeSDK, isPluinEnabled, pluginAddress } =
		useContext(UserDataContext);
	const [pendingNewOwner, setPendingNewOwner] = useState<string>("");
	const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false);
	const [unit, setUnit] = useState<number>(1);
	const [delayValue, setDelayValue] = useState(0);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [openProposedModal, setOpenProposedModal] = useState(false);
	const [result, setResult] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			if (isPluinEnabled) {
				const isMethodEnabled = await _isMethodEnabled(1, pluginAddress);
				console.log("isMethodEnabled: ", isMethodEnabled);
				if (isMethodEnabled) {
					setIsMethodEnabled(isMethodEnabled);
				}
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

	return (
		<Box pt="3px">
			{!isMethodEnabled ? (
				<Box>
					<VStack spacing={1} flex={1}>
						<Text mb={3} fontSize={15} mx="25px">
							1. Set private backup address:
						</Text>
						<Input
							sx={{ w: "60%", mb: "5px" }}
							size="sm"
							type="address"
							placeholder="0xAbCd..."
							onChange={(e) => setPendingNewOwner(e.target.value)}
						/>
						<Tooltip
							placement="right-start"
							label="`Delay` refers to the period of time before a recovery proposal
								can be executed.
                (Recommendaed => 
                prod: >30 days | test: <10 sec)"
						>
							<Text mt={3} mb={2} fontSize={15} mx="25px">
								2. Set delay:
							</Text>
						</Tooltip>
						<FormControl px={40}>
							<Box display="flex" alignItems="center">
								<Input
									size="sm"
									type="number"
									placeholder="10"
									onChange={(e) => setDelayValue(Number(e.target.value) * unit)}
								/>

								<Select
									size="sm"
									onChange={(e) => setUnit(Number(e.target.value))}
								>
									<option value="1">sec</option>
									<option value="60">min</option>
									<option value="3600">hour</option>
									<option value="86400">day</option>
								</Select>
							</Box>
						</FormControl>
					</VStack>
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
								if (pendingNewOwner !== "") {
									setLoading(true);
									const ret = await _addEcrecoverRecover(
										safeSDK,
										pluginAddress,
										pendingNewOwner,
										delayValue
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
									openModal();
									setLoading(false);
								} else {
									setErrorMessage("New owner address not set");
								}
							}}
						>
							Enable this method
						</Button>
						{loading && (
							<Flex justifyContent="center" alignItems="center">
								<Spinner mt={10} color="gray.300" />
							</Flex>
						)}
						<Text mt={4} color="red.500" mb={4}>
							{errorMessage}
						</Text>
					</Box>
				</Box>
			) : (
				<Box>
					This method has already been enabled
					<MethodRemoval method={1} />
				</Box>
			)}
			<EnabledModal
				isOpen={isOpen || openProposedModal}
				onOpen={onOpen}
				onClose={closeModal}
				result={result}
				txHash={txHash}
				enable={true}
			/>
		</Box>
	);
};

export default EnableBackupAddress;
