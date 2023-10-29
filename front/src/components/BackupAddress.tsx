import {
    Tag, Select, Spinner, Card, CardBody, Box, Tabs, TabList, Tab, TabPanels, TabPanel,
    Input, Flex, Button, StatNumber, Stat, StatLabel, Text, VStack
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from 'react'
import UserCredentialContext from 'src/contexts/userCredential';
import { _isMethodEnabled, _addEcrecoverRecover } from '../scripts/plugin'

const BackupAddress = () => {
    const { safeAddress, safeSDK, signer } = useContext(UserCredentialContext);
    const [pendingNewOwner, setPendingNewOwner] = useState<string>("");
    // const [newOwner, setNewOwner] = useState<string>("");
    const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false)

    useEffect(() => {
        ;(async () => {
            const _isPluginEnabled = await _isMethodEnabled(1);
            console.log("isPluginEnabled: ", _isPluginEnabled)
            if (_isPluginEnabled) {
                setIsMethodEnabled(_isPluginEnabled)
            }
        })()
      })
      
    return (
         <Box pt="10px">
            { !isMethodEnabled ? (<Box>
                <Text mb={3} fontSize={15} mx="75px">
                   Set recoverer address. It won't be publicly revealed 
                   as only its hash will be stored on smart contract.
                   test:0xAB256C9d6aAE9ee6118A1531d43751996541799D
                </Text>
                <Input
                    sx={{ w: "60%" }}
                    size="sm"
                    type="address"
                    placeholder="0xAbCd..."
                     onChange={(e) => setPendingNewOwner(e.target.value)}
                    />
                  <Box sx={{ marginBottom: "6px" }} textAlign="center" alignItems="center">
                    <Button sx={{ mt: "35px" }}  colorScheme="teal" w="55%"  onClick={async () => {
                      if (pendingNewOwner !== "") {
                         await _addEcrecoverRecover(safeSDK, pendingNewOwner);
                         const _isMthodEnabled = await _isMethodEnabled(1);
                         if (_isMthodEnabled) {
                            setIsMethodEnabled(_isMthodEnabled)
                         }
                        // setNewOwner(newOwnerAddress);
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

export default BackupAddress;