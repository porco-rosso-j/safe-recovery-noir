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
	Box,
} from "@chakra-ui/react";
import { shortenTxHash } from "src/scripts/utils/address";

function ProposedModal(props) {
	const handleCheckProposal = async () => {
		console.log("handleCheckProposal in Modal");

		await props.handleCheckProposal();
		console.log("props.handleCheckProposal done");
		props.onClose();
		console.log("onClose");
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
					{props.result ? (
						<Box>
							<ModalHeader mt={4}>Successfully proposed!</ModalHeader>
							<ModalBody pb={6}>
								<Flex
									mx="auto"
									alignItems="center"
									justifyContent="space-between" // Align the button to the right
									flexDirection="column"
								>
									<Flex alignItems="strech">
										<VStack spacing={1} fontSize={16} align="start" mr={4}>
											<Text>Proposal Id:</Text>
											<Text>Transaction:</Text>
										</VStack>
										<VStack spacing={1} fontSize={16} textAlign={"center"}>
											<Text>{props.recoveryCount}</Text>
											<Link
												ml={2}
												href={"https://goerli.etherscan.io/tx/" + props.txHash}
												isExternal
												textDecoration="underline"
											>
												{shortenTxHash(props.txHash)}
											</Link>
										</VStack>
									</Flex>
									<Text
										onClick={handleCheckProposal}
										cursor="pointer"
										textDecoration="underline"
										_hover={{ color: "cyan" }}
										mt={7}
									>
										See the proposal details 👀
									</Text>
								</Flex>
							</ModalBody>
						</Box>
					) : (
						<Box>
							<ModalHeader mt={4} color="red">
								Propose Failed
							</ModalHeader>
							<ModalBody pb={6}>
								<Flex
									mx="auto"
									alignItems="center"
									justifyContent="space-between" // Align the button to the right
									flexDirection="column"
								>
									<Flex alignItems="strech">
										<VStack spacing={1} fontSize={16} align="start" mr={4}>
											<Text>Transaction:</Text>
										</VStack>
										<VStack spacing={1} fontSize={16} align="end">
											<Link
												ml={2}
												href={"https://goerli.etherscan.io/tx/" + props.txHash}
												isExternal
												textDecoration="underline"
											>
												{shortenTxHash(props.txHash)}
											</Link>
										</VStack>
									</Flex>
								</Flex>
							</ModalBody>
						</Box>
					)}
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

export default ProposedModal;
