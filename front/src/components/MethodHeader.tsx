
import { Box, Flex, Button, VStack, Divider, Tabs, TabList, Tab, TabPanels, TabPanel, Text } from "@chakra-ui/react";
import { useContext, useState, useEffect } from 'react'
import {EnableBackupAddress, ExecuteBackupAddress, ProposeBackupAddress} from './BackupAddress/index'
import FingerPrint from './FingerPrint'
import SecretWord from './SecretWord'
import SocialRecovery from './SocialRecovery'


const MethodHeader = (props) => {
    return (
        <Box pt={3}>
    { props.method === 1 ? (
        <Box>
          <Box  flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
            Hidden Backup Address Recovery 🔑
          </Box>
          {props.index === 0 ? <EnableBackupAddress/>
          : props.index === 1 ? <ProposeBackupAddress/> 
          : props.index === 2 ? <ExecuteBackupAddress/>
          : null}
            <Divider mt="30px" borderColor={"black"} ></Divider>
             <Button mt="15px" h="30px" onClick={async () => {
                  props.updateMethod(0)
            }}>back</Button>
        </Box>   

      ) : props.method === 2 ? (
        <Box>
          <Box flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
            Fingerprint Recovery 🔑
          </Box>
          <FingerPrint/>   
          <Divider mt="30px" borderColor={"black"} ></Divider>
             <Button mt="15px" h="30px" onClick={async () => {
                  props.updateMethod(0)
            }}>back</Button>
        </Box>              
      ) : props.method === 3 ? (
        <Box>
          <Box flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
             Secret Password Recovery 🔑
          </Box>
          <SecretWord/> 
          <Divider mt="30px" borderColor={"black"} ></Divider>
             <Button mt="15px" h="30px" onClick={async () => {
                  props.updateMethod(0)
            }}>back</Button>
        </Box>
      ) : props.method === 4 ? (
        <Box>
          <Box flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
             Social Recovery by Private Guardians 🔑
          </Box>                 
          <SocialRecovery/> 
          <Divider mt="30px" borderColor={"black"} ></Divider>
             <Button mt="15px" h="30px" onClick={async () => {
                  props.updateMethod(0)
            }}>back</Button>
        </Box>   
      ) : null }
       </Box>
    )
}

export default MethodHeader;