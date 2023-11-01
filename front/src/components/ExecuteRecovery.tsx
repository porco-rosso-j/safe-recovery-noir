import {
    Tag, Select, Spinner, Card, CardBody, Box, Tabs, TabList, Tab, TabPanels, TabPanel,
    Input, Flex, Button, StatNumber, Stat, StatLabel, Text, VStack
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from 'react'
import UserCredentialContext from 'src/contexts/userCredential';
import { _isMethodEnabled, _executeRecover, getNewOwnerForPoposal, _getIsRecoveryExecutable } from '../scripts/plugin'

const ExecuteRecovery = (props) => {
    const { safeAddress, safeSDK, signer, currentOwner, saveCurrentOwner } = useContext(UserCredentialContext);
    const [expectedNewOwner, setExpectedNewOwner] = useState<string>("");
    const [proposalId, setProposalId] = useState<number>(0);
    const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false)
    const [isRecoveryExecutable, setIsRecoveryExecutable] = useState<boolean>(false)

    // useEffect(() => {
    //     ;(async () => {
    //         if (proposalId!== 0) {
    //           // can fetch method from Recovery struct of selected proposal id
    //           const IsMethodEnabled = await _isMethodEnabled(props.method);
    //           console.log("IsMethodEnabled: ", IsMethodEnabled)
    //           if (IsMethodEnabled) {
    //               setIsMethodEnabled(IsMethodEnabled)
    //           }
    //         }
    //     })()
    //   })

      useEffect(() => {
        ;(async () => {
            if (proposalId !== 0) {
                const expectedNewOwner = await getNewOwnerForPoposal(proposalId);
                console.log("expectedNewOwner: ", expectedNewOwner)
                setExpectedNewOwner(expectedNewOwner)
            }
        })()
      })
    
      useEffect(() => {
        ;(async () => {
            if (proposalId !== 0) {
             const IsRecoveryExecutable = await _getIsRecoveryExecutable(proposalId);
             // const IsRecoveryExecutable = await _getIsRecoveryExecutable(signer, proposalId);
             console.log("IsRecoveryExecutable: ", IsRecoveryExecutable)
             setIsRecoveryExecutable(IsRecoveryExecutable)
            }
        })()
      })
      
    return (
        <Box pt="3px">
            <Text mb={5} fontSize={15} mx="75px">
               Choose the proposal Id and execute ⚡️
            </Text>
        {/* { isMethodEnabled ? ( */}
        {/* <Box> */}
            <label >proposal Id:</label>
                <Input
                    ml={3}
                    sx={{ w: "50px" }}
                    size="sm"
                    placeholder="2"
                    onChange={(e) => setProposalId(Number(e.target.value))}
                    />
            <Text mb={3} fontSize={15} mx="75px">
               { proposalId !== 0 ? "The current owner " + currentOwner + " will be swapped for the new owner address will be " + expectedNewOwner + " after execution."
                : null}
            </Text>

            {/* <List> Proposal Id List <List/> */}

              <Box sx={{ marginBottom: "6px" }} textAlign="center" alignItems="center">
                <Button sx={{ mt: "35px" }} colorScheme="teal" w="55%"  onClick={async () => {
                  if (proposalId !== 0 && isRecoveryExecutable) {
                     const res = await _executeRecover(signer, proposalId);
                     if (res) {
                        saveCurrentOwner(expectedNewOwner)
                     }
                  } else {
                    console.log("pending owner address not set");
                  }
                }}>
                  Execute Recovery
            </Button>
           </Box> 
        {/* </Box>) : (
            <Box>
              Enabled
            </Box>
        )} */}
    </Box>
    )
}

export default ExecuteRecovery;