import Safe from "@safe-global/protocol-kit";
import { recoveryPluginContract } from "../utils/contracts";
import { IsRecoveryExecutableType, ProposalType } from "./types";
import { ethers } from "ethers";

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

	return res[0];
}

export async function _getIsRecoveryExecutable(
	pluginAddr: string,
	proposalId: number
): Promise<IsRecoveryExecutableType> {
	try {
		const ret = await recoveryPluginContract(
			pluginAddr
		).getIsRecoveryExecutable(proposalId);

		console.log("_getIsRecoveryExecutable: ", ret);
		return {
			result: true,
			reason: "",
		} as IsRecoveryExecutableType;
	} catch (error) {
		// if (error.code === ethers.errors.CALL_EXCEPTION) {
		if (ethers.isCallException(error)) {
			console.log("Revert reason:", error.reason);
			return {
				result: false,
				reason: error.reason,
			} as IsRecoveryExecutableType;
		} else {
			console.error("Error:", error);
			return {
				result: false,
				reason: error,
			} as IsRecoveryExecutableType;
		}
	}
}

export async function getProposals(
	pluginAddr: string
): Promise<ProposalType[]> {
	const count = await getRecoveryCount(pluginAddr);
	console.log("count: ", count);
	let proposals: ProposalType[] = [];
	for (let i = 1; i <= Number(count); i++) {
		proposals[i] = await getProposal(i, pluginAddr);
	}
	return proposals;
}

export async function getProposal(
	proposalId: number,
	pluginAddr: string
): Promise<ProposalType> {
	const res = await recoveryPluginContract(pluginAddr).getRecoveryByProposalId(
		proposalId
	);
	console.log("res: ", res);

	const _isExecutable = await _getIsRecoveryExecutable(pluginAddr, proposalId);
	console.log("_isExecutable: ", _isExecutable);

	let _approvealThreshold = 0;
	if (res[0] === 3n) {
		_approvealThreshold = await getSocialRecoveryThreshold(pluginAddr);
	}

	const proposal: ProposalType = {
		id: Number(proposalId),
		type: Number(res[0]) + 1,
		newOwners: res[1],
		oldOwners: res[2],
		threshold: Number(res[3]),
		timeLockEnd: Number(res[4]),
		proposedTimestamp: Number(res[5]),
		status: Number(res[6]),
		approvals: Number(res[7]),
		approvealThreshold: Number(_approvealThreshold),
		isExecutable: _isExecutable,
	};
	console.log("proposal: ", proposal);

	return proposal;
}

export async function getProposalCount(pluginAddr: string): Promise<string> {
	return await recoveryPluginContract(pluginAddr).proposalCount();
}

export async function getHashedAddr(pluginAddr: string): Promise<string> {
	return await recoveryPluginContract(pluginAddr).hashed_address();
}

export async function getHashededSecret(pluginAddr: string): Promise<string> {
	return await recoveryPluginContract(pluginAddr).hashed_secret();
}

export async function getRecoveryCount(pluginAddr: string): Promise<number> {
	return Number(await recoveryPluginContract(pluginAddr).recoveryCount());
}

export async function getCredentialID(pluginAddr: string): Promise<string> {
	return await recoveryPluginContract(pluginAddr).credentialId();
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

export async function recoveryTimeLock(pluginAddr: string): Promise<number> {
	return Number(await recoveryPluginContract(pluginAddr).recoveryTimeLock());
}

export async function getSocialRecoveryThreshold(
	pluginAddr: string
): Promise<number> {
	return await recoveryPluginContract(pluginAddr).approvalThreshold();
}
