import { Box, Input, Button, Text, useColorModeValue } from "@chakra-ui/react";
import React, { useState, useContext } from "react";
import UserCredentialContext from 'src/contexts/userCredential';
// import * as ethers from "ethers"
import {ethers, providers, Signer} from "ethers"
import Safe, {EthersAdapter} from '@safe-global/protocol-kit'
// import {EthAdapter} from '@safe-global/safe-core-sdk-types'

declare global {
  interface Window {
    ethereum: any
  }
}

const WalletLogin: React.FC = () => {

  const { saveSafeAddress, saveSafeSDK, saveSigner } = useContext(UserCredentialContext);
  const [safeAddressInput, setSafeAddressInput] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const onClickLogin = async () => {
    const provider = new providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer:Signer = provider.getSigner(0);
    console.log("addr: ", await signer.getAddress())

    if (safeAddressInput !== '') {
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer
      })

      let safeSDK;
      try {
        console.log("safeAddressInput: ", safeAddressInput)
        safeSDK = await Safe.create({ethAdapter:ethAdapter, safeAddress:safeAddressInput, isL1SafeMasterCopy:true }) // L1SafeMasterCopy:tru        
        console.log("safeSDK: ", safeSDK)
      } catch {
      console.log("Failed to set SafeSDK", safeSDK);
      }

      saveSafeAddress(safeAddressInput);
      saveSigner(signer)

      if ((await safeSDK.getOwners())[0] === await signer.getAddress()) {
        saveSafeSDK(safeSDK)
      } else {
        console.log("not owner");
      }
      
    } else {
      setErrorMessage("plsease set your safe address")
      console.log("empty safe address");
      return;
    }

  }

  return (
    <Box>
      <Text mt={7} variant="h2" fontSize={30} textAlign="center" color={useColorModeValue('white', '')}>
           Safe Recovery Plugin powered by Noir ZKP
     </Text>
     <Box
      p={8}
      mx="auto"
      mt={20}
      borderRadius="lg"
      boxShadow="lg"
      backgroundColor={"gray.800"}
    >
      <Text fontSize="xl" fontWeight="bold" mb={6}>
        Login to your wallet with Safe Address
      </Text>
      <Box mb={4}>
        <Text mb={2}>safe address:</Text>
        0x786458FBFa964E34e417F305EDa3dbC02cA7a13D
        <Input placeholder="0xAbCd..." type="address" onChange={(e) => setSafeAddressInput(e.target.value)} />
      </Box>
      <Text color="red.500" mb={4}>{errorMessage}</Text>
      <Button colorScheme="teal" w="100%" onClick={onClickLogin}>Login</Button>
      </Box>
  </Box>
  );
};

export default WalletLogin;