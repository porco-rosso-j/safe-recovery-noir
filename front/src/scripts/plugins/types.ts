export type ProposalType = {
	id: number;
	type: number;
	newOwners: string[];
	oldOwners: string[];
	threshold: number;
	timeLockEnd: number;
	proposedTimestamp: number;
	rejected: boolean;
	approvals: number;
	approvealThreshold: number;
	isExecutable: IsRecoveryExecutableType;
};

export const emptyProposal: ProposalType = {
	id: 0,
	type: 0,
	newOwners: [""],
	oldOwners: [""],
	threshold: 0,
	timeLockEnd: 0,
	proposedTimestamp: 0,
	rejected: false,
	approvals: 0,
	approvealThreshold: 0,
	isExecutable: { result: false, reason: "" },
};

export type IsRecoveryExecutableType = {
	result: boolean;
	reason: string;
};

export type txResult = {
	result: boolean;
	txHash: string;
};

export const empTxResult = {
	result: false,
	txHash: "",
};

export const error: txResult = { result: false, txHash: "" };
