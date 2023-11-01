import {
    Tag, Select, Spinner, Card, CardBody, Box, Tabs, TabList, Tab, TabPanels, TabPanel,
    Input, Flex, Button, StatNumber, Stat, StatLabel, Text, VStack
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from 'react'
import UserCredentialContext from 'src/contexts/userCredential';
import { _isMethodEnabled, _proposeEcrecoverRecover, getRecoveryCount, _proposeRecovery } from '../scripts/plugin'

const ProposeRecovery = (props) => {
    const { safeAddress, safeSDK, signer } = useContext(UserCredentialContext);
    const [ownerReplaced, setOwnerReplaced] = useState<string>("");
    const [threshold, setThreshold] = useState<number>(0);
    const [pendingNewOwner, setPendingNewOwner] = useState<string>("");
    const [secret, setSecret] = useState<string>("");
    const [recoveryCount, setRecoveryCount] = useState<number>(0)
    const [closeSuccess, setCloseSuccess] = useState<boolean>(true)
    // const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false)

    // useEffect(() => {
    //     ;(async () => {
    //         const isEnabled = await _isMethodEnabled(1);
    //         console.log("isEnabled: ", isEnabled)
    //         if (isEnabled) {
    //             setIsMethodEnabled(isEnabled)
    //         }
    //     })()
    //   })

    console.log("recoveryCount: ", recoveryCount)
    console.log("closeSuccess: ", closeSuccess)
    console.log("_recoveryCount: ", recoveryCount);

    const handleCloseSuccess = () => {
        setCloseSuccess(true);
    }
      
    return (
        <Box pt="3px">
            { closeSuccess ? (
            <Box>
                <Text mb={3} fontSize={15} mx="75px">
                   Propose recovery. The old owner will be replaced with the new owner.
                   0xAB256C9d6aAE9ee6118A1531d43751996541799D
                </Text>
            <Box mt="10px" textAlign="center" alignItems="center">
                <Flex justifyContent="space-between" >
                 <VStack spacing={1}  flex={1}>
                 <Box display='flex' alignItems='center' mt={4} >
                 <label>1. old owner: </label>
                <Input
                    ml={3}
                    sx={{ w: "300px" }}
                    size="sm"
                    type="address"
                    placeholder="0xAbCd..."
                     onChange={(e) => setOwnerReplaced(e.target.value)}
                    />
                </Box>
                <Box display='flex' alignItems='center' mt={4} >
                 <label>2. new owner: </label>
                <Input
                ml={3}
                sx={{ w: "300px" }}
                    size="sm"
                    type="address"
                    placeholder="0xAbCd..."
                     onChange={(e) => setPendingNewOwner(e.target.value)}
                    />
                </Box>
                 <Box display='flex' alignItems='center' mt={4} >
                 <label >3. new threshold:</label>
                <Input
                    ml={3}
                    sx={{ w: "300px" }}
                    size="sm"
                    placeholder="1"
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    />
                 </Box>
                { props.method === 3 ? (
                    <Box display='flex' alignItems='center' mt={4} >
                    <label >secret: </label>
                    <Input
                        ml={3}
                        sx={{ w: "300px" }}
                        size="sm"
                        placeholder="password"
                        onChange={(e) => setSecret(e.target.value)}
                        />
                     </Box>
                ) : null } 
                </VStack>
                </Flex>
               </Box>
                    <Box sx={{ marginBottom: "6px" }} textAlign="center" alignItems="center">
                    <Button sx={{ mt: "35px" }} colorScheme="teal" w="55%"  onClick={async () => {
                      if (pendingNewOwner !== "") {
                         // const _newOwner = await _proposeEcrecoverRecover(signer, threshold, ownerReplaced, pendingNewOwner);
                         console.log("method: ", props.method)
                         console.log("secret: ", secret)
                         await _proposeRecovery(props.method, signer, threshold, ownerReplaced, pendingNewOwner, secret, safeAddress);
                         const _recoveryCount = await getRecoveryCount()
                         setRecoveryCount(Number(_recoveryCount))
                         setCloseSuccess(false)
                      } else {
                        console.log("pending owner address not set");
                      }
                    }}>
                      Propose Recovery
                </Button>
               </Box> 
               </Box>
               ) : ( 
                <Box mt={5}>
                <VStack spacing={1}>
                <Text>
                     Successfully proposed! Recovery Id for your proposal: {recoveryCount}
                </Text>
                {/* other work:
                - when can this proposal be executed
                - recovery count should be read from event instead of public state
                - 
                 */}
                <Text as="u" pt={5} onClick={handleCloseSuccess}>
                      Create new proposal?
                </Text>
                </VStack>
                </Box>
                  )} 
            </Box>
    )
}

export default ProposeRecovery;