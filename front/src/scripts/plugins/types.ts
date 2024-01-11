export type Proposal = {
	id: number;
	type: number;
	newOwners: string[];
	oldOwners: string[];
	threshold: number;
	deadline: number;
	proposedTimestamp: number;
	rejected: boolean;
	approvals: number;
	isExecutable: boolean;
};

export const emptyProposal = {
	id: 0,
	type: 0,
	newOwners: [""],
	oldOwners: [""],
	threshold: 0,
	deadline: 0,
	proposedTimestamp: 0,
	rejected: false,
	approvals: 0,
	isExecutable: false,
};

export type txResult = {
	result: boolean;
	txHash: string;
};

export const error: txResult = { result: false, txHash: "" };
