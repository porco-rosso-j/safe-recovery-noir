import {
    Tag, Select, Spinner, Card, CardBody, Box, Tabs, TabList, Tab, TabPanels, TabPanel,
    Input, Flex, Button, StatNumber, Stat, StatLabel, Text, VStack
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from 'react'
import UserCredentialContext from 'src/contexts/userCredential';
import { _isMethodEnabled, _addSocialRecover } from '../scripts/plugin'

const SocialRecovery = () => {
    const { safeAddress, safeSDK, signer } = useContext(UserCredentialContext);
    const [threshold, setThreshold] = useState<number>(0);
    const [guardians, setGuardians] = useState<string[]>(['']);
    // const [newOwner, setNewOwner] = useState<string>("");
    const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false)

    useEffect(() => {
        ;(async () => {
            const isMethodEnabled = await _isMethodEnabled(4);
            console.log("isMethodEnabled: ", isMethodEnabled)
            if (isMethodEnabled) {
                setIsMethodEnabled(isMethodEnabled)
            }
        })()
      })

    const addGuardian = (guardian:string, index:number) => {
        let guardiansTemp = guardians;
        guardiansTemp[index] = guardian
        setGuardians(guardiansTemp)
    }

    const removeGuardian = (index:number) => {
        let guardiansTemp = guardians;
        guardiansTemp[index] = ''
        setGuardians(guardiansTemp)
    }
      
    return (
         <Box pt="10px">
            { !isMethodEnabled ? (<Box>
                <Text mb={3} fontSize={15} mx="75px">
                   Set guardian address. They won't be publicly revealed 
                   as only the merkle root of the addresses as leaves will be stored on smart contract.
                </Text>
               <Box mt="10px" textAlign="center" alignItems="center">
                <Flex justifyContent="space-between" >
                 <VStack spacing={1}  flex={1}>
                 <Box display='flex' alignItems='center' mt={4} >
                <label >1:</label>
                <Input
                    ml={3}
                    sx={{ w: "350px" }}
                    size="sm"
                    type="address"
                    placeholder="0xAbCd..."
                    onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue === '') {
                          removeGuardian(0); // Remove if input is empty
                        } else {
                            addGuardian(newValue, 0); // Update the input
                        }
                    }}
                    />
                </Box>
                <Box display='flex' alignItems='center' mt={3} >
                <label >2:</label>
                <Input
                    ml={3}
                    sx={{ w: "350px" }}
                    size="sm"
                    type="address"
                    placeholder="0xEfgH..."
                    onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue === '') {
                          removeGuardian(1); // Remove if input is empty
                        } else {
                            addGuardian(newValue, 1); // Update the input
                        }
                    }}
                    />
                </Box>
                <Box display='flex' alignItems='center' mt={3} >
                <label >3:</label>
                <Input
                    ml={3}
                    sx={{ w: "350px" }}
                    size="sm"
                    type="address"
                    placeholder="0xIjKo..."
                    onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue === '') {
                          removeGuardian(2); // Remove if input is empty
                        } else {
                            addGuardian(newValue, 2); // Update the input
                        }
                    }}
                    />
                </Box>
                <Box display='flex' alignItems='center' mt={3} >
                <label >4:</label>
                <Input
                    ml={3}
                    sx={{ w: "350px" }}
                    size="sm"
                    type="address"
                    placeholder="0xPqrS..."
                    onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue === '') {
                          removeGuardian(3); // Remove if input is empty
                        } else {
                          addGuardian(newValue, 3); // Update the input
                        }
                    }}
                    />
                </Box>
                <Box display='flex' alignItems='center' mt={3} >
                <label >threshold:</label>
                <Input
                    ml={3}
                    sx={{ w: "50px" }}
                    size="sm"
                    placeholder="2"
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    />
                </Box>
                </VStack>
                </Flex>
               </Box>
                  <Box sx={{ marginBottom: "6px" }} textAlign="center" alignItems="center">
                    <Button sx={{ mt: "35px" }}  colorScheme="teal" w="55%"  onClick={async () => {
                      if (guardians[0] !== '' && threshold !== 0) {
                         await _addSocialRecover(safeSDK, threshold, guardians);
                         const _isMthodEnabled = await _isMethodEnabled(4);
                         if (_isMthodEnabled) {
                            setIsMethodEnabled(_isMthodEnabled)
                         }
                      } else {
                        console.log("pending owner address not set");
                      }
                    }}>
                      Enable this method
                </Button>
               </Box> 
            </Box>) : (
                <Box>
                  Enabled
                </Box>
            )}
        </Box>
    )
}

export default SocialRecovery;