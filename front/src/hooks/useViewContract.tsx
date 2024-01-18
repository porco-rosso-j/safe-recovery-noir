import { IsRecoveryExecutableType, ProposalType } from "src/scripts/types";
import { Contract, ethers } from "ethers";
import { useContext, useEffect, useState } from "react";
import Safe from "@safe-global/protocol-kit";
import { ContractDataContext, UserDataContext } from "src/contexts/contextData";
import { factory, plugin, manager } from "src/scripts/utils/contracts";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";

const useViewContract = () => {
	const { safeAddress, pluginAddress } = useContext(UserDataContext);
	const { managerAddr, pluginFacAddr } = useContext(ContractDataContext);
	const { chainId } = useWeb3ModalAccount();

	const [recoveryPluginContract, setRecoveryPluginContract] =
		useState<Contract>(null);

	console.log("recoveryPluginContract: ", recoveryPluginContract);

	useEffect(() => {
		if (pluginAddress && chainId) {
			setRecoveryPluginContract(plugin(pluginAddress, chainId));
		}
	}, [pluginAddress, chainId]);

	console.log("pluginAddress: ", pluginAddress);
	async function _isMethodEnabled(moduleId: number): Promise<boolean> {
		let ret;
		if (moduleId === 1) {
			ret = await recoveryPluginContract.isEcrecoverRecoverEnabled();
		} else if (moduleId === 2) {
			ret = await recoveryPluginContract.isWebAuthnRecoverEnabled();
		} else if (moduleId === 3) {
			ret = await recoveryPluginContract.isSecretRecoverEnabled();
		} else if (moduleId === 4) {
			ret = await recoveryPluginContract.isSocialRecoverEnabled();
		} else {
			return false;
		}
		return ret;
	}

	async function getNewOwnerForPoposal(proposalId: number): Promise<string> {
		const res = await recoveryPluginContract.getPendingNewOwners(proposalId);
		console.log("res: ", res);

		return res[0];
	}

	async function _getIsRecoveryExecutable(
		proposalId: number
	): Promise<IsRecoveryExecutableType> {
		try {
			const ret = await recoveryPluginContract.getIsRecoveryExecutable(
				proposalId
			);

			console.log("_getIsRecoveryExecutable: ", ret);
			return {
				result: true,
				reason: "",
			} as IsRecoveryExecutableType;
		} catch (error) {
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

	async function getProposals(): Promise<ProposalType[]> {
		const count = await getRecoveryCount();
		console.log("count: ", count);
		let proposals: ProposalType[] = [];
		for (let i = 1; i <= Number(count); i++) {
			proposals[i] = await getProposal(i);
		}
		return proposals;
	}

	async function getProposal(proposalId: number): Promise<ProposalType> {
		const res = await recoveryPluginContract.getRecoveryByProposalId(
			proposalId
		);
		console.log("res: ", res);

		const _isExecutable = await _getIsRecoveryExecutable(proposalId);
		console.log("_isExecutable: ", _isExecutable);

		let _approvealThreshold = 0;
		if (res[0] === 3) {
			_approvealThreshold = await getSocialRecoveryThreshold();
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

	// async function getProposalCount(): Promise<string> {
	// 	return await recoveryPluginContract.proposalCount();
	// }

	async function getHashedAddr(): Promise<string> {
		return await recoveryPluginContract.hashed_address();
	}

	async function getRecoveryCount(): Promise<number> {
		return recoveryPluginContract.recoveryCount();
	}

	async function getCredentialID(): Promise<string> {
		return recoveryPluginContract.credentialId();
	}

	async function getWebAuthnPubkey(): Promise<any> {
		const pubkey = await recoveryPluginContract.getPubkeyXY();
		console.log("pubkey: ", pubkey);
		return pubkey;
	}

	async function computeMessage(webAuthnInputs: any): Promise<string> {
		return await recoveryPluginContract._computeMessage(webAuthnInputs);
	}

	async function getGuardiansRoot(): Promise<string> {
		return await recoveryPluginContract.guardiansRoot();
	}

	async function getSocialRecoveryThreshold(): Promise<number> {
		return await recoveryPluginContract.approvalThreshold();
	}

	async function getSafePluginAddress(): Promise<string> {
		console.log("!pluginFacAddr ", pluginFacAddr);
		if (pluginFacAddr !== "") {
			try {
				console.log("pluginFacAddr getSafePluginAddress: ", pluginFacAddr);
				const pluginFac = factory(pluginFacAddr, chainId);
				const addr = await pluginFac.getPluginAddr(safeAddress);
				console.log("addr: ", addr);
				return addr;
			} catch (e) {
				console.log("erorr:", e);
				return "";
			}
		}
	}

	async function getIsPluginEnabled(): Promise<boolean> {
		console.log("managerAddr: ", managerAddr);
		if (managerAddr === "") return;
		const managerContract = manager(managerAddr, chainId);

		return await managerContract.isPluginEnabled(safeAddress, pluginAddress);
		// return false;
	}

	async function getSafeOwner(safeSDK: Safe): Promise<string> {
		const owners = await safeSDK.getOwners();
		return owners[0];
	}

	return {
		getProposal,
		getProposals,
		getRecoveryCount,
		getHashedAddr,
		getCredentialID,
		getWebAuthnPubkey,
		computeMessage,
		getGuardiansRoot,
		_isMethodEnabled,
		getNewOwnerForPoposal,
		getSafePluginAddress,
		getIsPluginEnabled,
		getSafeOwner,
	};
};

export default useViewContract;
