import Safe from "@safe-global/protocol-kit";
import { recoveryPluginContract } from "../utils/contracts";
import { Proposal } from "./types";

export async function _isSafeModuleEnabled(
	safeSDK: Safe,
	address: string
): Promise<boolean> {
	return await safeSDK.isModuleEnabled(address);
}

export async function _isMethodEnabled(
	moduleId: number,
	pluginAddr: string
): Promise<boolean> {
	let ret;
	if (moduleId === 1) {
		ret = await recoveryPluginContract(pluginAddr).isEcrecoverRecoverEnabled();
	} else if (moduleId === 2) {
		ret = await recoveryPluginContract(pluginAddr).isWebAuthnRecoverEnabled();
	} else if (moduleId === 3) {
		ret = await recoveryPluginContract(pluginAddr).isSecretRecoverEnabled();
	} else if (moduleId === 4) {
		ret = await recoveryPluginContract(pluginAddr).isSocialRecoverEnabled();
	} else {
		return false;
	}
	return ret;
}

export async function getNewOwnerForPoposal(
	proposalId: number,
	pluginAddr: string
): Promise<string> {
	const res = await recoveryPluginContract(pluginAddr).getPendingNewOwners(
		proposalId
	);
	console.log("res: ", res);

	//recoveryPlugin.
	return res[0];
}

export async function _getIsRecoveryExecutable(
	//signer: Signer,
	pluginAddr: string,
	proposalId: number
): Promise<boolean> {
	try {
		const ret = await recoveryPluginContract(
			pluginAddr
		).getIsRecoveryExecutable(proposalId);
		return ret;
	} catch (e) {
		return false;
	}

	// this func also takes into account that
	// previous swap execution may invalidates this one
}

export async function getProposals(pluginAddr: string): Promise<Proposal[]> {
	const count = await getRecoveryCount(pluginAddr);
	console.log("count: ", count);
	let proposals: Proposal[] = [];
	for (let i = 0; i < count; i++) {
		console.log("i: ", i);
		const res = await recoveryPluginContract(
			pluginAddr
		).getRecoveryByProposalId(i + 1);
		// console.log("res: ", res);
		console.log("res: ", res);

		const _isExecutable = await _getIsRecoveryExecutable(pluginAddr, i + 1);
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
export async function getHashedAddr(pluginAddr: string): Promise<string> {
	return await recoveryPluginContract(pluginAddr).hashed_address();
}

export async function getRecoveryCount(pluginAddr: string): Promise<number> {
	return recoveryPluginContract(pluginAddr).recoveryCount();
}

export async function getCredentialID(pluginAddr: string): Promise<string> {
	return recoveryPluginContract(pluginAddr).credentialId();
}

export async function getWebAuthnPubkey(pluginAddr: string): Promise<any> {
	const pubkey = await recoveryPluginContract(pluginAddr).getPubkeyXY();
	console.log("pubkey: ", pubkey);
	return pubkey;
}

export async function computeMessage(
	webAuthnInputs: any,
	pluginAddr: string
): Promise<string> {
	return await recoveryPluginContract(pluginAddr)._computeMessage(
		webAuthnInputs
	);
}

export async function getGuardiansRoot(pluginAddr: string): Promise<string> {
	return await recoveryPluginContract(pluginAddr).guardiansRoot();
}

export async function getSocialRecoveryThreshold(
	pluginAddr: string
): Promise<number> {
	return Number(await recoveryPluginContract(pluginAddr).threshold());
	// return 2;
}
