export type ProposalType = {
	id: bigint;
	type: bigint;
	newOwners: string[];
	oldOwners: string[];
	threshold: bigint;
	timeLockEnd: bigint;
	proposedTimestamp: bigint;
	rejected: boolean;
	approvals: bigint;
	approvealThreshold: bigint;
	isExecutable: IsRecoveryExecutableType;
};

export const emptyProposal: ProposalType = {
	id: 0n,
	type: 0n,
	newOwners: [""],
	oldOwners: [""],
	threshold: 0n,
	timeLockEnd: 0n,
	proposedTimestamp: 0n,
	rejected: false,
	approvals: 0n,
	approvealThreshold: 0n,
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
