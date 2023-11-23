
import {
    Tag, Select, Spinner, Card, CardBody, Box, Tabs, TabList, Tab, TabPanels, TabPanel,
    Input, Flex, Button, StatNumber, Stat, StatLabel, Text, VStack
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from 'react'
import UserDataContext from 'src/contexts/userData';
import { _isMethodEnabled, _addSecretRecover } from '../../scripts/plugins/index'


const SecretWord = () => {
    const { safeAddress, safeSDK, signer } = useContext(UserDataContext);
    const [secretWord, setSecretWord] = useState<string>("");
    const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false)

    useEffect(() => {
        ;(async () => {
            const _isPluginEnabled = await _isMethodEnabled(3);
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
                   Set secret word that is used for recoverying Safe.
                </Text>
                <Input
                    sx={{ w: "50%" }}
                    size="sm"
                    type="word"
                    placeholder="secret"
                     onChange={(e) => setSecretWord(e.target.value)}
                    />
                  <Box sx={{ marginBottom: "6px" }} textAlign="center" alignItems="center">
                    <Button sx={{ mt: "35px" }} colorScheme="teal" w="55%"  onClick={async () => {
                      if (secretWord !== "") {
                        await _addSecretRecover(safeSDK, secretWord);
                        const _isMthodEnabled = await _isMethodEnabled(3);
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

export default SecretWord;