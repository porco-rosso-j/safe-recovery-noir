/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react-hooks/exhaustive-deps */
import {
	Box,
	Tabs,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
	Text,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import UserDataContext from "src/contexts/userData";
import { shortenAddress } from "src/scripts/utils/address";
import MethodHeader from "./MethodHeader";
import EnablePlugin from "./EnablePlugin";
import WalletLogin from "./WalletLogin";
import {
	useWeb3Modal,
	useWeb3ModalAccount,
	useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import {
	getSafeSDK,
	getSigner,
	supportedChainID,
	switchNetwork,
} from "src/scripts/utils/login";

const MenuTabs = () => {
	const {
		signer,
		safeAddress,
		safeSDK,
		isPluginEnabled,
		currentOwner,
		saveSigner,
		saveSafeSDK,
	} = useContext(UserDataContext);
	const { walletProvider } = useWeb3ModalProvider();
	const modal = useWeb3Modal();
	const { address, chainId } = useWeb3ModalAccount();
	const [method, setMethod] = useState<number>(1);
	const [tabIndex, setTabIndex] = useState(0);
	const [tabOneDisplayIndex, setTabOneDisplayIndex] = useState<number>(0);
	const [isNetworkWrong, setIsWrongNetwork] = useState<boolean>(true);

	const updateMethod = (index: number) => {
		setMethod(index);
	};

	const handleTabsChange = (index: number) => {
		setTabIndex(index);
		setMethod(method);
	};

	const getShowLoginPage = () => {
		if (signer === null || safeAddress === "") {
			return true;
		}

		return false;
	};

	const updateSignerAndSafe = async () => {
		try {
			const signer = await getSigner(walletProvider);
			if (signer) saveSigner(signer);

			const safeSDK = await getSafeSDK(safeAddress, signer);
			if (safeSDK) {
				saveSafeSDK(safeSDK);
			} else {
				saveSafeSDK(null);
			}
		} catch (e) {
			console.log("e:", e);
		}
	};

	useEffect(() => {
		if (tabIndex === 0) {
			if (safeSDK && address === currentOwner && isPluginEnabled) {
				setTabOneDisplayIndex(1);
			} else if (safeSDK && address === currentOwner && !isPluginEnabled) {
				setTabOneDisplayIndex(2);
			} else {
				setTabOneDisplayIndex(3);
			}
		}
	}, [tabIndex, address, safeSDK, currentOwner, isPluginEnabled]);

	// get walletProvider when walletProvider disconnected
	useEffect(() => {
		const timer = setTimeout(async () => {
			if (!walletProvider) {
				modal.open();
			}
		}, 10000);

		return () => clearTimeout(timer);
	}, [walletProvider, modal, saveSigner]);

	useEffect(() => {
		(async () => {
			if (walletProvider) {
				// update signer and safe when walletProvider is defined but signer/safe sdk is null
				if (signer === null) {
					await updateSignerAndSafe();
				} else {
					// re-save signer when it's switched to new account
					const signerAddress = await signer.getAddress();
					if (address !== signerAddress) {
						await updateSignerAndSafe();
					}
				}
			}
		})();
	}, [walletProvider, signer, updateSignerAndSafe]);

	// ask for network change when walletProvider detects unsupported network
	useEffect(() => {
		(async () => {
			if (walletProvider && chainId !== supportedChainID) {
				setIsWrongNetwork(false);
				await switchNetwork(walletProvider);
			} else if (walletProvider && chainId === supportedChainID) {
				if (!isNetworkWrong) {
					setIsWrongNetwork(true);
				}
			}
		})();
	});

	return (
		<Box
			mb={10}
			display="flex"
			flexDirection="column"
			justifyContent="center"
			alignItems="center"
			flex="1"
		>
			{getShowLoginPage() ? (
				<WalletLogin />
			) : (
				<Box
					p={5}
					backgroundColor={"#2e2e2e"}
					borderRadius="lg"
					boxShadow="lg"
					mt="5"
					textAlign="center"
					maxW="1024px"
					width="600px"
					mx="auto"
				>
					<Tabs
						index={tabIndex}
						onChange={handleTabsChange}
						variant="line"
						borderColor="gray"
					>
						<TabList>
							<Tab w="50%" color="#CBDAD1">
								<Text fontSize={20} mb={3}>
									Enable
								</Text>
							</Tab>
							<Tab fontSize={20} w="50%" color="#CBDAD1">
								<Text mb={3}>Propose</Text>
							</Tab>
						</TabList>
						<TabPanels>
							<TabPanel>
								{tabOneDisplayIndex === 1 ? (
									<MethodHeader
										updateMethod={updateMethod}
										method={method}
										index={tabIndex}
									/>
								) : tabOneDisplayIndex === 2 ? (
									<EnablePlugin />
								) : tabOneDisplayIndex === 3 ? (
									<Box my="50px">
										{walletProvider ? (
											<Text>
												You are not an owner of Safe{" "}
												{shortenAddress(safeAddress)}
											</Text>
										) : (
											<Text>Connect your wallet</Text>
										)}
									</Box>
								) : null}
							</TabPanel>
							<TabPanel>
								<MethodHeader
									updateMethod={updateMethod}
									setTabIndex={handleTabsChange}
									method={method}
									index={tabIndex}
								/>
							</TabPanel>
						</TabPanels>
					</Tabs>
				</Box>
			)}
		</Box>
	);
};

export default MenuTabs;
