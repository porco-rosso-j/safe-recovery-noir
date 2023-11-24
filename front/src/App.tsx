import Header from "src/components/Layouts/Header";
import Footer from "src/components/Layouts/Footer";
import WalletLogin from "src/components/WalletLogin";
import { ChakraProvider, Box, Container } from "@chakra-ui/react";
import useUserData from "src/hooks/useUserData";
import UserDataContext from "src/contexts/userData";

import Onboard from "src/components/Onboard";
import chakraDefaultTheme from "src/theme";

function App() {
	const {
		safeAddress,
		safeSDK,
		signer,
		pluginAddress,
		isPluinEnabled,
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
		//if (safeSDK === null || signer === null || safeAddress === '') {
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
					isPluinEnabled,
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
				<Header />
				<Container height={1000}>
					<Box
						mt="10"
						display="flex"
						flexDirection="column"
						justifyContent="center"
						alignItems="center"
					>
						{getShowLoginPage() ? <WalletLogin /> : <Onboard />}
					</Box>
				</Container>
				<Footer />
			</UserDataContext.Provider>
		</ChakraProvider>
	);
}

export default App;
