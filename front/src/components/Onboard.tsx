
// TransferTabs.tsx
import { Box, Flex, Button, VStack, Divider, Tabs, TabList, Tab, TabPanels, TabPanel, Text, Select } from "@chakra-ui/react";
import { useContext, useState, useEffect } from 'react'
import UserDataContext from 'src/contexts/userData';
import {isPluginEnabled, enablePlugin} from '../scripts/utils/safe'
import AddressInfo from './AddressInfo'
import { shortenAddress } from "src/scripts/utils/address";
import MethodHeader from './MethodHeader'

const Onboard = () => {
  const { safeAddress, safeSDK, pluginAddress, isPluinEnabled, saveIsPluginEnabled} = useContext(UserDataContext);
  const [method, setMethod] = useState<number>(1)
  const [tabIndex, setTabIndex] = useState(0)

  console.log("tabIndex: ", tabIndex)

  const updateMethod = (index:number) => {
    setMethod(index)
  }

  const handleTabsChange = (index) => {
    setTabIndex(index)
  }

    return (
    <Box 
    p={5}
    backgroundColor={"#2e2e2e"}
    borderRadius="lg"
    boxShadow="lg"
    mt="5"
    textAlign="center"
    maxW='1024px' 
    width="550px" 
    mx="auto"
    >
      <AddressInfo/>
      <Tabs index={tabIndex} onChange={handleTabsChange} variant="line" borderColor="gray" >
        <TabList>
          <Tab w="33%" color="white">Enable</Tab>
          <Tab w="33%" color="white">Propose/Approve</Tab>
          <Tab w="33%" color="white">{safeSDK !== null ? "Execute/Reject" : "Execute"}</Tab>
        </TabList>
        <TabPanels>
        <TabPanel >
         
      { safeSDK !== null && !isPluinEnabled ? (
        <Box>
          <Box textAlign="center" alignItems="center" >
        
            <Button sx={{ mt: "10px", mb: "10px" }}  colorScheme="teal" w="50%"  onClick={async () => {
              await enablePlugin(safeAddress, safeSDK)
              const _isPluginEnabled = await isPluginEnabled(safeAddress);
              console.log("isPluginEnabled: ", _isPluginEnabled)
              if (_isPluginEnabled) {
                saveIsPluginEnabled(_isPluginEnabled)
              }
            }}>
              Enable SafeRecover Plugin
            </Button>
          </Box>
        </Box>
      ) : safeSDK !== null ? (
          <MethodHeader updateMethod={updateMethod} method={method} index={tabIndex}/>
        ) : (
          <Box mt="10px">
          <Text>
            You are not an owner of Safe {shortenAddress(safeAddress)}
          </Text>
          </Box>
        )}
          </TabPanel>
          <TabPanel >
              <MethodHeader updateMethod={updateMethod} method={method} index={tabIndex}/>  
          </TabPanel>
          <TabPanel >
              <MethodHeader updateMethod={updateMethod} method={method} index={tabIndex}/>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
)}


export default Onboard;
  