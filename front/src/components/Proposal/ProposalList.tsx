import {
	Box,
	Input,
	Flex,
	Text,
	VStack,
	HStack,
	Spinner,
} from "@chakra-ui/react";
import { useContext, useState, useEffect, useCallback } from "react";
import UserDataContext from "src/contexts/userData";
import { getProposals, getProposalCount } from "src/scripts/plugins/index";
import { ProposalType } from "src/scripts/plugins/types";
import ProposalDetail from "./ProposalDetail";
import { typeName } from "src/scripts/utils/helper";
import { inputStyle } from "src/theme";

const ProposalList = () => {
	const { pluginAddress } = useContext(UserDataContext);
	const [proposalId, setProposalId] = useState<number>(0);
	const [proposals, setProposals] = useState<ProposalType[]>([]);
	const [loadingProposals, setLoadingProposals] = useState<boolean>(false);
	const [initialLoad, setInitialLoad] = useState<boolean>(true);
	const [proposalsFound, setProposalsFound] = useState<boolean>(false);

	const fetchProposals = useCallback(async () => {
		const proposalLen = Number(await getProposalCount(pluginAddress));

		if (proposalLen !== 0) {
			setProposalsFound(true);
			setLoadingProposals(true);

			try {
				const proposalsFetched = await getProposals(pluginAddress);

				setProposals(proposalsFetched);
				setLoadingProposals(false);
			} catch (error) {
				console.error("Error fetching proposals:", error);
			}
		} else {
			setProposalsFound(false);
		}
	}, [pluginAddress]);

	useEffect(() => {
		if (initialLoad && pluginAddress !== "") {
			fetchProposals();
			setInitialLoad(false);
		}

		const interval = setInterval(() => {
			if (proposalId === 0 && pluginAddress !== "") {
				fetchProposals();
			}
		}, 30000); // Update every 60 seconds

		return () => clearInterval(interval);
	}, [initialLoad, pluginAddress, fetchProposals, proposalId]);

	const handleSetProposalId = (id: number) => {
		console.log("id: ", id);
		console.log("proposals.length: ", proposals.length);
		if (id < proposals.length) {
			setProposalId(id);
		} else {
			console.log("invalid id");
		}
	};

	const handleStatus = (proposal: ProposalType) => {
		if (proposal.status === 0) {
			if (proposal.isExecutable.result) {
				return (
					<Text mr={3} color={"green"}>
						{" "}
						Executable
					</Text>
				);
			} else {
				return (
					<Text mr={3} color={"red.400"}>
						{" "}
						Non Executable
					</Text>
				);
			}
		} else if (proposal.status === 1) {
			return (
				<Text mr={3} color={"blue.400"}>
					{" "}
					Executed
				</Text>
			);
		} else {
			return (
				<Text mr={3} color={"red.400"}>
					{" "}
					Rejected
				</Text>
			);
		}
	};

	return (
		<Box
			display="flex"
			flexDirection="column"
			justifyContent="center"
			alignItems="center"
			flex="1"
			pt={20}
		>
			<Box
				p={5}
				backgroundColor={"#2e2e2e"}
				borderRadius="lg"
				boxShadow="lg"
				textAlign="center"
				maxW="1024px"
				width="600px"
				mx="auto"
			>
				<Box
					p={5}
					borderRadius="lg"
					boxShadow="lg"
					borderColor={"#444745"}
					borderWidth={"1px"}
				>
					<Text mt={5} mb={25} fontSize={25}>
						Proposals
					</Text>
					{proposalId === 0 ? (
						<Box>
							<HStack mb={5} justifyContent={"center"} gap={3}>
								<Text>Proposal ID:</Text>
								<Input
									textAlign={"center"}
									style={inputStyle}
									// ml={3}
									sx={{ w: "55px" }}
									size="sm"
									placeholder="2"
									onChange={(e) => {
										handleSetProposalId(Number(e.target.value));
									}}
								/>
							</HStack>

							<Box mt={10} mb={30}>
								{!proposalsFound || loadingProposals ? (
									<Box>
										{loadingProposals ? (
											<Box>
												<Text>Loading proposals...</Text>
												<Flex justifyContent="center" alignItems="center">
													<Spinner mt={10} color="gray.300" />
												</Flex>
											</Box>
										) : (
											<Text>No proposal found</Text>
										)}
									</Box>
								) : (
									// proposalNotFound == true && loadingProposals == false
									<VStack
										spacing={4}
										align="stretch"
										mx={10}
										maxHeight="400px"
										overflowY="auto"
									>
										{proposals.map((proposal) => (
											<Box
												key={proposal.id}
												p={1}
												borderWidth="1px"
												borderRadius="md"
												_hover={{ shadow: "md", cursor: "pointer" }}
												onClick={() => {
													handleSetProposalId(proposal.id);
												}}
											>
												<HStack spacing={4} py={1}>
													<Text ml={3}>ID: {Number(proposal.id)}</Text>
													<Text flex={1}>
														{typeName(Number(proposal.type))} Recovery
													</Text>
													{handleStatus(proposal)}
												</HStack>
											</Box>
										))}
									</VStack>
								)}
							</Box>
						</Box>
					) : (
						<Box mx={3}>
							<ProposalDetail
								proposal={proposals[Number(proposalId)]}
								proposalId={proposalId}
								setProposalId={setProposalId}
								fromProposeTab={false}
							/>
						</Box>
					)}
				</Box>
			</Box>
		</Box>
	);
};

export default ProposalList;
