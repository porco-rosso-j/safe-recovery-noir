
// TransferTabs.tsx
import {
    Tag, Select, Spinner, Card, CardBody, Box, Tabs, TabList, Tab, TabPanels, TabPanel,
    Input, Flex, Button, StatNumber, Stat, StatLabel, Text, VStack, Divider
  } from "@chakra-ui/react";

import { useContext, useState, useEffect } from 'react'
import * as ethers from "ethers"
import {shortenAddress} from '../scripts/utils/address'
import UserCredentialContext from 'src/contexts/userCredential';
import {getSafePluginAddress, isPluginEnabled, getSafeOwners, enablePlugin} from '../scripts/safe'
import BackupAddress from './BackupAddress'
import FingerPrint from './FingerPrint'
import SecretWord from './SecretWord'
import SocialRecovery from './SocialRecovery'

const Onboard = () => {
  const { safeAddress, safeSDK, signer } = useContext(UserCredentialContext);
  const [currentOwner, setCurrentOwner] = useState<string>("")
  // const [newOwner, setNewOwner] = useState<string>("");
  const [SafePluginAddress, setSafePluginAddress] = useState<string>("");
  const [isEnabled, setIsEnabled] = useState(false)
  const [method, setMethod] = useState<number>(0)

  useEffect(() => {
    ;(async () => {
      if(SafePluginAddress === "") {
        console.log("safeAddress: ", safeAddress)
        const PluginAddr = await getSafePluginAddress(safeAddress);
        console.log("PluginAddr: ", PluginAddr)
        if (PluginAddr !== ethers.constants.AddressZero) {
          setSafePluginAddress(PluginAddr);
      }}
    })()
  })

  useEffect(() => {
    ;(async () => {
      if(SafePluginAddress !== "" && !isEnabled) {
          const _isPluginEnabled = await isPluginEnabled(safeAddress, SafePluginAddress);
          console.log("isPluginEnabled: ", _isPluginEnabled)
          if (_isPluginEnabled) {
            setIsEnabled(_isPluginEnabled)
          }
      }
  })()
  })

  useEffect(() => {
    ;(async () => {
      if(safeAddress !== '') {
          const owner = (await getSafeOwners(safeAddress))[0]
          console.log("owner; ", owner)
          setCurrentOwner(owner)
      }
  })()
  })


    return (
    <Box 
    p={5}
    backgroundColor={"gray.600"}
    borderRadius="lg"
    boxShadow="lg"
    mt="5"
    textAlign="center"
    >
        <Flex           
             p={5}
             mx="auto"
             mt="3"
             mb="5"
             borderRadius="lg"
             boxShadow="lg"
             backgroundColor={"gray.800"}
             pb="30px" 
             display="flex" 
             direction="column"
             >
      <VStack spacing={1}>
      <Text as='b' fontSize={18} color="white">
        Address Info
      </Text>
        <Text fontSize={15} color="white">
          - Safe: {shortenAddress(safeAddress)}
        </Text>
      {currentOwner !== "" && (
        <Text fontSize={15} color="white">
          - Owner: {shortenAddress(currentOwner)}
        </Text>
      )}
      {SafePluginAddress !== "" && (
        <Text fontSize={15} color="white">
          - SafeRecover Plugin: {shortenAddress(SafePluginAddress)}
        </Text>
      )}
        </VStack>
            </Flex>
            {!isEnabled ? (
              <Box>
                <Box textAlign="center" alignItems="center" >
              
                  <Button sx={{ mt: "10px", mb: "10px" }} colorScheme="teal" w="50%"  onClick={async () => {
                    await enablePlugin(safeAddress, safeSDK)
                    const _isPluginEnabled = await isPluginEnabled(safeAddress, SafePluginAddress);
                    console.log("isPluginEnabled: ", _isPluginEnabled)
                    if (_isPluginEnabled) {
                      setIsEnabled(_isPluginEnabled)
                    }
                  }}>
                    Enable SafeRecover Plugin
                  </Button>
                </Box>
              </Box>
            ) : method === 0 ? (
              <Box >Pick your preferable recovery method
               <Box mt="10px" textAlign="center" alignItems="center">
                <Flex justifyContent="space-between" >
                 <VStack spacing={1}  flex={1}>
                  <Button sx={{ mt: "10px", mb: "10px" }} colorScheme="teal" w="85%"  onClick={async () => {
                    setMethod(1)
                     }}>
                    1: Backup Address
                  </Button>
                  <Button sx={{ mt: "10px", mb: "10px" }} colorScheme="teal" w="85%"  onClick={async () => {
                    setMethod(3)
                     }}>
                    3: Secret Word
                  </Button>
                  </VStack>
                  <VStack spacing={1} flex={1}>
                  <Button sx={{ mt: "10px", mb: "10px" }} colorScheme="teal" w="85%"  onClick={async () => {
                    setMethod(2)
                     }}>
                     2: FingerPrint
                  </Button>
                  <Button sx={{ mt: "10px", mb: "10px" }} colorScheme="teal" w="85%"  onClick={async () => {
                    setMethod(4)
                  }}>
                    4: Social Recovery 
                    </Button>
                </VStack>
                </Flex>
               </Box>
              </Box>
            ) :  (
              <Box sx={{ pt: "10px" }} > 
                { method === 1 ? (
                  <Box>
                    <Box  flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
                     Hidden Backup Address Recovery 🔑
                    </Box>
                    <BackupAddress/> 
                  </Box>
                ) : method === 2 ? (
                  <Box>
                    <Box flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
                      Fingerprint Recovery 🔑
                    </Box>
                    <FingerPrint/>   
                  </Box>              
                ) : method === 3 ? (
                  <Box>
                    <Box flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
                       Secret Password Recovery 🔑
                    </Box>
                    <SecretWord/> 
                  </Box>
                ) : method === 4 ? (
                  <Box>
                    <Box flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
                       Social Recovery by Private Guardians 🔑
                    </Box>                 
                    <SocialRecovery/> 
                  </Box>   
                ) : null }
                <Divider mt="50px" borderColor={"black"} ></Divider>
                <Button mt="15px" h="30px" onClick={async () => {
                    setMethod(0)
                 }}>back</Button>
              </Box>
            )}
      </Box>
)}


export default Onboard;
  