import { Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const ProposalStatus = (props: {
	loading: boolean;
	methodIndex: number;
	statusIndex: number;
	isApproval?: boolean;
}) => {
	const [statusMsg, setStatusMsg] = useState<string>("");

	console.log("statusMsg: ", statusMsg);

	// status msg
	const requestingSignature = "You will sign a message to generate zk-proof";
	const requestingWebauthn =
		"You need to provide TouchID fingerprint or Yubikey PIN for WebAuthn to generate zk-proof";
	const generatingProof = "Generating proof... it may take 1~2 minutes.";
	const creatingTx = "Sign transaction for broadcasting";
	const sendingTx = "Sending transaction to network...";

	useEffect(() => {
		if (!props.loading || props.isApproval) {
			if (props.methodIndex === 1 || props.methodIndex === 4) {
				setStatusMsg(requestingSignature);
			} else if (!props.loading && props.methodIndex === 2) {
				setStatusMsg(requestingWebauthn);
			}
		}
		if (props.loading) {
			if (props.statusIndex === 1) {
				setStatusMsg(generatingProof);
			} else if (props.statusIndex === 2) {
				setStatusMsg(creatingTx);
			} else if (props.statusIndex === 3) {
				setStatusMsg(sendingTx);
			}
		}
	}, [props.isApproval, props.loading, props.methodIndex, props.statusIndex]);

	return (
		<Text mx={20} fontSize={14} mt={5}>
			{statusMsg}
		</Text>
	);
};

export default ProposalStatus;
