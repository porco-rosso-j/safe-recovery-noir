import {
	Button,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	VStack,
	Text,
	Link,
	Flex,
} from "@chakra-ui/react";
import { useEtherscanLink } from "src/hooks";
import { shortenTxHash } from "src/scripts/utils/helper";

type EnabledResultModalType = {
	isOpen: boolean;
	onOpen: () => void;
	onClose: () => void;
	fucntionResult: boolean;
	txHash: string;
	enable: boolean;
};

function EnabledModal(props: EnabledResultModalType) {
	const { etherscanLink } = useEtherscanLink();

	return (
		<>
			<Modal
				size="xs"
				isCentered
				closeOnOverlayClick={false}
				isOpen={props.isOpen}
				onClose={props.onClose}
			>
				<ModalOverlay />
				<ModalContent
					bg={"#2e2e2e"}
					color={"white"}
					borderRadius="lg"
					borderColor={"#00796F"}
					borderWidth={"1px"}
					textAlign="center"
					alignItems="center"
				>
					{props.fucntionResult ? (
						<ModalHeader mt={4}>
							{props.enable ? "Successfully Enabled!" : "Method Disabled"}
						</ModalHeader>
					) : (
						<ModalHeader color="red" mt={4}>
							{props.enable ? "Enable Failed" : "Disable Failed"}
						</ModalHeader>
					)}

					<ModalBody pb={6}>
						<Flex
							mx="auto"
							alignItems="center"
							justifyContent="space-between" // Align the button to the right
							flexDirection="column"
						>
							<Flex alignItems="strech">
								<VStack spacing={1} fontSize={16} align="start" mr={3}>
									<Text>Transaction:</Text>
								</VStack>
								<VStack spacing={1} fontSize={16} align="end">
									<Link
										ml={2}
										href={etherscanLink(props.txHash)}
										isExternal
										textDecoration="underline"
									>
										{shortenTxHash(props.txHash)}
									</Link>
								</VStack>
							</Flex>
						</Flex>
					</ModalBody>
					<ModalFooter>
						<Button mb={5} bg="#CBD5E0" onClick={props.onClose}>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
}

export default EnabledModal;
