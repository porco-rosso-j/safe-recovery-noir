
import { Flex, Text, VStack, Box,  Button, IconButton, CheckboxIcon, Spacer} from "@chakra-ui/react";
import {ChevronDownIcon} from '@chakra-ui/icons'
import { useContext, useState, useEffect } from 'react'
import * as ethers from "ethers"
import {shortenAddress} from '../scripts/utils/address'
import UserCredentialContext from 'src/contexts/userCredential';
import {getSafePluginAddress, isPluginEnabled, getSafeOwners} from '../scripts/safe'

const AddressInfo = () => {
  const { 
    safeAddress, 
    pluginAddress, 
    isPluinEnabled, 
    currentOwner, 
    savePluginAdddress, 
    saveIsPluginEnabled, 
    saveCurrentOwner
} = useContext(UserCredentialContext);
//   const [currentOwner, setCurrentOwner] = useState<string>("")
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    ;(async () => {
      if(pluginAddress === "") {
        const PluginAddr = await getSafePluginAddress(safeAddress);
        if (PluginAddr !== ethers.constants.AddressZero) {
           savePluginAdddress(PluginAddr);
      }}
    })()
  })

  useEffect(() => {
    ;(async () => {
      if(pluginAddress !== "" && !isPluinEnabled) {
          const _isPluginEnabled = await isPluginEnabled(safeAddress, pluginAddress);
          console.log("isPluginEnabled: ", _isPluginEnabled)
          if (_isPluginEnabled) {
            saveIsPluginEnabled(_isPluginEnabled)
          }
      }
  })()
  })

  useEffect(() => {
    ;(async () => {
      if(safeAddress !== '') {
          const owner = (await getSafeOwners(safeAddress))[0]
          console.log("owner; ", owner)
          saveCurrentOwner(owner)
      }
  })()
  })


    return ( isOpen ? (
    <Flex           
        p={5}
        mx="auto"
        mt="3"
        mb="5"
        borderRadius="lg"
        boxShadow="lg"
        // backgroundColor={"gray.800"}
        backgroundColor={"#080808"}
        pb="30px" 
        justifyContent="space-between" // Align the button to the right
        alignItems="center" // Vertically center the button
        flexDirection="column"
        >
      <VStack spacing={1}>
    <Text as='b' fontSize={15} justifyContent="center">
      Address Info
    </Text>
    <ChevronDownIcon
      boxSize={5}
      onClick={toggle}
      color="white"
    />
        <Text fontSize={15} color="white">
          - Safe: {safeAddress}
        </Text>
      {currentOwner !== "" && (
        <Text fontSize={15} color="white">
          - Owner: {currentOwner}
        </Text>
      )}
      {pluginAddress !== "" && (
        <Text fontSize={15} color="white">
          - Plugin: {pluginAddress}
        </Text>
      )}
        </VStack>
    </Flex>
    ) : 
    <Flex
    p={3}
    mx="auto"
    mt="3"
    mb="5"
    borderRadius="lg"
    boxShadow="lg"
    backgroundColor={"gray.800"}
    pb="10px"
    justifyContent="space-between"
    alignItems="center"
    flexDirection="column" 
  >
    <Text as='b' fontSize={15} justifyContent="center">
      Address Info
    </Text>
    <ChevronDownIcon
      boxSize={5}
      onClick={toggle}
      color="white"
    />
  </Flex>

)}


export default AddressInfo;
  