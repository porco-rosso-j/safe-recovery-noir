/* eslint-disable react-hooks/exhaustive-deps */
import {
	Box,
	Input,
	Flex,
	Text,
	VStack,
	HStack,
	Spinner,
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from "react";
import { ProposalType } from "src/scripts/types";
import ProposalDetail from "./ProposalDetail";
import { typeName } from "src/scripts/utils/helper";
import { useViewContract } from "src/hooks";
import { UserDataContext } from "src/contexts/contextData";

const ProposalList = () => {
	const { pluginAddress } = useContext(UserDataContext);
	const { getProposals, getRecoveryCount } = useViewContract();

	const [proposalId, setProposalId] = useState<number>(0);
	const [proposals, setProposals] = useState<ProposalType[]>([]);
	const [loadingProposals, setLoadingProposals] = useState<boolean>(false);
	const [initialLoad, setInitialLoad] = useState<boolean>(true);
	const [proposalsFound, setProposalsFound] = useState<boolean>(false);

	const fetchProposals = async () => {
		const proposalLen = Number(await getRecoveryCount());

		if (proposalLen !== 0) {
			setProposalsFound(true);
			setLoadingProposals(true);

			try {
				const proposalsFetched = await getProposals();

				setProposals(proposalsFetched);
				setLoadingProposals(false);
			} catch (error) {
				console.error("Error fetching proposals:", error);
			}
		} else {
			setProposalsFound(false);
		}
	};

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
		<Box pt="3px">
			{proposalId === 0 ? (
				<Box>
					<Text mb={5} fontSize={15} mx="75px">
						Choose proposal and execute ⚡️
					</Text>
					<Box mb={5}>
						<label>Proposal ID:</label>
						<Input
							ml={3}
							sx={{ w: "50px" }}
							size="sm"
							placeholder="2"
							onChange={(e) => {
								handleSetProposalId(Number(e.target.value));
							}}
						/>
					</Box>

					<Box mt={10} mb={50}>
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
								mx={5}
								maxHeight="300px"
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
				<ProposalDetail
					proposal={proposals[Number(proposalId)]}
					proposalId={proposalId}
					setProposalId={setProposalId}
					fromProposeTab={false}
				/>
			)}
		</Box>
	);
};

export default ProposalList;
