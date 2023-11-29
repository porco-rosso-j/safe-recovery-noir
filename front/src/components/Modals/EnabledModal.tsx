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

function EnabledModal(props) {
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
				<ModalContent color={"black"} textAlign="center" alignItems="center">
					{props.result ? (
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
					<ModalFooter>
						<Button onClick={props.onClose}>Close</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
}

export default EnabledModal;
