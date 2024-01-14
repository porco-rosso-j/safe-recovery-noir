import { useContext } from "react";
import UserDataContext from "src/contexts/userData";
import logo from "../../assets/logo.png";

import {
	Box,
	Button,
	Flex,
	Text,
	HStack,
	useDisclosure,
} from "@chakra-ui/react";
import { shortenAddressS } from "src/scripts/utils/address";
import {
	useWeb3Modal,
	useWeb3ModalAccount,
	useDisconnect,
} from "@web3modal/ethers5/react";
import { Link } from "react-router-dom";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";

export default function Header() {
	const { logout } = useContext(UserDataContext);
	const { disconnect } = useDisconnect();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const modal = useWeb3Modal();
	const { address, isConnected } = useWeb3ModalAccount();

	const handleDisconnect = () => {
		disconnect();
		logout();
	};

	const handleCopy = () => {
		navigator.clipboard
			.writeText(address)
			.then(() => {
				console.log("Text copied to clipboard");
			})
			.catch((err) => {
				console.error("Failed to copy text: ", err);
			});
	};

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
				<Flex
					as="nav"
					align="center"
					justify="space-between"
					wrap="wrap"
					color="white"
				>
					<Box
						display={{ base: "block", md: "none" }}
						onClick={isOpen ? onClose : onOpen}
					>
						{isOpen ? <CloseIcon /> : <HamburgerIcon />}
					</Box>

					<Box
						display={{ base: isOpen ? "block" : "none", md: "flex" }}
						width={{ base: "full", md: "auto" }}
						alignItems="center"
						gap={4}
						mt={2}
						mr={250}
					>
						<Link to="/">
							<Button
								color={"#cccccc"}
								background="transparent"
								_hover={{ bg: "transparent" }}
							>
								Recovery
							</Button>
						</Link>
						<Link to="/info">
							<Button
								color={"#cccccc"}
								background="transparent"
								_hover={{ bg: "transparent" }}
							>
								Info
							</Button>
						</Link>
						<Link to="/doc">
							<Button
								color={"#cccccc"}
								background="transparent"
								_hover={{ bg: "transparent" }}
							>
								Doc
							</Button>
						</Link>
					</Box>
				</Flex>
				{isConnected ? (
					<Box
						style={{
							backgroundColor: "#233a28",
							boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
							marginTop: "5px",
							borderRadius: "5px",
							padding: "5px",
							display: "flex",
						}}
					>
						<Text
							onClick={handleCopy}
							fontSize={17}
							color={"#cccccc"}
							mt={2}
							ml={3}
							mr={5}
							transition="color 0.1s"
							_hover={{
								color: "black",
								cursor: "pointer",
							}}
						>
							{shortenAddressS(address)}
						</Text>
						<Button backgroundColor={"#cccccc"} onClick={handleDisconnect}>
							Disconnect
						</Button>
					</Box>
				) : (
					<Button onClick={() => modal.open()}>Connect</Button>
				)}
			</Flex>
		</Box>
	);
}
