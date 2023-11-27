import {
	Box,
	Input,
	Button,
	Text,
	VStack,
	Select,
	Tooltip,
	FormControl,
	FormLabel,
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import {
	_isMethodEnabled,
	_addEcrecoverRecover,
} from "../../scripts/plugins/index";
import MethodRemoval from "./Removal";

const EnableBackupAddress = () => {
	const { safeSDK } = useContext(UserDataContext);
	const [pendingNewOwner, setPendingNewOwner] = useState<string>("");
	const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false);
	const [unit, setUnit] = useState<number>(1);
	const [delayValue, setDelayValue] = useState(0);

	useEffect(() => {
		(async () => {
			const _isPluginEnabled = await _isMethodEnabled(1);
			console.log("isPluginEnabled: ", _isPluginEnabled);
			if (_isPluginEnabled) {
				setIsMethodEnabled(_isPluginEnabled);
			}
		})();
	});

	return (
		<Box pt="3px">
			{!isMethodEnabled ? (
				<Box>
					<VStack spacing={1} flex={1}>
						<Text mb={3} fontSize={15} mx="25px">
							1. Set private backup address:
						</Text>
						<Input
							sx={{ w: "60%", mb: "5px" }}
							size="sm"
							type="address"
							placeholder="0xAbCd..."
							onChange={(e) => setPendingNewOwner(e.target.value)}
						/>
						<Tooltip
							placement="right-start"
							label="`Delay` refers to the period of time before a recovery proposal
								can be executed.
                (Recommendaed => 
                prod: >30 days | test: <10 sec)"
						>
							<Text mt={3} mb={2} fontSize={15} mx="25px">
								2. Set delay:
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
					</VStack>
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
								if (pendingNewOwner !== "") {
									await _addEcrecoverRecover(
										safeSDK,
										pendingNewOwner,
										delayValue
									);
									const _isMthodEnabled = await _isMethodEnabled(1);
									if (_isMthodEnabled) {
										setIsMethodEnabled(_isMthodEnabled);
									}
								} else {
									console.log("pending owner address not set");
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
					<MethodRemoval method={1} />
				</Box>
			)}
		</Box>
	);
};

export default EnableBackupAddress;
