import { Box, Button } from "@chakra-ui/react";
import { useContext } from "react";
import UserDataContext from "src/contexts/userData";
import { _removeRecover } from "../../scripts/plugins/index";

const MethodRemoval = (props) => {
	const { safeSDK } = useContext(UserDataContext);

	return (
		<Box textAlign="center" alignItems="center">
			<Button
				sx={{ mt: "35px" }}
				colorScheme="red"
				w="55%"
				onClick={async () => {
					await _removeRecover(safeSDK, props.method);
				}}
			>
				Disable this method
			</Button>
		</Box>
	);
};

export default MethodRemoval;
