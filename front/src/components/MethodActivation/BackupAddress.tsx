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
import { useContext, useEffect, useState } from "react";
import MethodRemoval from "./Removal";
import EnabledModal from "../Modals/EnabledModal";
import { Timelock, TimelockInput } from "./Common";
import { useIsMethodEnabled, useAddRecover } from "src/hooks";
import { getHashedAddr, getRecoveryTimelock } from "src/scripts/plugins/view";
import UserDataContext from "src/contexts/userData";
import { shortenAddress } from "src/scripts/utils/address";
import { getTimeFromTimestamp } from "src/scripts/utils/helper";
import { pedersenHash } from "src/scripts/utils/pedersen";

const EnableBackupAddress = (props) => {
	const { pluginAddress } = useContext(UserDataContext);
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { isMethodEnabled } = useIsMethodEnabled(props.methodIndex);
	const { loading, errorMessage, txHash, result, setErrorMessage, addRecover } =
		useAddRecover(onOpen);

	const [pendingNewOwner, setPendingNewOwner] = useState<string>("");
	const [timeLock, setTimelock] = useState<number>(0);

	const [backupAddressHash, setBackupAddressHash] = useState<string>("");
	const [isCorrectHash, setIsCorrectHash] = useState<boolean>(false);
	const [addressInput, setAddressInput] = useState<string>("");

	useEffect(() => {
		(async () => {
			if (isMethodEnabled && pluginAddress) {
				const hashedAddr = await getHashedAddr(pluginAddress);
				if (hashedAddr !== "") {
					setBackupAddressHash(hashedAddr);
				}

				const timelock = await getRecoveryTimelock(
					pluginAddress,
					props.methodIndex
				);
				if (timelock !== 0) {
					setTimelock(Number(timelock));
				}
			}
		})();
	});

	const handleCompareAddrWithHash = async (address: string) => {
		if (address !== "") {
			setAddressInput(address);
			const hash = await pedersenHash([address]);
			console.log("hash: ", hash);
			if (hash === backupAddressHash) {
				setIsCorrectHash(true);
			} else {
				setIsCorrectHash(false);
			}
		} else {
			setIsCorrectHash(false);
			setAddressInput("");
		}
	};

	return (
		<Box
			py={5}
			px={1}
			mt={6}
			borderRadius="lg"
			boxShadow="lg"
			borderColor={"white"}
			borderWidth={"1px"}
		>
			{!isMethodEnabled ? (
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
			) : (
				<Box>
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
							<Text>- Backup address hash :</Text>
						</VStack>
						<VStack spacing={2} fontSize={14} align="end">
							<Text>Enabled</Text>
							<Text>{getTimeFromTimestamp(timeLock)}</Text>
							<Text>{shortenAddress(backupAddressHash)}</Text>
						</VStack>
					</Flex>
					<Box mt={7}>
						<Text fontSize={14} mb={3}>
							Compare an address with the hash
						</Text>
						<Input
							sx={inputStyle}
							textAlign="center"
							w={350}
							px={10}
							size="xs"
							type="address"
							placeholder="0xAbCd..."
							onChange={(e) => handleCompareAddrWithHash(e.target.value)}
						/>
						{isCorrectHash && addressInput !== "" ? (
							<Text mt={2} fontSize={13} color={"green.400"}>
								This is correct backup address!
							</Text>
						) : !isCorrectHash && addressInput !== "" ? (
							<Text mt={2} fontSize={13} color={"red.400"}>
								wrong backup address
							</Text>
						) : null}
					</Box>

					<MethodRemoval method={1} />
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

export default EnableBackupAddress;
