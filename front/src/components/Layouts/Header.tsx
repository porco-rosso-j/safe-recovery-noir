import { useContext, useState, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import logo from "../../assets/logo.png";

import { Box, Button, Flex, Text, HStack, VStack } from "@chakra-ui/react";
import { shortenAddress } from "src/scripts/utils/address";
export default function Header() {
	const { signer, logout } = useContext(UserDataContext);
	const [signerAddress, setSignerAddress] = useState<string>("");

	useEffect(() => {
		const setSignerAddr = async () => {
			const addr = await signer.getAddress();
			setSignerAddress(shortenAddress(addr));
		};
		if (signer !== null && signerAddress === "") {
			setSignerAddr();
		}
	}, [signer, signerAddress, setSignerAddress]);
	return (
		<Box>
			<Flex justify="space-between" p={4}>
				<HStack spacing={3}>
					<img
						src={logo}
						alt="Logo"
						style={{ height: "1.75rem", width: "auto", borderRadius: 5 }}
					/>
					<Text fontSize="1.75rem" fontWeight="bold">
						SafeRecover
					</Text>
				</HStack>
				<VStack>
					{signer != null ? <Button onClick={logout}>Disconnect</Button> : null}
					{/* <Text>{signerAddress !== "" ? signerAddress : null}</Text> */}
				</VStack>
			</Flex>
		</Box>
	);
}
