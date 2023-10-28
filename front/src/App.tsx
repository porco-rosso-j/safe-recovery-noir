import Header from 'src/components/Header'
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
    safeSDK,
    signer,
    safeAddress,
    saveSafeAddress,
    saveSafeSDK,
    saveSigner,
    logout
  } = useUserCredential();

  const getShowLoginPage = () => {
    if (safeSDK === null || signer === null || safeAddress === '') {
      return true
    }

    return false
  }

  return <ChakraProvider theme={chakraDefaultTheme}>
    <UserCredentialContext.Provider value={{
      safeSDK,
      signer,
      safeAddress,
      saveSafeAddress,
      saveSafeSDK,
      saveSigner,
      logout
    }}>
      <Header />
       <Container>
        <Box mt="10" display="flex" justifyContent="center" alignItems="center">
         <Box display="flex" flexDirection="column" alignItems="center">
          <Text mb="5" variant="h2" fontSize={30} textAlign="center" color={useColorModeValue('white', '')}>
            Safe Recovery Plugin powered by Noir ZKP
          </Text>
          <Box maxW='1024px' width="550px" mx="auto" >
          {
            getShowLoginPage() 
            ? <WalletLogin /> 
            : <Onboard />
          }
          </Box>
         </Box>
        </Box>
      </Container>
    </UserCredentialContext.Provider>
  </ChakraProvider>

}

export default App