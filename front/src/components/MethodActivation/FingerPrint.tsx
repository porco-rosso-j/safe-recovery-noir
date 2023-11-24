import { Box, Button, Text } from "@chakra-ui/react";
import { useContext, useState, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import {
	_isMethodEnabled,
	_addWebAuthnRecover,
} from "../../scripts/plugins/index";

const EnableFingerPrint = () => {
	const { safeSDK } = useContext(UserDataContext);
	const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			const isEnabled = await _isMethodEnabled(2);
			console.log("isEnabled: ", isEnabled);
			if (isEnabled) {
				setIsMethodEnabled(isEnabled);
			}
		})();
	});

	return (
		<Box pt="10px">
			{!isMethodEnabled ? (
				<Box>
					<Text mb={3} fontSize={15} mx="25px">
						Create a keypair generated via webauthn. private key will be stored
						on your device securely while public key will be stored on smart
						contract.
					</Text>
					<Box
						sx={{ marginBottom: "6px" }}
						textAlign="center"
						alignItems="center"
					>
						<Button
							sx={{ mt: "35px" }}
							colorScheme="teal"
							w="55%"
							onClick={async () => {
								await _addWebAuthnRecover(safeSDK);
								const _isMthodEnabled = await _isMethodEnabled(2);
								if (_isMthodEnabled) {
									setIsMethodEnabled(_isMthodEnabled);
								}
							}}
						>
							Enable this method
						</Button>
					</Box>
				</Box>
			) : (
				<Box>Enabled</Box>
			)}
		</Box>
	);
};

export default EnableFingerPrint;
