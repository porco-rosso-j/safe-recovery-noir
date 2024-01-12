import {
	Box,
	Input,
	Text,
	Button,
	Tooltip,
	Flex,
	Spinner,
	useDisclosure,
	VStack,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { inputStyle } from "src/theme";
import { useState } from "react";
import MethodRemoval from "./Removal";
import EnabledModal from "../Modals/EnabledModal";
import { DelayPeriod, DelayInputForm } from "./Common";
import useIsMethodEnabled from "src/hooks/useIsMethodEnabled";
import useAddRecover from "src/hooks/useAddRecover";

const SecretWord = (props) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isMethodEnabled } = useIsMethodEnabled(props.methodIndex);
	const { loading, errorMessage, txHash, result, setErrorMessage, addRecover } =
		useAddRecover(onOpen);

	const [secretWord, setSecretWord] = useState("");
	const [delayValue, setDelayValue] = useState(0);

	return (
		<Box pt="10px">
			{!isMethodEnabled ? (
				<Box>
					<Text mb={8} fontSize={15} mx="25px">
						Store a secret passoword that will be used to recover Safe.
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
									label="`Secret word` is a password with the length less than 10, which should be kept securely."
								>
									<InfoIcon mr={2} mt={0.5} boxSize={3} color="blue.500" />
								</Tooltip>
								<Text>1. Secret word :</Text>
							</Flex>
							<DelayPeriod index={2} />
						</VStack>
						<VStack spacing={3.5} fontSize={14} align="end" w="345px" ml={2}>
							<Input
								sx={inputStyle}
								textAlign="center"
								size="xl"
								placeholder="satoshi123"
								onChange={(e) => {
									setErrorMessage("");
									if (e.target.value.length > 10) {
										setErrorMessage(
											"secret word's length shoule be less than 10"
										);
										return;
									}
									setSecretWord(e.target.value);
								}}
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
							w="35%"
							isLoading={loading}
							loadingText="Enabling"
							onClick={async () => {
								setErrorMessage("");
								if (secretWord !== "") {
									await addRecover({
										methodIndex: props.methodIndex,
										delayValue,
										secretWord,
									});
								} else {
									setErrorMessage("new owner address not set");
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
					<MethodRemoval method={3} />
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

export default SecretWord;
