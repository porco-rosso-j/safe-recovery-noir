// import { Flex, Box, Button } from '@chakra-ui/react'
import { useContext } from 'react'
import UserCredentialContext from 'src/contexts/userCredential';
import logo from "../assets/logo.png";

import { Box, Button, Flex, Text, HStack, useColorModeValue } from '@chakra-ui/react';
export default function Header() {
  const { signer, logout } = useContext(UserCredentialContext);
  return <Box bg={useColorModeValue('#01796F', 'gray.700')}>
  <Flex justify="space-between" p={4}>
    {/* <Text fontSize="1.5rem" fontWeight="bold">
      SafeRecover
    </Text> */}
        <HStack spacing={3}>
          <img src={logo} alt="Logo" style={{ height: '1.75rem', width: 'auto', borderRadius: 5}} />
          <Text fontSize="1.75rem" fontWeight="bold">
            SafeRecover
          </Text>
        </HStack>
    { signer != null ? <Button onClick={logout}>
        Remove Wallet
      </Button>: null}
  </Flex>
</Box>
}