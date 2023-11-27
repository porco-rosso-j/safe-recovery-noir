import { Box, Divider, Select } from "@chakra-ui/react";
import ProposeRecovery from "./ProposeRecovery";
import ExecuteRecovery from "./ExecuteRecovery";
import {
	BackupAddress,
	FingerPrint,
	SecretWord,
	SocialRecovery,
} from "./MethodActivation/index";

const MethodHeader = (props) => {
	return (
		<Box pt={3}>
			{props.index === 0 || props.index === 1 ? (
				<Select
					mt={2}
					mb={4}
					onChange={(e) => props.updateMethod(Number(e.target.value))}
					defaultValue={"1"}
				>
					<option value="1" selected>
						1. Backup Address Recovery
					</option>
					<option value="2"> 2. FingerPrint Recovery</option>
					<option value="3"> 3. Secret Word Recovery</option>
					<option value="4"> 4. Social Recovery</option>
				</Select>
			) : null}
			{props.index === 0 ? (
				<Box>
					{props.method === 1 ? (
						<Box>
							<BackupAddress />
						</Box>
					) : props.method === 2 ? (
						<Box>
							<FingerPrint />
						</Box>
					) : props.method === 3 ? (
						<Box>
							<SecretWord />
						</Box>
					) : props.method === 4 ? (
						<Box>
							<SocialRecovery />
						</Box>
					) : null}
				</Box>
			) : props.index === 1 ? (
				<ProposeRecovery method={props.method} />
			) : props.index === 2 ? (
				<ExecuteRecovery method={props.method} />
			) : null}
			<Divider mt="30px" borderColor={"white.400"}></Divider>
		</Box>
	);
};

export default MethodHeader;
