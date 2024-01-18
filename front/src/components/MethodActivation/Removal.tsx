import { Box, Button, useDisclosure, Text } from "@chakra-ui/react";
import { useState } from "react";
import EnabledModal from "../Modals/EnabledModal";
import useRemoveRecover from "src/hooks/plugins/useRemoveRecover";

const MethodRemoval = (props) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { _removeRecover } = useRemoveRecover();

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
					const ret = await _removeRecover(props.method);
					console.log("ret: ", ret);
					if (ret.result) {
						setResult(true);
						props.handleDisable();
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
			<Text mt={4} color="red.400" mb={4}>
				{errorMessage}
			</Text>
			<EnabledModal
				isOpen={isOpen}
				onOpen={onOpen}
				onClose={onClose}
				fucntionResult={result}
				txHash={txHash}
				enable={false}
			/>
		</Box>
	);
};

export default MethodRemoval;
