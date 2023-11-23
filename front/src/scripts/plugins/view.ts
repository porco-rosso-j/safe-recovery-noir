import { recoveryPlugin } from "../utils/contracts";

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
	return await recoveryPlugin.getIsRecoveryExecutable(proposalId);

	// this func also takes into account that
	// previous swap execution may invalidates this one
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
	// const x = await plugin.getPubkeyXY()[0];
	// const y = await plugin.getPubkeyXY()[1];
	return pubkey;
}

export async function computeMessage(webAuthnInputs: any): Promise<string> {
	return await recoveryPlugin._computeMessage(webAuthnInputs);
}

export async function getGuardiansRoot(): Promise<string> {
	return await recoveryPlugin.guardiansRoot();
}
