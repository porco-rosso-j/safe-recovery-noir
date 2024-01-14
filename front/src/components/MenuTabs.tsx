import {
	Box,
	Tabs,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
	Text,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import UserDataContext from "src/contexts/userData";
import { getIsPluginEnabled, getIsPluginDeployed } from "../scripts/utils/safe";
import AddressInfo from "./AddressInfo";
import { shortenAddress } from "src/scripts/utils/address";
import MethodHeader from "./MethodHeader";
import EnablePlugin from "./EnablePlugin";

const MenuTabs = () => {
	const {
		safeAddress,
		safeSDK,
		isPluginEnabled,
		saveIsPluginEnabled,
		pluginAddress,
		savePluginAdddress,
	} = useContext(UserDataContext);
	const [method, setMethod] = useState<number>(1);
	const [tabIndex, setTabIndex] = useState(0);
	const [isPluginDeployed, setIsPluginDeployed] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			if (safeAddress !== "" && !isPluginDeployed) {
				const [_isPluginDeployed, pluginAddr] = await getIsPluginDeployed(
					safeAddress
				);
				setIsPluginDeployed(_isPluginDeployed);
				if (_isPluginDeployed) {
					savePluginAdddress(pluginAddr);
				}
			}
		})();
	});

	useEffect(() => {
		(async () => {
			if (isPluginDeployed && !isPluginEnabled) {
				const _isPluginEnabled = await getIsPluginEnabled(
					safeAddress,
					pluginAddress
				);
				if (_isPluginEnabled) {
					saveIsPluginEnabled(_isPluginEnabled);
				}
			}
		})();
	});

	const updateMethod = (index: number) => {
		setMethod(index);
	};

	const handleTabsChange = (index: number) => {
		setTabIndex(index);
		setMethod(method);
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
			width="600px"
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
						<Text fontSize={18} mb={3}>
							Enable Recovery
						</Text>
					</Tab>
					<Tab fontSize={18} w="33%" color="white">
						<Text mb={3}>Propose Recovery</Text>
					</Tab>
					<Tab fontSize={18} w="33%" color="white">
						<Text mb={3}>Proposals</Text>
					</Tab>
				</TabList>
				<TabPanels>
					<TabPanel>
						{safeSDK && isPluginEnabled ? (
							<MethodHeader
								updateMethod={updateMethod}
								method={method}
								index={tabIndex}
							/>
						) : safeSDK && !isPluginEnabled ? (
							<EnablePlugin />
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
							setTabIndex={handleTabsChange}
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

export default MenuTabs;
