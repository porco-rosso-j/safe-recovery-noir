import Header from 'src/components/Layouts/Header'
import WalletLogin from 'src/components/WalletLogin'
import {
  ChakraProvider,   
  Box,
  Container,
  Text,
  useColorModeValue
} from "@chakra-ui/react";
import useUserCredential from 'src/hooks/useUserCredential';
import UserCredentialContext from 'src/contexts/userCredential';

import Onboard from 'src/components/Onboard';
import { useEffect } from 'react';
import chakraDefaultTheme from 'src/theme'

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
    logout
  } = useUserCredential();

  const getShowLoginPage = () => {
    //if (safeSDK === null || signer === null || safeAddress === '') {
    if (signer === null || safeAddress === '') {
      return true
    }

    return false
  }

  return <ChakraProvider theme={chakraDefaultTheme}>
    <UserCredentialContext.Provider value={{
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
    logout
    }}>
      <Header />
       <Container>
        <Box mt="10" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
          {
            getShowLoginPage() 
            ? <WalletLogin /> 
            : <Onboard />
          }
        </Box>
      </Container>
    </UserCredentialContext.Provider>
  </ChakraProvider>

}

export default App