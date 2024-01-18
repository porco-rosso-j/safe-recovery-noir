import Header from "src/components/Layouts/Header";
import Footer from "src/components/Layouts/Footer";
import { ChakraProvider, Flex } from "@chakra-ui/react";
import {
	useUserData,
	useContractData,
	usePluginData,
} from "src/hooks/contexts";
import {
	ContractDataContext,
	UserDataContext,
	PluginDataContext,
} from "src/contexts/contextData";

import MenuTabs from "src/components/MenuTabs";
import chakraDefaultTheme from "src/theme";

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Info from "./components/Info";
import Doc from "./components/Doc";

function App() {
	const { managerAddr, registryAddr, pluginFacAddr, logoutContract } =
		useContractData();

	const {
		safeAddress,
		safeSDK,
		signer,
		pluginAddress,
		isPluginEnabled,
		currentOwner,
		saveSafeAddress,
		saveSafeSDK,
		saveSigner,
		savePluginAddress,
		saveCurrentOwner,
		savePluginEnabled,
		logout,
	} = useUserData();

	// const { recoveryPluginContract, recoveryPluginSigner } = usePluginData();

	return (
		<ChakraProvider theme={chakraDefaultTheme}>
			<ContractDataContext.Provider
				value={{
					managerAddr,
					registryAddr,
					pluginFacAddr,
					logoutContract,
				}}
			>
				<UserDataContext.Provider
					value={{
						safeAddress,
						safeSDK,
						signer,
						pluginAddress,
						isPluginEnabled,
						currentOwner,
						saveSafeAddress,
						saveSafeSDK,
						saveSigner,
						savePluginAddress,
						saveCurrentOwner,
						savePluginEnabled,
						logout,
					}}
				>
					{/* <PluginDataContext.Provider
						value={{
							recoveryPluginContract,
							recoveryPluginSigner,
						}}
					> */}
					<Flex flexDirection="column" minHeight="100vh">
						<Router>
							<Header />
							<Routes>
								<Route path="/" element={<MenuTabs />} />
								<Route path="/info" element={<Info />} />
								<Route path="/doc" element={<Doc />} />
							</Routes>
							<Footer />
						</Router>
					</Flex>
					{/* </PluginDataContext.Provider> */}
				</UserDataContext.Provider>
			</ContractDataContext.Provider>
		</ChakraProvider>
	);
}

export default App;
