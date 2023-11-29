import { Flex, Text, VStack } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useContext, useState, useEffect } from "react";
import * as ethers from "ethers";
import UserDataContext from "src/contexts/userData";
import {
	getSafePluginAddress,
	isPluginEnabled,
	getSafeOwners,
} from "../scripts/utils/safe";

const AddressInfo = () => {
	const {
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
			if (pluginAddress === "") {
				const PluginAddr = await getSafePluginAddress(safeAddress);
				if (PluginAddr !== ethers.constants.AddressZero) {
					savePluginAdddress(PluginAddr);
				}
			}
		})();
	});

	useEffect(() => {
		(async () => {
			if (pluginAddress !== "" && !isPluinEnabled) {
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
				const owners = await getSafeOwners(safeAddress);
				console.log("owners; ", owners);
				const owner = owners[0];
				console.log("owner; ", owner);
				saveCurrentOwner(owner);
			}
		})();
	});

	return isOpen ? (
		<Flex
			p={5}
			mx="auto"
			mt="3"
			mb="5"
			borderRadius="lg"
			boxShadow="lg"
			borderColor={"#00796F"}
			borderTopWidth={"1px"}
			pb="30px"
			justifyContent="space-between" // Align the button to the right
			alignItems="center" // Vertically center the button
			flexDirection="column"
		>
			<VStack spacing={1}>
				<Text as="b" fontSize={15} justifyContent="center">
					Address Info
				</Text>
				<ChevronDownIcon boxSize={5} onClick={toggle} color="white" />
				<Text fontSize={14} color="white">
					・ Safe: {safeAddress}
				</Text>
				{currentOwner !== "" && (
					<Text fontSize={14} color="white">
						・ Owner: {currentOwner}
					</Text>
				)}
				{pluginAddress !== "" && (
					<Text fontSize={14} color="white">
						・ SafeRecover: {pluginAddress}
					</Text>
				)}
			</VStack>
		</Flex>
	) : (
		<Flex
			p={3}
			mx="auto"
			mt="3"
			mb="5"
			borderRadius="lg"
			boxShadow="lg"
			// backgroundColor={"gray.800"}
			borderColor={"#00796F"}
			borderTopWidth={"1px"}
			pb="10px"
			justifyContent="space-between"
			alignItems="center"
			flexDirection="column"
		>
			<Text as="b" fontSize={15} justifyContent="center">
				Address Info
			</Text>
			<ChevronDownIcon boxSize={5} onClick={toggle} color="white" />
		</Flex>
	);
};

export default AddressInfo;
