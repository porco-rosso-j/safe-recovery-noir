import {
	Box,
	Input,
	Button,
	Text,
	VStack,
	Tooltip,
	Flex,
	useDisclosure,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { inputStyle } from "src/theme";
import { useState } from "react";
import MethodRemoval from "./Removal";
import EnabledModal from "../Modals/EnabledModal";
import { Timelock, TimelockInput } from "./Common";
import { useIsMethodEnabled, useAddRecover } from "src/hooks";

const EnableBackupAddress = (props) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isMethodEnabled } = useIsMethodEnabled(props.methodIndex);
	const { loading, errorMessage, txHash, result, setErrorMessage, addRecover } =
		useAddRecover(onOpen);

	const [pendingNewOwner, setPendingNewOwner] = useState<string>("");
	const [timeLock, setTimelock] = useState<number>(0);

	return (
		<Box pt="10px">
			{isMethodEnabled ? (
				<Box>
					This method has already been enabled
					<MethodRemoval method={1} />
				</Box>
			) : (
				<Box>
					<Text mb={8} fontSize={15} mx="25px">
						Register private backup address. Only its hash is stored on the
						plugin contract and can be used to recover your Safe.
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
							<Timelock index={2} />
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
							<TimelockInput setTimelock={setTimelock} />
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
										timeLock,
									});
								} else {
									setErrorMessage("New owner address not set");
								}
							}}
						>
							Enable method
						</Button>
						<Text mt={4} color="red.400" mb={4}>
							{errorMessage}
						</Text>
					</Box>
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
