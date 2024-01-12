import {
	Box,
	Button,
	Text,
	Flex,
	VStack,
	Spinner,
	useDisclosure,
	Link,
} from "@chakra-ui/react";
import { useState } from "react";
import MethodRemoval from "./Removal";
import EnabledModal from "../Modals/EnabledModal";
import { DelayPeriod, DelayInputForm } from "./Common";
import useIsMethodEnabled from "src/hooks/useIsMethodEnabled";
import useAddRecover from "src/hooks/useAddRecover";

const EnableFingerPrint = (props) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isMethodEnabled } = useIsMethodEnabled(props.methodIndex);

	const { loading, errorMessage, txHash, result, addRecover } =
		useAddRecover(onOpen);

	const [delayValue, setDelayValue] = useState(0);

	return (
		<Box pt="10px">
			{!isMethodEnabled ? (
				<Box>
					<Text mb={8} fontSize={15} mx="25px">
						{"Create a keypair that is generated from your fingerprint via "}
						<Link
							textDecoration="underline"
							href="https://webauthn.io/"
							isExternal
						>
							WebAuthn
						</Link>
						{". Private key will be stored on your device securely."}
					</Text>
					<Flex
						mt="20px"
						mx="auto"
						justifyContent="center"
						alignItems="strech"
						w="100%"
					>
						<VStack spacing={4} fontSize={14} align="start">
							<DelayPeriod index={1} />
						</VStack>
						<VStack spacing={3.5} fontSize={14} align="end" w="345px" ml={2}>
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
								await addRecover({
									methodIndex: props.methodIndex,
									delayValue,
								});
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
					<MethodRemoval method={2} />
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

export default EnableFingerPrint;
