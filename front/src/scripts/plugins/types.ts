export type Proposal = {
	id: number;
	type: number;
	newOwners: string[];
	oldOwners: string[];
	threshold: number;
	deadline: number;
	rejected: boolean;
	approvals: number;
	isExecutable: boolean;
};
