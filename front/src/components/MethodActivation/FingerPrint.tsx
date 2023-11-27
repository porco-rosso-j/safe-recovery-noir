import {
	Box,
	Button,
	Text,
	Tooltip,
	FormControl,
	Select,
	Input,
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import {
	_isMethodEnabled,
	_addWebAuthnRecover,
} from "../../scripts/plugins/index";
import MethodRemoval from "./Removal";

const EnableFingerPrint = () => {
	const { safeSDK } = useContext(UserDataContext);
	const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false);
	const [unit, setUnit] = useState<number>(1);
	const [delayValue, setDelayValue] = useState(0);

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
						Create a keypair generated from your fingerprint via Webauthn.
						Private key will be stored on your device securely.
					</Text>
					<Tooltip
						placement="right-start"
						label="`Delay` refers to the period of time before a recovery proposal
								can be executed.
                (Recommendaed => 
                prod: >30 days | test: <10 sec)"
					>
						<Text mt={3} mb={2} fontSize={15} mx="25px">
							Set delay:
						</Text>
					</Tooltip>
					<FormControl px={40}>
						<Box display="flex" alignItems="center">
							<Input
								size="sm"
								type="number"
								placeholder="10"
								onChange={(e) => setDelayValue(Number(e.target.value) * unit)}
							/>

							<Select
								size="sm"
								onChange={(e) => setUnit(Number(e.target.value))}
							>
								<option value="1">sec</option>
								<option value="60">min</option>
								<option value="3600">hour</option>
								<option value="86400">day</option>
							</Select>
						</Box>
					</FormControl>
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
								await _addWebAuthnRecover(safeSDK, delayValue);
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
				<Box>
					This method has already been enabled
					<MethodRemoval method={2} />
				</Box>
			)}
		</Box>
	);
};

export default EnableFingerPrint;
