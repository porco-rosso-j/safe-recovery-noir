
import {
    Tag, Select, Spinner, Card, CardBody, Box, Tabs, TabList, Tab, TabPanels, TabPanel,
    Input, Flex, Button, StatNumber, Stat, StatLabel, Text, VStack
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from 'react'
import UserCredentialContext from 'src/contexts/userCredential';
import { _isMethodEnabled, _addWebAuthnRecover } from '../scripts/plugin'

const FingerPrint = () => {
    const { safeAddress, safeSDK, signer } = useContext(UserCredentialContext);
    const [pendingNewOwner, setPendingNewOwner] = useState<string>("");
    const [newOwner, setNewOwner] = useState<string>("");
    const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false)

    useEffect(() => {
        ;(async () => {
            const _isPluginEnabled = await _isMethodEnabled(2);
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
               Create a keypair generated via webauthn. 
               private key will be stored on your device securely while 
               public key will be stored on smart contract.
            </Text>
              <Box sx={{ marginBottom: "6px" }} textAlign="center" alignItems="center">
                <Button sx={{ mt: "35px" }}  colorScheme="teal" w="55%"  onClick={async () => {
                    await _addWebAuthnRecover(safeSDK);
                    setIsMethodEnabled(true)
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

export default FingerPrint;

//isMethodEnabled