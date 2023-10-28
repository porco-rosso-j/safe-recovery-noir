
import {
    Tag, Select, Spinner, Card, CardBody, Box, Tabs, TabList, Tab, TabPanels, TabPanel,
    Input, Flex, Button, StatNumber, Stat, StatLabel, Text, VStack
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from 'react'


const FingerPrint = () => {
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
        <Box>FingerPrint
            <Box 
            sx={{ pt: "10px" }} 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            >
                  <Box flex={15} textAlign="center" color="white" fontSize={20}>
                    [ 🚑 Change an owner to recover your Safe 🚑 ]
                  </Box>
                  <Box>
                    <Input
                      sx={{
                        marginRight: "20px",
                        width: "44ch",
                        color: "white",
                        borderBottom: "2px solid #aaddb5",
                        textAlign: "center"
                      }}
                      id="filled-basic"
                      variant="filled"
                      placeholder="0x1234..."
                      size="sm"
                      onChange={(e) => setPendingNewOwner(e.target.value)}
                    />
                  </Box>
                  <Box sx={{ marginBottom: "6px" }} textAlign="center" alignItems="center">
                    <Button sx={{ mt: "35px" }} variant="contained" onClick={async () => {
                      if (pendingNewOwner !== "") {
                       // const newOwnerAddress = await changeOwner(safeAddress, safeSDK, SafePluginAddress, currentOwner, pendingNewOwner);
                       // setNewOwner(newOwnerAddress);
                        console.log("yay!");
                      } else {
                        console.log("pending owner address not set");
                      }
                    }}>
                      Change Owner
                    </Button>
                  </Box>
                </Box>
        </Box>
    )
}

export default FingerPrint;