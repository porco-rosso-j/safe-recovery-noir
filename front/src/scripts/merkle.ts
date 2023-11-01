import { pedersen_new, getMerkleTree } from "./utils/pedersen";

export async function getMerkleRootFromAddresses(
	addresses: string[]
): Promise<string> {
	let i = 0;
	let hashed_node = [];
	for (i; i < addresses.length; ) {
		hashed_node.push(await pedersen_new([addresses[i], "0"], 2));
		i = i + 1;
	}

	const tree = await getMerkleTree(hashed_node);
	console.log("tree.root: ", tree.root);
	// store it in local storage. this is only in test. ipfs/arweave in prod
	localStorage.setItem(`${tree.root}`, JSON.stringify(tree.hashed_nodes0));

	const storedData = localStorage.getItem(`${tree.root}`);
	const nodes = storedData ? JSON.parse(storedData) : [];
	console.log("nodes: ", nodes);

	return tree.root;
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
	const leaf = await pedersen_new([address, "0"], 2);
	console.log("root: ", root);
	const storedData = localStorage.getItem(`${root}`);
	const nodes = storedData ? JSON.parse(storedData) : [];
	console.log("nodes: ", nodes);

	//let hashed_node = [];
	let index;
	for (let i = 0; i < nodes.length; i++) {
		//hashed_node.push(await pedersen_new([nodes[i], "0"], 2));
		if (nodes[i] === leaf) {
			index = i;
		}
	}

	console.log("index: ", index);

	let hash_path = [];
	let siblingIndex;
	if (index % 2 === 0) {
		siblingIndex = index + 1;
	} else {
		siblingIndex = index - 1;
	}

	console.log("siblingIndex: ", siblingIndex);

	const tree = await getMerkleTree(nodes);

	hash_path[0] = tree.hashed_nodes0[siblingIndex];
	hash_path[1] = index >= 2 ? tree.hashed_nodes1[0] : tree.hashed_nodes1[1];
	console.log("hash_path: ", hash_path);

	const nullifierHash = await pedersen_new(
		[nodes[index], address, proposal_id],
		3
	);

	return { index: index, nullHash: nullifierHash, hashPath: hash_path };
}

/*
// nargo 0.16.0 (git version hash: 4646a93f5e95604b5710353764b2c4295efaef6b, is dirty: true)

async function main(index: number) {
	let i = 0;
	let hashed_node = [];
	for (i; i < addresses.length; ) {
		hashed_node.push(await pedersen(addresses[i], "0"));
		i = i + 1;
	}

	console.log("hashed_node: ", hashed_node);
	const tree = await getMerkleTree(hashed_node);
	console.log("root: ", tree.root);

	let hash_path = [];
	let siblingIndex;
	if (index % 2 == 0) {
		siblingIndex = index + 1;
	} else {
		siblingIndex = index - 1;
	}

	hash_path[0] = tree.hashed_nodes0[siblingIndex];
	hash_path[1] = index >= 2 ? tree.hashed_nodes1[0] : tree.hashed_nodes1[1];
	console.log("hash_path: ", hash_path);

	const nullifierHash = await pedersen3(
		hashed_node[index],
		addresses[index],
		"0"
	);
	console.log("nullifierHash: ", nullifierHash.toString());
}

//main(1);

*/
