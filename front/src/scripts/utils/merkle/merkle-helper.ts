import { Fr } from "@aztec/bb.js";
import { MerkleTree } from "./merkle";
import { pedersenHash } from "../pedersen";

export async function getMerkleRootFromAddresses(
	addresses: string[]
): Promise<string> {
	const depth = await calculateDepth(addresses.length);
	let merkleTree = new MerkleTree(depth);

	// const tree = await getMerkleTree(hashed_node);
	await merkleTree.initialize(addresses.map((addr) => Fr.fromString(addr)));
	const root = merkleTree.root.toString();
	console.log("root: ", root);

	// store it in local storage. this is only in test. ipfs/arweave in prod
	localStorage.setItem(
		`${merkleTree.root.toString()}`,
		JSON.stringify(merkleTree.getLeaves())
	);

	const storedData = localStorage.getItem(`${root}`);
	const nodes = storedData ? JSON.parse(storedData) : [];
	console.log("nodes: ", nodes);

	return root;
}

export function calculateDepth(numLeaves: number): number {
	return Math.ceil(Math.log2(numLeaves));
}

type NullifierHashAndHashPath = {
	index: number;
	nullHash: string;
	hashPath: string[];
};

export async function getNullifierHashAndHashPath(
	root: string,
	address: string,
	proposal_id: string
): Promise<NullifierHashAndHashPath> {
	const leaf = await pedersenHash([address]);
	console.log("root: ", root);
	const storedData = localStorage.getItem(`${root}`);
	const nodes = storedData ? JSON.parse(storedData) : [];
	console.log("nodes: ", nodes);

	let index;
	for (let i = 0; i < nodes.length; i++) {
		if (nodes[i] === leaf) {
			index = i;
		}
	}

	let nodesFr: Fr[] = [];
	for (let i = 0; i < nodes.length; i++) {
		nodesFr.push(Fr.fromString(nodes[i]));
	}

	let merkleTree: MerkleTree;
	const depth = calculateDepth(nodes.length);
	merkleTree = new MerkleTree(depth);
	await merkleTree.initializeFromRootAndLeaves(Fr.fromString(root), nodesFr);

	let hash_path: string[] = [];
	const { pathElements } = await merkleTree.proof(index);
	for (let i = 0; i < pathElements.length; i++) {
		hash_path.push(pathElements[i].toString());
	}

	const nullifierHash = await pedersenHash([
		nodes[index],
		address,
		proposal_id,
	]);

	return { index: index, nullHash: nullifierHash, hashPath: hash_path };
}
