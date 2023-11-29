import {
	Box,
	Button,
	Tabs,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
	Text,
	Flex,
	Link,
	Spinner,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import UserDataContext from "src/contexts/userData";
import {
	isPluginEnabled,
	getIsPluginDeployed,
	enableModuleOnSafe,
	enablePluginOnProtocolManager,
} from "../scripts/utils/safe";
import AddressInfo from "./AddressInfo";
import { shortenAddress } from "src/scripts/utils/address";
import MethodHeader from "./MethodHeader";

const Onboard = () => {
	const {
		safeAddress,
		safeSDK,
		isPluinEnabled,
		saveIsPluginEnabled,
		pluginAddress,
		savePluginAdddress,
	} = useContext(UserDataContext);
	const [method, setMethod] = useState<number>(1);
	const [tabIndex, setTabIndex] = useState(0);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [isPluginDeployed, setIsPluginDeployed] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			const [_isPluginDeployed, pluginAddr] = await getIsPluginDeployed(
				safeAddress
			);
			console.log("_isPluginDeployed: ", _isPluginDeployed);
			setIsPluginDeployed(_isPluginDeployed);
			if (_isPluginDeployed) {
				savePluginAdddress(pluginAddr);
			}
		})();
	});

	useEffect(() => {
		(async () => {
			if (isPluginDeployed) {
				const _isPluginEnabled = await isPluginEnabled(
					safeAddress,
					pluginAddress
				);
				console.log("here???");
				console.log("_isPluginEnabled: ", _isPluginEnabled);
				if (_isPluginEnabled) {
					saveIsPluginEnabled(_isPluginEnabled);
				}
			}
		})();
	});

	const updateMethod = (index: number) => {
		setMethod(index);
	};

	const handleTabsChange = (index) => {
		setTabIndex(index);
	};

	return (
		<Box
			p={5}
			backgroundColor={"#2e2e2e"}
			borderRadius="lg"
			boxShadow="lg"
			mt="5"
			textAlign="center"
			maxW="1024px"
			width="550px"
			mx="auto"
		>
			<AddressInfo />
			<Tabs
				index={tabIndex}
				onChange={handleTabsChange}
				variant="line"
				borderColor="gray"
			>
				<TabList>
					<Tab w="33%" color="white">
						Enable Recovery
					</Tab>
					<Tab w="33%" color="white">
						Propose Recovery
					</Tab>
					<Tab w="33%" color="white">
						Proposals
					</Tab>
				</TabList>
				<TabPanels>
					<TabPanel>
						{!isPluinEnabled && safeSDK !== null ? (
							<Box>
								<Text mb={4}>
									You will sign two transactions consecuritvely.<br></br>
									<br></br>
									1: Enable Safe Protocol Manager as a module on your Safe.{" "}
									<br></br>
									2: Enable SafeRecover module on Safe Protocol Manager.
								</Text>
								<Box textAlign="center" alignItems="center">
									<Button
										sx={{ mt: "10px", mb: "10px" }}
										colorScheme="teal"
										w="50%"
										onClick={async () => {
											setLoading(true);
											console.log("isPluinEnabled: ", isPluinEnabled);
											// if (isPluinEnabled) {
											const [res1, _pluginAddress] = await enableModuleOnSafe(
												safeSDK,
												safeAddress
											);
											if (!res1.result) {
												setErrorMessage("Tx Failed: " + res1.txHash);
											}
											// }

											savePluginAdddress(_pluginAddress);

											console.log("eh");
											console.log("safeAddress: ", safeAddress);
											console.log("safeSDK: ", safeSDK);

											const res2 = await enablePluginOnProtocolManager(
												safeAddress,
												safeSDK,
												_pluginAddress
											);
											if (!res2.result) {
												setErrorMessage("Tx Failed: " + res2.txHash);
											}

											setLoading(false);
										}}
									>
										Enable SafeRecover Plugin
									</Button>
									{loading && (
										<Flex justifyContent="center" alignItems="center">
											<Spinner mt={10} color="gray.300" />
										</Flex>
									)}
									<Text mt={4} color="red.500" mb={4}>
										{errorMessage}
									</Text>
								</Box>
							</Box>
						) : isPluinEnabled && safeSDK !== null ? (
							<MethodHeader
								updateMethod={updateMethod}
								method={method}
								index={tabIndex}
							/>
						) : (
							<Box mt="10px">
								<Text>
									You are not an owner of Safe {shortenAddress(safeAddress)}
								</Text>
							</Box>
						)}
					</TabPanel>
					<TabPanel>
						<MethodHeader
							updateMethod={updateMethod}
							method={method}
							index={tabIndex}
						/>
					</TabPanel>
					<TabPanel>
						<MethodHeader
							updateMethod={updateMethod}
							method={method}
							index={tabIndex}
						/>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Box>
	);
};

export default Onboard;
