import {
	Box,
	Input,
	Text,
	Button,
	Tooltip,
	Flex,
	useDisclosure,
	VStack,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { inputStyle } from "src/theme";
import { useContext, useEffect, useState } from "react";
import MethodRemoval from "./Removal";
import EnabledModal from "../Modals/EnabledModal";
import { Timelock, TimelockInput } from "./Common";
import { useIsMethodEnabled, useAddRecover } from "src/hooks";
import UserDataContext from "src/contexts/userData";
import { getHashededSecret, recoveryTimeLock } from "src/scripts/plugins/view";
import { pedersenHash } from "src/scripts/utils/pedersen";
import { getTimeFromTimestamp } from "src/scripts/utils/helper";
import { shortenAddress } from "src/scripts/utils/address";
import { getPaddedSecretBytes } from "src/scripts/utils/secret";

const SecretWord = (props) => {
	const { pluginAddress } = useContext(UserDataContext);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isMethodEnabled } = useIsMethodEnabled(props.methodIndex);
	const { loading, errorMessage, txHash, result, setErrorMessage, addRecover } =
		useAddRecover(onOpen);

	const [secretWord, setSecretWord] = useState("");
	const [timeLock, setTimelock] = useState(0);

	const [secretHash, setSecretHash] = useState<string>("");
	const [isCorrectHash, setIsCorrectHash] = useState<boolean>(false);
	const [secretInpiut, setSecretInput] = useState<string>("");

	useEffect(() => {
		(async () => {
			if (isMethodEnabled && pluginAddress) {
				const hashedSecret = await getHashededSecret(pluginAddress);
				if (hashedSecret !== "") {
					setSecretHash(hashedSecret);
				}

				const timelock = await recoveryTimeLock(pluginAddress);
				if (timelock !== 0) {
					setTimelock(Number(timelock));
				}
			}
		})();
	});

	const handleCompareSecretWithHash = async (secret: string) => {
		if (secret !== "") {
			setSecretInput(secret);

			const secretBytes = await getPaddedSecretBytes(secret);
			const hash = await pedersenHash(secretBytes);
			if (hash === secretHash) {
				setIsCorrectHash(true);
			} else {
				setIsCorrectHash(false);
			}
		} else {
			setIsCorrectHash(false);
			setSecretInput("");
		}
	};

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
							<Timelock index={2} />
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
							w="35%"
							isLoading={loading}
							loadingText="Enabling"
							onClick={async () => {
								setErrorMessage("");
								if (secretWord !== "") {
									await addRecover({
										methodIndex: props.methodIndex,
										timeLock,
										secretWord,
									});
								} else {
									setErrorMessage("new owner address not set");
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
			) : (
				<Box
					p={5}
					borderRadius="lg"
					boxShadow="lg"
					borderColor={"white"}
					borderWidth={"1px"}
				>
					<Text as="b">Setting</Text>
					<Flex
						mt="20px"
						justifyContent="center"
						alignItems="strech"
						w="100%"
						gap={10}
					>
						<VStack spacing={2} fontSize={14} align="start">
							<Text>- Status :</Text>
							<Text>- Timelock :</Text>
							<Text>- Secret word hash :</Text>
						</VStack>
						<VStack spacing={2} fontSize={14} align="end">
							<Text>Enabled</Text>
							<Text>{getTimeFromTimestamp(timeLock)}</Text>
							<Text>{shortenAddress(secretHash)}</Text>
						</VStack>
					</Flex>
					<Box mt={7}>
						<Text fontSize={14} mb={3}>
							Compare secret word with the hash
						</Text>
						<Input
							sx={inputStyle}
							textAlign="center"
							w={350}
							px={10}
							size="xs"
							placeholder="0xAbCd..."
							onChange={(e) => handleCompareSecretWithHash(e.target.value)}
						/>
						{isCorrectHash && secretInpiut !== "" ? (
							<Text mt={2} fontSize={13} color={"green.400"}>
								This is correct secret word!
							</Text>
						) : !isCorrectHash && secretInpiut !== "" ? (
							<Text mt={2} fontSize={13} color={"red.400"}>
								wrong secret word
							</Text>
						) : null}
					</Box>
					<MethodRemoval method={3} />
				</Box>
			)}
			<EnabledModal
				isOpen={isOpen}
				onOpen={onOpen}
				onClose={onClose}
				fucntionResult={result}
				txHash={txHash}
				enable={true}
			/>
		</Box>
	);
};

export default SecretWord;
