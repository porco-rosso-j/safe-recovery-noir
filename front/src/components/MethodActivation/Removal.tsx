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
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");
	const [result, setResult] = useState<boolean>(false);

	return (
		<Box textAlign="center" alignItems="center">
			<Button
				sx={{ mt: "35px" }}
				bg="#C53030"
				color="white"
				isLoading={loading}
				loadingText="Removing"
				_hover={{
					bg: "#9B2C2C",
				}}
				w="35%"
				onClick={async () => {
					setErrorMessage("");

					setLoading(true);
					const ret = await _removeRecover(
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
					onOpen();
					setLoading(false);
				}}
			>
				Disable this method
			</Button>
			<Text mt={4} color="red.500" mb={4}>
				{errorMessage}
			</Text>
			<EnabledModal
				isOpen={isOpen}
				onOpen={onOpen}
				onClose={onClose}
				result={result}
				txHash={txHash}
				enable={false}
			/>
		</Box>
	);
};

export default MethodRemoval;
