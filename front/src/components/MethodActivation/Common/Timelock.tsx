import { Flex, Tooltip, Text } from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

const Timelock = (props: { index: number }) => {
	return (
		<Flex justifyContent="space-between" alignItems="center">
			<Tooltip
				placement="bottom-start"
				label="`Timelock` refers to the waiting period after a proposal is made, in which a recovery proposal can't be executed yet. 
				
				It's dangerous to set a short timelock, as it makes it easier for malicious guardians to take over the account ownership.
                *Recommendation: >30 days in prod. <10 seconds in test."
			>
				<InfoIcon mr={2} mt={0.5} boxSize={3} color="blue.500" />
			</Tooltip>
			<Text>{props.index + ". Timelock :"}</Text>
		</Flex>
	);
};

export default Timelock;
