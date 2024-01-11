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
import { getProposals, getRecoveryCount } from "../scripts/plugins/index";
import { Proposal as ProposalType } from "../scripts/plugins/types";
import Proposal from "./Proposal";
import { typeName } from "src/scripts/utils/helper";

const ProposalList = (props) => {
	const { pluginAddress } = useContext(UserDataContext);
	const [proposalId, setProposalId] = useState<number>(0);
	const [proposalLength, setProposalLength] = useState<number>(0);
	const [proposals, setProposals] = useState<ProposalType[]>([]);
	const [loadingProposals, setLoadingProposals] = useState<boolean>(true);
	const [initialLoad, setInitialLoad] = useState<boolean>(true);

	const fetchProposals = useCallback(async () => {
		console.log("fetchProposals");
		const proposalLen = await getRecoveryCount(pluginAddress);
		if (proposalLength !== proposalLen) {
			try {
				const proposalsFetched = await getProposals(pluginAddress);
				setProposals(proposalsFetched);
				setProposalLength(proposalLen);
				setLoadingProposals(false);
			} catch (error) {
				console.error("Error fetching proposals:", error);
			}
		}
	}, [pluginAddress, proposalLength]);

	useEffect(() => {
		if (initialLoad && pluginAddress !== "") {
			setLoadingProposals(true);
			fetchProposals();
			setInitialLoad(false);
			console.log("loadingProposals after: ", loadingProposals);
		}

		const interval = setInterval(() => {
			if (pluginAddress !== "") {
				fetchProposals();
			}
		}, 60000); // Update every 60 seconds

		return () => clearInterval(interval);
	}, [
		initialLoad,
		pluginAddress,
		loadingProposals,
		proposalLength,
		fetchProposals,
	]);

	const handleSetProposalId = (id: number) => {
		console.log("id: ", id);
		console.log("proposals.length: ", proposals.length);
		if (id < proposals.length) {
			setProposalId(id);
		} else {
			console.log("invalid id");
		}
	};

	return (
		<Box pt="3px">
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
			<Box>
				{proposalId === 0 ? (
					<Box>
						{!loadingProposals ? (
							<VStack spacing={4} align="stretch">
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
										<HStack spacing={4}>
											<Text ml={3}>ID: {proposal.id}</Text>
											<Text flex={1}>{typeName(proposal.type)} Recovery</Text>
											{proposal.isExecutable ? (
												<Text mr={3} color={"green"}>
													{" "}
													Executable
												</Text>
											) : (
												<Text mr={3} color={"red.400"}>
													{" "}
													Non Executable
												</Text>
											)}
										</HStack>
									</Box>
								))}
							</VStack>
						) : (
							<Box>
								<Text mt={10}>Loading proposals...</Text>
								<Flex justifyContent="center" alignItems="center">
									<Spinner mt={10} mb={5} color="gray.300" />
								</Flex>
							</Box>
						)}
					</Box>
				) : (
					<Proposal
						proposal={proposals[proposalId]}
						proposalId={proposalId}
						setProposalId={setProposalId}
					/>
				)}
			</Box>
		</Box>
	);
};

export default ProposalList;
