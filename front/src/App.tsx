import Header from "src/components/Layouts/Header";
import Footer from "src/components/Layouts/Footer";
import WalletLogin from "src/components/WalletLogin";
import { ChakraProvider, Box, Container, Flex } from "@chakra-ui/react";
import useUserData from "src/hooks/useUserData";
import UserDataContext from "src/contexts/userData";

import MenuTabs from "src/components/MenuTabs";
import chakraDefaultTheme from "src/theme";

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
		savePluginAdddress,
		saveIsPluginEnabled,
		saveCurrentOwner,
		logout,
	} = useUserData();

	const getShowLoginPage = () => {
		if (signer === null || safeAddress === "") {
			return true;
		}

		return false;
	};

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
					savePluginAdddress,
					saveIsPluginEnabled,
					saveCurrentOwner,
					logout,
				}}
			>
				<Flex flexDirection="column" minHeight="100vh">
					<Header />
					<Box
						mb={10}
						display="flex"
						flexDirection="column"
						justifyContent="center"
						alignItems="center"
						flex="1"
					>
						{getShowLoginPage() ? <WalletLogin /> : <MenuTabs />}
					</Box>
					<Footer />
				</Flex>
			</UserDataContext.Provider>
		</ChakraProvider>
	);
}

export default App;
