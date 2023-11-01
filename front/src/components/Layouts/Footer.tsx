// import { Flex, Box, Button } from '@chakra-ui/react'
import { useContext } from 'react'
import UserCredentialContext from 'src/contexts/userCredential';
import logo from "../../assets/logo.png";
import { Box, Button, Flex, Text, HStack, Link, useColorModeValue } from '@chakra-ui/react';

export default function Footer() {
  return <Box
   textAlign="center" 
   py={6} 
   as="u"
//    bg={useColorModeValue('#01796F', 'gray.700')}
   position="fixed"
   bottom="0"
   width="100%"
   >
      <Link href="https://github.com/porco-rosso-j/safe-recovery-noir" isExternal>
        <Text fontSize="md">github</Text>
      </Link>
  </Box>
}