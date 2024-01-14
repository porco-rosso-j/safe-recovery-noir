import { Box, Flex } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";

const Doc = () => {
	const markdown = `

    # Safe Recover

    ## Introduction
    A safe plugin that allows Safe owners to recover account ownership 
    in the case where they lose access to their Safe. All the recovery methods 
    leverage Noir, a DSL for writing zero-knowledge proof circuits, 
    to help owners recover their account in a secure and private manner.
    
    This product is developed as a grantee of the Safe Grant Program Wave I. 

    ## Recovery Mechanisms
    Available recovery methods:

    - Private Backup Address Recovery:
    This method allows backup signer, whose eth address is hashed and stored in smart contract, 
    to recover account by proving that the the hashed hidden address matches the the hash of 
    an eth address that is ec-recovered with provided public keys, signature, 
    and message in k256 circuit.
    
    - TouchID Recovery:
    This method allows for account recovery via the correct verification of 
    ECDSA with p256 curve for a provided fingerprint signature generated 
    through WebAuthn on user device.

    - Secret Word Recovery:
    This method lets a user recover account by privately proving 
    the knowledge of a particular secret word.
  
    - Social Recovery:
    This method allows private guardians, whose eth addresses are included in 
    a merkle root stored on smart contract, to recover account ownership 
    by proving their membership in the merkle root. Recovery can successfully 
    be executed if the suffcient number of guardians approve a proposed recovery.
    

    Read more at: https://github.com/porco-rosso-j/safe-recovery-noir
    `;

	return (
		<Flex
			mx={150}
			my={50}
			borderRadius="lg"
			boxShadow="lg"
			borderColor={"#00796F"}
			bg="linear-gradient(to bottom, rgba(157, 198, 171, 0.6), rgba(208, 233, 217, 0.6))"
			borderTopWidth={"1px"}
			pb="20px"
			fontSize={13}
			style={{
				color: "black",
				maxWidth: "100%", // Set a maximum width
				overflow: "auto", // Add overflow control
				wordWrap: "break-word", // Ensure long words do not cause overflow
			}}
		>
			<Box margin={10}>
				<ReactMarkdown children={markdown} />
			</Box>
		</Flex>
	);
};

export default Doc;
