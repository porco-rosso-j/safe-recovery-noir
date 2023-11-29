import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { useContext, useState, useEffect } from "react";
import * as ethers from "ethers";
import UserDataContext from "src/contexts/userData";
import {
	getSafePluginAddress,
	isPluginEnabled,
	getSafeOwners,
} from "../scripts/utils/safe";
import { getSigner } from "src/scripts/utils/login";

const AddressInfo = () => {
	const {
		signer,
		safeAddress,
		pluginAddress,
		isPluinEnabled,
		currentOwner,
		savePluginAdddress,
		saveIsPluginEnabled,
		saveCurrentOwner,
	} = useContext(UserDataContext);
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const toggle = () => {
		setIsOpen(!isOpen);
	};

	useEffect(() => {
		(async () => {
			if (safeAddress !== "" && pluginAddress === "" && isPluinEnabled) {
				try {
					const PluginAddr = await getSafePluginAddress(safeAddress);
					if (PluginAddr !== ethers.constants.AddressZero) {
						savePluginAdddress(PluginAddr);
					}
				} catch (e) {
					console.log(e);
				}
			}
		})();
	});

	useEffect(() => {
		(async () => {
			if (pluginAddress === "" && isPluinEnabled) {
				const _isPluginEnabled = await isPluginEnabled(
					safeAddress,
					pluginAddress
				);
				console.log("isPluginEnabled: ", _isPluginEnabled);
				if (_isPluginEnabled) {
					saveIsPluginEnabled(_isPluginEnabled);
				}
			}
		})();
	});

	useEffect(() => {
		(async () => {
			if (safeAddress !== "") {
				try {
					const owners = await getSafeOwners(safeAddress);
					console.log("owners; ", owners);
					const owner = owners[0];
					console.log("owner; ", owner);
					saveCurrentOwner(owner);
				} catch (e) {
					console.log(e);
				}
			}
		})();
	});

	return (
		<Flex
			p={5}
			mx="auto"
			mt="3"
			mb="5"
			borderRadius="lg"
			boxShadow="lg"
			borderColor={"#00796F"}
			borderTopWidth={"1px"}
			pb="20px"
			justifyContent="space-between"
			alignItems="center"
			flexDirection="column"
		>
			<Text as="b" fontSize={15} justifyContent="center">
				Address Info
			</Text>
			{!isOpen ? (
				<ChevronDownIcon boxSize={5} onClick={toggle} color="white" />
			) : (
				<ChevronUpIcon boxSize={5} onClick={toggle} color="white" />
			)}
			{isOpen ? (
				<Flex alignItems="strech">
					<VStack spacing={1} fontSize={14} align="start">
						<Text>・ Safe :</Text>
						{currentOwner !== "" && <Text>・ Safe Owner :</Text>}
						{pluginAddress !== "" && <Text>・ SafeRecover :</Text>}
					</VStack>
					<VStack spacing={1} fontSize={14} color="white" align="end">
						<Text>{safeAddress}</Text>
						{currentOwner !== "" && <Text>{currentOwner}</Text>}
						{pluginAddress !== "" && <Text>{pluginAddress}</Text>}
					</VStack>
				</Flex>
			) : null}
		</Flex>
	);
};

export default AddressInfo;
