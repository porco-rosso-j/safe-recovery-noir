import Header from "src/components/Layouts/Header";
import Footer from "src/components/Layouts/Footer";
import { ChakraProvider, Box, Flex } from "@chakra-ui/react";
import useUserData from "src/hooks/useUserData";
import UserDataContext from "src/contexts/userData";

import MenuTabs from "src/components/MenuTabs";
import chakraDefaultTheme from "src/theme";

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Info from "./components/Info";
import Doc from "./components/Doc";

function App() {
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
		logout,
	} = useUserData();

	return (
		<ChakraProvider theme={chakraDefaultTheme}>
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
					logout,
				}}
			>
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
			</UserDataContext.Provider>
		</ChakraProvider>
	);
}

export default App;
