import { Box, Divider, Select } from "@chakra-ui/react";
import ProposeRecovery from "./ProposeRecovery";
import ProposalList from "./ProposalList";
import {
	BackupAddress,
	FingerPrint,
	SecretWord,
	SocialRecovery,
} from "./MethodActivation/index";

type MethodHeaderType = {
	updateMethod: (index: number) => void;
	setTabIndex?: (index: number) => void;
	method: number;
	index: number;
};

const MethodHeader = (props: MethodHeaderType) => {
	return (
		<Box pt={3}>
			{props.index === 0 || props.index === 1 ? (
				<Select
					mt={2}
					mb={4}
					onChange={(e) => props.updateMethod(Number(e.target.value))}
					// defaultValue={"1"}
					value={props.method}
				>
					<option value="1">1. Backup Address Recovery</option>
					<option value="2"> 2. FingerPrint Recovery</option>
					<option value="3"> 3. Secret Word Recovery</option>
					<option value="4"> 4. Social Recovery</option>
				</Select>
			) : null}
			{props.index === 0 ? (
				<Box>
					{props.method === 1 ? (
						<Box>
							<BackupAddress methodIndex={props.method} />
						</Box>
					) : props.method === 2 ? (
						<Box>
							<FingerPrint methodIndex={props.method} />
						</Box>
					) : props.method === 3 ? (
						<Box>
							<SecretWord methodIndex={props.method} />
						</Box>
					) : props.method === 4 ? (
						<Box>
							<SocialRecovery methodIndex={props.method} />
						</Box>
					) : null}
				</Box>
			) : props.index === 1 ? (
				<ProposeRecovery
					methodIndex={props.method}
					setTabIndex={props.setTabIndex}
				/>
			) : props.index === 2 ? (
				<ProposalList />
			) : null}
			<Divider mt="30px" borderColor={"white.400"}></Divider>
		</Box>
	);
};

export default MethodHeader;
