
import { Box, Flex, Button, VStack, Divider, Tabs, TabList, Tab, TabPanels, TabPanel, Text } from "@chakra-ui/react";

const MethodOptions = (props) => {
    return (
        <Box mt="10px" textAlign="center" alignItems="center">
        <Flex justifyContent="space-between" >
         <VStack spacing={1}  flex={1}>
          <Button sx={{ mt: "10px", mb: "10px" }} colorScheme="teal" w="85%"  onClick={async () => {
            props.updateMethod(1)
             }}>
            1: Backup Address
          </Button>
          <Button sx={{ mt: "10px", mb: "10px" }} colorScheme="teal" w="85%"  onClick={async () => {
            props.updateMethod(3)
             }}>
            3: Secret Word
          </Button>
          </VStack>
          <VStack spacing={1} flex={1}>
          <Button sx={{ mt: "10px", mb: "10px" }} colorScheme="teal" w="85%"  onClick={async () => {
            props.updateMethod(2)
             }}>
             2: FingerPrint
          </Button>
          <Button sx={{ mt: "10px", mb: "10px" }} colorScheme="teal" w="85%"  onClick={async () => {
            props.updateMethod(4)
          }}>
            4: Social Recovery 
            </Button>
        </VStack>
        </Flex>
       </Box>
    )
}

export default MethodOptions;