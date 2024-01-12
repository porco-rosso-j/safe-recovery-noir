import {
	Box,
	Input,
	Button,
	Text,
	VStack,
	Tooltip,
	Flex,
	Spinner,
	useDisclosure,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { inputStyle } from "src/theme";
import { useState } from "react";
import MethodRemoval from "./Removal";
import EnabledModal from "../Modals/EnabledModal";
import { DelayPeriod, DelayInputForm } from "./Common";
import useIsMethodEnabled from "src/hooks/useIsMethodEnabled";
import useAddRecover from "src/hooks/useAddRecover";

const EnableBackupAddress = (props) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isMethodEnabled } = useIsMethodEnabled(props.methodIndex);
	const { loading, errorMessage, txHash, result, setErrorMessage, addRecover } =
		useAddRecover(onOpen);

	const [pendingNewOwner, setPendingNewOwner] = useState<string>("");
	const [delayValue, setDelayValue] = useState(0);

	return (
		<Box pt="10px">
			{!isMethodEnabled ? (
				<Box>
					<Text mb={8} fontSize={15} mx="25px">
						Register backup address. It is hashed and stored on the plugin
						contract and can be used to recover your Safe.
					</Text>
					<Flex
						mt="20px"
						mx="auto"
						justifyContent="center"
						alignItems="strech"
						w="100%"
					>
						<VStack spacing={4} fontSize={14} align="start">
							<Flex justifyContent="space-between" alignItems="center">
								<Tooltip
									placement="bottom-start"
									label="`Backup adddress` should not be one of the Safe owners "
								>
									<InfoIcon mr={2} mt={0.5} boxSize={3} color="blue.500" />
								</Tooltip>
								<Text>1. Backup address :</Text>
							</Flex>
							<DelayPeriod index={2} />
						</VStack>
						<VStack spacing={3.5} fontSize={14} align="end" w="345px" ml={2}>
							<Input
								sx={inputStyle}
								textAlign="center"
								size="xl"
								type="address"
								placeholder="0xAbCd..."
								onChange={(e) => setPendingNewOwner(e.target.value)}
							/>
							<DelayInputForm setDelayValue={setDelayValue} />
						</VStack>
					</Flex>
					<Box
						sx={{ marginBottom: "6px" }}
						textAlign="center"
						alignItems="center"
					>
						<Button
							sx={{ mt: "35px" }}
							colorScheme="teal"
							isLoading={loading}
							loadingText="Enabling"
							w="35%"
							onClick={async () => {
								if (pendingNewOwner !== "") {
									setErrorMessage("");
									await addRecover({
										methodIndex: props.methodIndex,
										pendingNewOwner,
										delayValue,
									});
								} else {
									setErrorMessage("New owner address not set");
								}
							}}
						>
							Enable method
						</Button>
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
				isOpen={isOpen}
				onOpen={onOpen}
				onClose={onClose}
				result={result}
				txHash={txHash}
				enable={true}
			/>
		</Box>
	);
};

export default EnableBackupAddress;
