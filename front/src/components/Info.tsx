import { Flex, Text, VStack } from "@chakra-ui/react";
import { useContext } from "react";
import UserDataContext from "src/contexts/userData";
import { shortenTxHash } from "src/scripts/utils/address";
const Info = () => {
	const { safeAddress, pluginAddress, isPluginEnabled, currentOwner } =
		useContext(UserDataContext);

	return (
		<Flex
			p={5}
			mx={200}
			my={100}
			borderRadius="lg"
			boxShadow="lg"
			borderColor={"#00796F"}
			bg="linear-gradient(to bottom, rgba(157, 198, 171, 0.6), rgba(208, 233, 217, 0.6))"
			borderTopWidth={"1px"}
			pb="20px"
			justifyContent="space-between"
			alignItems="center"
			flexDirection="column"
			style={{
				color: "black",
			}}
		>
			<Text as="b" fontSize={18} my={15}>
				This page is work in progress...
			</Text>
			<Text as="b" fontSize={15} my={15}>
				Basic Information
			</Text>
			<Flex alignItems="strech">
				<VStack spacing={1} fontSize={14} align="start">
					<Text>・ Safe Address :</Text>
					<Text>・ Safe Owner Address:</Text>
					<Text>・ Recovery Module Address :</Text>
					<Text>・ Module Enabled :</Text>
				</VStack>

				<VStack spacing={1} fontSize={14} align="end" ml={3}>
					<Text>{safeAddress}</Text>
					<Text>{currentOwner}</Text>
					<Text>{pluginAddress}</Text>
					<Text>{isPluginEnabled.toString()}</Text>
				</VStack>
			</Flex>

			<Text as="b" fontSize={15} my={30}>
				Recovery Settings
			</Text>

			<Text mb={5} fontSize={15}>
				1. Backup Address Recovery
			</Text>
			<Flex alignItems="strech" mb={30}>
				<VStack spacing={1} fontSize={14} align="start">
					<Text>・ Enabled :</Text>
					<Text>・ Timelock :</Text>
					<Text>・ Backup Address Hash :</Text>
					<Text>・ The number of proposals:</Text>
				</VStack>

				<VStack spacing={1} fontSize={14} align="end" ml={3}>
					<Text>true</Text>
					<Text>45 days ( 13 days to go )</Text>
					<Text>
						{shortenTxHash(
							"0x189dcaf6f029ce3d4b377878a1ef9983a1bc8822c4bbeb50fe26bfdb8be23e5b"
						)}
					</Text>
					<Text>4</Text>
				</VStack>
			</Flex>
		</Flex>
	);
};

export default Info;
