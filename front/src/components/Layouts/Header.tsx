import { useContext } from "react";
import UserDataContext from "src/contexts/userData";
import logo from "../../assets/logo.png";

import {
	Box,
	Button,
	Flex,
	Text,
	HStack,
	useColorModeValue,
} from "@chakra-ui/react";
export default function Header() {
	const { signer, logout } = useContext(UserDataContext);
	return (
		<Box>
			{/* <Box bg={useColorModeValue('#01796F', 'gray.700')}> */}
			<Flex justify="space-between" p={4}>
				{/* <Text fontSize="1.5rem" fontWeight="bold">
      SafeRecover
    </Text> */}
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
				{signer != null ? <Button onClick={logout}>Disconnect</Button> : null}
			</Flex>
		</Box>
	);
}
