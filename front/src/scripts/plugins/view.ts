import { recoveryPlugin } from "../utils/contracts";
import { Proposal } from "./types";

export async function _isMethodEnabled(moduleId: number): Promise<boolean> {
	let ret;
	if (moduleId === 1) {
		ret = await recoveryPlugin.isEcrecoverRecoverEnabled();
	} else if (moduleId === 2) {
		ret = await recoveryPlugin.isWebAuthnRecoverEnabled();
	} else if (moduleId === 3) {
		ret = await recoveryPlugin.isSecretRecoverEnabled();
	} else if (moduleId === 4) {
		ret = await recoveryPlugin.isSocialRecoverEnabled();
	} else {
		return false;
	}
	return ret;
}

export async function getNewOwnerForPoposal(
	proposalId: number
): Promise<string> {
	const res = await recoveryPlugin.getPendingNewOwners(proposalId);
	console.log("res: ", res);

	//recoveryPlugin.
	return res[0];
}

export async function _getIsRecoveryExecutable(
	//signer: Signer,
	proposalId: number
): Promise<boolean> {
	try {
		const ret = await recoveryPlugin.getIsRecoveryExecutable(proposalId);
		return ret;
	} catch (e) {
		return false;
	}

	// this func also takes into account that
	// previous swap execution may invalidates this one
}

export async function getProposals(): Promise<Proposal[]> {
	const count = await getRecoveryCount();
	console.log("count: ", count);
	let proposals: Proposal[] = [];
	for (let i = 0; i < count; i++) {
		console.log("i: ", i);
		const res = await recoveryPlugin.getRecoveryByProposalId(i + 1);
		// console.log("res: ", res);
		console.log("res: ", res);

		const _isExecutable = await _getIsRecoveryExecutable(i + 1);
		console.log("_isExecutable: ", _isExecutable);

		const proposal: Proposal = {
			id: i + 1,
			type: Number(res[0] + 1),
			newOwners: res[1],
			oldOwners: res[2],
			threshold: Number(res[3]),
			deadline: Number(res[4]),
			rejected: res[5],
			approvals: Number(res[6]),
			isExecutable: _isExecutable,
		};
		console.log("proposal: ", proposal);

		proposals[i + 1] = proposal;
	}
	console.log("proposals: ", proposals.length);

	return proposals;
}
export async function getHashedAddr(): Promise<string> {
	return await recoveryPlugin.hashed_address();
}

export async function getRecoveryCount(): Promise<number> {
	return recoveryPlugin.recoveryCount();
}

export async function getCredentialID(): Promise<string> {
	return recoveryPlugin.credentialId();
}

export async function getWebAuthnPubkey(): Promise<any> {
	const pubkey = await recoveryPlugin.getPubkeyXY();
	console.log("pubkey: ", pubkey);
	return pubkey;
}

export async function computeMessage(webAuthnInputs: any): Promise<string> {
	return await recoveryPlugin._computeMessage(webAuthnInputs);
}

export async function getGuardiansRoot(): Promise<string> {
	return await recoveryPlugin.guardiansRoot();
}

export async function getSocialRecoveryThreshold(): Promise<number> {
	return Number(await recoveryPlugin.threshold());
	// return 2;
}
