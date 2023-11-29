import {
	Box,
	Button,
	Spinner,
	useDisclosure,
	Flex,
	Text,
} from "@chakra-ui/react";
import { useState, useContext } from "react";
import UserDataContext from "src/contexts/userData";
import { _removeRecover } from "../../scripts/plugins/index";
import EnabledModal from "../Modals/EnabledModal";

const MethodRemoval = (props) => {
	const { safeSDK, pluginAddress } = useContext(UserDataContext);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [openProposedModal, setOpenProposedModal] = useState(false);
	const [result, setResult] = useState<boolean>(false);

	// Function to open the modal from the parent
	const openModal = () => {
		setOpenProposedModal(true);
		onOpen();
	};

	// Function to close the modal from the parent
	const closeModal = () => {
		setOpenProposedModal(false);
		onClose();
	};

	return (
		<Box textAlign="center" alignItems="center">
			<Button
				sx={{ mt: "35px" }}
				// colorScheme="red"
				bg="#C53030"
				color="white"
				w="55%"
				onClick={async () => {
					setErrorMessage("");

					setLoading(true);
					const ret = await await _removeRecover(
						safeSDK,
						pluginAddress,
						props.method
					);
					console.log("ret: ", ret);
					if (ret.result) {
						setResult(true);
					} else if (!ret.result && ret.txHash === "") {
						console.log("ret.result: ", ret.result);
						setErrorMessage("Something went wrong");
						setLoading(false);
						return;
					}
					setTxHash(ret.txHash);
					openModal();
					setLoading(false);
				}}
			>
				Disable this method
			</Button>
			{loading && (
				<Flex justifyContent="center" alignItems="center">
					<Spinner mt={10} color="gray.300" />
				</Flex>
			)}
			<Text mt={4} color="red.500" mb={4}>
				{errorMessage}
			</Text>
			<EnabledModal
				isOpen={isOpen || openProposedModal}
				onOpen={onOpen}
				onClose={closeModal}
				result={result}
				txHash={txHash}
				enable={false}
			/>
		</Box>
	);
};

export default MethodRemoval;
