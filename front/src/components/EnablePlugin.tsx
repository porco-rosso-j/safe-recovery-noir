import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import UserDataContext from "src/contexts/userData";
import {
	getIsPluginEnabled,
	getIsPluginDeployed,
	enableModuleOnSafe,
	enablePluginOnProtocolManager,
} from "../scripts/utils/safe";

const EnablePlugin = () => {
	const {
		safeAddress,
		safeSDK,
		saveIsPluginEnabled,
		pluginAddress,
		savePluginAdddress,
	} = useContext(UserDataContext);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isPluginDeployed, setIsPluginDeployed] = useState<boolean>(false);
	const [setupStatus, setSetupStatus] = useState<string>("");

	useEffect(() => {
		(async () => {
			if (safeAddress !== "") {
				const [_isPluginDeployed, pluginAddr] = await getIsPluginDeployed(
					safeAddress
				);
				console.log("_isPluginDeployed: ", _isPluginDeployed);
				setIsPluginDeployed(_isPluginDeployed);
				if (_isPluginDeployed) {
					savePluginAdddress(pluginAddr);
				}
			}
		})();
	});

	useEffect(() => {
		(async () => {
			if (isPluginDeployed) {
				const _isPluginEnabled = await getIsPluginEnabled(
					safeAddress,
					pluginAddress
				);
				console.log("_isPluginEnabled: ", _isPluginEnabled);
				if (_isPluginEnabled) {
					saveIsPluginEnabled(_isPluginEnabled);
				}
			}
		})();
	});

	return (
		<Box>
			<Text mt={5} mb={5}>
				Proceed the following steps to setup the recovery plugin.
			</Text>

			<VStack spacing={1} fontSize={13} align="start" ml={65} mb={7}>
				<Text>1: Deploy SafeRecover plugin.</Text>
				<Text>2: Enable Safe Protocol Manager as a module on your Safe.</Text>
				<Text>3: Enable SafeRecover plugin on Safe Protocol Manager.</Text>
				<Text mt={2}>
					*1 & 2 are batched. So you only need to sign two trancations.
				</Text>
			</VStack>

			<Box textAlign="center" alignItems="center">
				<Button
					sx={{ mt: "10px", mb: "10px" }}
					colorScheme="teal"
					isLoading={loading}
					loadingText="Enabling"
					w="50%"
					onClick={async () => {
						setLoading(true);
						setErrorMessage("");
						setSetupStatus(
							"1. SafeRecover plugin is being deployed & Safe is adding the module..."
						);
						const [res1, _pluginAddress] = await enableModuleOnSafe(
							safeSDK,
							safeAddress
						);

						if (!res1.result) {
							setErrorMessage("Something went wrong: " + res1.txHash);
							setSetupStatus("");
							setLoading(false);
							return;
						}

						savePluginAdddress(_pluginAddress);
						setSetupStatus("2. Enabling SafeRecover on SafeProtocolManager...");
						const res2 = await enablePluginOnProtocolManager(
							safeAddress,
							safeSDK,
							_pluginAddress
						);
						if (!res2.result) {
							setErrorMessage("Something went wrong: " + res1.txHash);
							setSetupStatus("");
							setLoading(false);
							return;
						}
						setSetupStatus("");
						setLoading(false);
					}}
				>
					Enable SafeRecover Plugin
				</Button>
				{loading ? (
					<Text mt={5} mb={4} fontSize={13}>
						{setupStatus}
					</Text>
				) : null}
				<Text mt={4} color="red.400" mb={4}>
					{errorMessage}
				</Text>
			</Box>
		</Box>
	);
};

export default EnablePlugin;
