
import { Box, Flex, Button, VStack, Divider, Tabs, TabList, Tab, TabPanels, TabPanel, Text, Select } from "@chakra-ui/react";
import { useContext, useState, useEffect } from 'react'
import ProposeRecovery from './ProposeRecovery'
import ExecuteRecovery from './ExecuteRecovery'
import {BackupAddress, FingerPrint, SecretWord, SocialRecovery} from './MethodActivation/index'


const MethodHeader = (props) => {
    return (
        <Box pt={3}>
          { props.index === 0 || props.index === 1 ? (
              <Select mt={2} mb={4} onChange={(e) => props.updateMethod(Number(e.target.value))}>
              <option value='1' selected> 1. Backup Address Recovery</option>
              <option value='2'> 2. FingerPrint Recovery</option>
              <option value='3'> 3. Secret Word Recovery</option>
              <option value='4'> 4. Social Recovery</option>
          </Select>
          ) : null}
          { props.index === 0 ? (
          <Box>
          { props.method === 1 ? (
            <Box>
            {/* <Box  flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
            Hidden Backup Address Recovery 🔑
            </Box> */}
             <BackupAddress/>
            </Box>
          ) : props.method === 2 ? (
            <Box>
            {/* <Box  flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
            Fingerprint Recovery 🔑
            </Box>       */}
            <FingerPrint/>
            </Box>
          ) : props.method === 3 ? (
            <Box>
            {/* <Box  flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
            Secret Password Recovery 🔑
            </Box>   */}
             <SecretWord/>
             </Box>    
          ) : props.method === 4 ? (
            <Box>
            {/* <Box  flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
             Social Recovery by Private Guardians 🔑
            </Box>    */}
             <SocialRecovery/>
             </Box>   
          ) : null }
          </Box>
          ) : props.index === 1 ? (
            <ProposeRecovery  method={props.method}/> 
          ) : props.index === 2 ? (
            <ExecuteRecovery method={props.method}/>
          ) : null }
          <Divider mt="30px" borderColor={"white.400"} ></Divider>
             {/* <Button mt="15px" h="30px" color="white" bgColor="gray.600" onClick={async () => {
                  props.updateMethod(0)
            }}>back</Button> */}
          </Box>

    // { props.method === 1 ? (
    //     <Box>
    //       { props.index !== 2 ? (
    //         <Box  flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
    //            Hidden Backup Address Recovery 🔑
    //         </Box>
    //       ) : null }
    //       {props.index === 0 ? <EnableBackupAddress/>
    //       : props.index === 1 ? <ProposeRecovery  method={props.method}/> 
    //       : props.index === 2 ? <ExecuteRecovery method={props.method}/>
    //       : null}
    //         <Divider mt="30px" borderColor={"white.400"} ></Divider>
    //          <Button mt="15px" h="30px" color="white" bgColor="gray.600" onClick={async () => {
    //               props.updateMethod(0)
    //         }}>back</Button>
    //     </Box>   

    //   ) : props.method === 2 ? (
    //     <Box>
    //       { props.index !== 2 ? (
    //         <Box  flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
    //             Fingerprint Recovery 🔑
    //         </Box>
    //       ) : null }
    //       {props.index === 0 ? <EnableFingerPrint/>
    //       : props.index === 1 ? <ProposeFingerPrint /> 
    //       : props.index === 2 ? <ExecuteRecovery method={props.method}/>
    //       : null}  
    //       <Divider mt="30px" borderColor={"white.400"} ></Divider>
    //          <Button mt="15px" h="30px" color="white" bgColor="gray.600" onClick={async () => {
    //               props.updateMethod(0)
    //         }}>back</Button>
    //     </Box>              
    //   ) : props.method === 3 ? (
    //     <Box>
    //       <Box flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
    //          Secret Password Recovery 🔑
    //       </Box>
    //       <SecretWord/> 
    //       <Divider mt="30px" borderColor={"white.400"} ></Divider>
    //          <Button mt="15px" h="30px" color="white" bgColor="gray.600" onClick={async () => {
    //               props.updateMethod(0)
    //         }}>back</Button>
    //     </Box>
    //   ) : props.method === 4 ? (
    //     <Box>
    //       <Box flex={15} mb={5} textAlign="center" color="white" fontSize={20}>
    //          Social Recovery by Private Guardians 🔑
    //       </Box>                 
    //       <SocialRecovery/> 
    //       <Divider mt="30px" borderColor={"white.400"} ></Divider>
    //          <Button mt="15px" h="30px" color="white" bgColor="gray.600" onClick={async () => {
    //               props.updateMethod(0)
    //         }}>back</Button>
    //     </Box>   
    //   ) : null }
    //    </Box>
    )
}

export default MethodHeader;