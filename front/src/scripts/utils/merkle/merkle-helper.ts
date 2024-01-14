import { Fr } from "@aztec/bb.js";
import { MerkleTree } from "./merkle";
import { pedersenHash } from "../pedersen";
import { ethers } from "ethers";

export async function getMerkleRootFromAddresses(
	addresses: string[]
): Promise<string> {
	const isOdd = addresses.length % 2 !== 0;
	const depth = calculateDepth(isOdd ? addresses.length + 1 : addresses.length);
	console.log("depth: ", depth);
	let merkleTree = new MerkleTree(depth);

	let hashed_nodes: string[] = [];
	for (let i = 0; i < addresses.length; i++) {
		hashed_nodes.push(await pedersenHash([addresses[i]]));
	}

	if (isOdd) {
		hashed_nodes[hashed_nodes.length] = hashed_nodes[hashed_nodes.length - 1];
	}

	console.log("hashed_nodes: ", hashed_nodes);

	// const tree = await getMerkleTree(hashed_node);
	const mappedAddrs = hashed_nodes.map((nodes) => Fr.fromString(nodes));
	await merkleTree.initialize(mappedAddrs);
	const root = await merkleTree.getRoot();
	console.log("merkleTree: ", merkleTree);
	console.log("root: ", root);
	console.log("leaves: ", await merkleTree.getLeaves());

	// store it in local storage. this is only in test. ipfs/arweave in prod
	localStorage.setItem(`${root}`, JSON.stringify(await merkleTree.getLeaves()));

	const storedData = localStorage.getItem(`${root}`);
	const nodes = storedData ? JSON.parse(storedData) : [];
	console.log("nodes: ", nodes);

	return root;
}

function calculateDepth(numLeaves: number): number {
	return Math.ceil(Math.log2(numLeaves));
}

export type NullifierHashAndHashPath = {
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

	console.log("nodesFr: ", nodesFr);

	let merkleTree: MerkleTree;
	const depth = calculateDepth(nodes.length);
	console.log("depth: ", depth);
	merkleTree = new MerkleTree(depth);
	await merkleTree.initializeFromRootAndLeaves(Fr.fromString(root), nodesFr);
	console.log("merkleTree: ", merkleTree);
	let hash_path: string[] = [];
	const { pathElements } = await merkleTree.proof(index);
	for (let i = 0; i < pathElements.length; i++) {
		hash_path.push(pathElements[i].toString());
	}
	console.log("hash_path: ", hash_path);

	console.log("nodes[index]: ", nodes[index]);
	console.log("proposal_id: ", proposal_id);
	console.log("address: ", address);

	const nullifierHash = await pedersenHash([
		nodes[index],
		address,
		proposal_id,
	]);

	return { index: index, nullHash: nullifierHash, hashPath: hash_path };
}
