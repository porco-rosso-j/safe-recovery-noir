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
    if (!safeSDK && !signer && !safeAddress) {
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
        <Box mt="20" display="flex" justifyContent="center" alignItems="center">
         <Box display="flex" flexDirection="column" alignItems="center">
          <Text variant="h2" fontSize={30} textAlign="center" color={useColorModeValue('white', '')}>
            Safe Recovery Plugin powered by Noir 🔑
          </Text>
          <Box maxW='768px' mx="auto">
          {
            getShowLoginPage() ? <WalletLogin /> : <Box p="16px">
              <Onboard />
            </Box>
          }
          </Box>
         </Box>
        </Box>
      </Container>
    </UserCredentialContext.Provider>
  </ChakraProvider>

}

export default App