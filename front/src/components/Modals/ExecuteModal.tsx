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
import { shortenTxHash } from "src/scripts/utils/address";

type ExecuteResultModalType = {
	isOpen: boolean;
	onOpen: () => void;
	onClose: () => void;
	fucntionResult: boolean;
	txHash: string;
	functionType: number;
	setFunctionType: (num: number) => void;
};

function ExecutedModal(props: ExecuteResultModalType) {
	const handleClose = () => {
		props.setFunctionType(0);
		props.onClose();
	};
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
						<ModalHeader color="green.400" mt={4}>
							{props.functionType === 1
								? "Successfully Executed!"
								: props.functionType === 2
								? "Successfully Approved!"
								: props.functionType === 3
								? "Successfully Rejected!"
								: null}
						</ModalHeader>
					) : (
						<ModalHeader color="red.400" mt={4}>
							{props.functionType === 1
								? "Execution Failed"
								: props.functionType === 2
								? "Approval Failed"
								: props.functionType === 3
								? "Rejection Failed"
								: null}
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
										href={"https://sepolia.etherscan.io/tx/" + props.txHash}
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
						<Button mb={5} bg="#CBD5E0" onClick={handleClose}>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
}

export default ExecutedModal;
