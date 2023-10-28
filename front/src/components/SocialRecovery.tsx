
import {
    Tag, Select, Spinner, Card, CardBody, Box, Tabs, TabList, Tab, TabPanels, TabPanel,
    Input, Flex, Button, StatNumber, Stat, StatLabel, Text, VStack
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from 'react'
import UserCredentialContext from 'src/contexts/userCredential';

const SocialRecovery = () => {
    const { safeAddress, safeSDK, signer } = useContext(UserCredentialContext);
    const [pendingNewOwner, setPendingNewOwner] = useState<string>("");

    useEffect(() => {
        ;(async () => {
            // const _isPluginEnabled = await isPluginEnabled(SafePluginAddress);
            // console.log("isPluginEnabled: ", _isPluginEnabled)
            // if (_isPluginEnabled) {
            //   setIsEnabled(_isPluginEnabled)

        })()
      })
      
    return (
        <Box>SocialRecovery
        </Box>
    )
}

export default SocialRecovery;