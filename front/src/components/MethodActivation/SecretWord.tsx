import {
	Box,
	Input,
	Text,
	Button,
	Tooltip,
	FormControl,
	Select,
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import {
	_isMethodEnabled,
	_addSecretRecover,
} from "../../scripts/plugins/index";
import MethodRemoval from "./Removal";

const SecretWord = () => {
	const { safeSDK } = useContext(UserDataContext);
	const [secretWord, setSecretWord] = useState<string>("");
	const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false);
	const [unit, setUnit] = useState<number>(1);
	const [delayValue, setDelayValue] = useState(0);

	useEffect(() => {
		(async () => {
			const _isPluginEnabled = await _isMethodEnabled(3);
			console.log("isPluginEnabled: ", _isPluginEnabled);
			if (_isPluginEnabled) {
				setIsMethodEnabled(_isPluginEnabled);
			}
		})();
	});

	return (
		<Box pt="10px">
			{!isMethodEnabled ? (
				<Box>
					<Text mb={3} fontSize={15} mx="25px">
						1. Set secret word:
					</Text>
					<Input
						sx={{ w: "50%" }}
						size="sm"
						type="word"
						placeholder="secret"
						onChange={(e) => setSecretWord(e.target.value)}
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
								if (secretWord !== "") {
									await _addSecretRecover(safeSDK, delayValue, secretWord);
									const _isMthodEnabled = await _isMethodEnabled(3);
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
					<MethodRemoval method={3} />
				</Box>
			)}
		</Box>
	);
};

export default SecretWord;
