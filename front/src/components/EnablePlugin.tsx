import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { useContext, useState } from "react";
import UserDataContext from "src/contexts/userData";
import {
	addModule,
	enableModuleOnSafe,
	enablePluginOnProtocolManager,
} from "../scripts/utils/safe";

const EnablePlugin = () => {
	const { safeAddress, safeSDK, savePluginAddress, savePluginEnabled } =
		useContext(UserDataContext);

	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [setupStatus, setSetupStatus] = useState<string>("");

	return (
		<Box>
			<Text fontSize={18} mt={5} mb={5}>
				Proceed the following steps to setup the recovery plugin.
			</Text>

			<VStack spacing={1} fontSize={13} align="start" ml={55} my={10}>
				<Text>
					1: Deploy SafeRecover and enable SafeProtocolManager module on Safe..
				</Text>
				<Text>2: SafeProtocolRegistry registers SafeRecover plugin.</Text>
				<Text>3: Enable SafeRecover plugin on SafeProtocolManager.</Text>
				<VStack mt={2} fontSize={12} align="start">
					<Text>*You only send two transctions (1 & 3)</Text>
					<Text>*2 is executed by registry owner (our EOA).</Text>
				</VStack>
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
							"1/3: SafeRecover plugin is being deployed & Safe is enabling the module..."
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

						setSetupStatus(
							"2/3: Safe Protocol Registry is registering the module..."
						);
						const res2 = await addModule(_pluginAddress);
						if (!res2.result) {
							setErrorMessage("Something went wrong: " + res2.txHash);
							setSetupStatus("");
							setLoading(false);
							return;
						}

						setSetupStatus(
							"3/3: Enabling SafeRecover on SafeProtocolManager..."
						);
						const res3 = await enablePluginOnProtocolManager(
							safeAddress,
							safeSDK,
							_pluginAddress
						);
						if (!res3.result) {
							setErrorMessage("Something went wrong: " + res3.txHash);
							setSetupStatus("");
							setLoading(false);
							return;
						}

						savePluginAddress(_pluginAddress, true);
						setSetupStatus("");
						setLoading(false);
						savePluginEnabled(true);
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
