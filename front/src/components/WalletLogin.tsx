import { Box, Input, Button, Text, Textarea, Link } from "@chakra-ui/react";
import React, { useState, useContext } from "react";
import UserCredentialContext from 'src/contexts/userCredential';
import {ethers, providers, Signer} from "ethers"
import Safe, {EthersAdapter} from '@safe-global/protocol-kit'
// import {EthAdapter} from "@safe-global/safe-core-sdk-types"


declare global {
  interface Window {
    ethereum: any
  }
}

const WalletLogin: React.FC = () => {

  const { safeAddress, saveSafeAddress, saveSafeSDK, saveSigner } = useContext(UserCredentialContext);
  const [safeAddressInput, setSafeAddressInput] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const onClickLogin = async () => {
    const provider = new providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    console.log("Account:", await signer.getAddress());
    console.log("saveSigner:", saveSigner);

    saveSigner(signer)

    if (safeAddressInput !== "") {
      saveSafeAddress(safeAddressInput);

      try {
        saveSafeSDK( await Safe.create(safeAddress));
      } catch {
        console.log("Failed to set SafeSDK");
      }
    } else {
      setErrorMessage("plsease set your safe address")
      console.log("empty safe address");
    }

  }

  return (
     <Box
      p={8}
      mx="auto"
      mt={20}
      borderRadius="lg"
      boxShadow="lg"
    >
      <Text fontSize="xl" fontWeight="bold" mb={6}>
        Login to your wallet with Safe Address
      </Text>
      <Box mb={4}>
        <Text mb={2}>Safe Address</Text>
        <Input type="address" onChange={(e) => setSafeAddressInput(e.target.value)} />
      </Box>
      <Text color="red.500" mb={4}>{errorMessage}</Text>
      <Button colorScheme="teal" w="100%" onClick={onClickLogin}>Connect Wallet & Login</Button>
       </Box>
  );
};

export default WalletLogin;