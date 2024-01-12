import { Flex, Tooltip, Text } from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

const DelayPeriod = (props: { index: number }) => {
	return (
		<Flex justifyContent="space-between" alignItems="center">
			<Tooltip
				placement="bottom-start"
				label="`Delay Period` refers to the period of time until a recovery proposal becomes executable after the proposal is made.
                *Recommendation: >30 days in prod. <10 seconds in test."
			>
				<InfoIcon mr={2} mt={0.5} boxSize={3} color="blue.500" />
			</Tooltip>
			<Text>{props.index + ". Delay period :"}</Text>
		</Flex>
	);
};

export default DelayPeriod;
