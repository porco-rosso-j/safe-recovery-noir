import { addresses } from "./addresses.ts";
import { pedersen, pedersen3, getMerkleRoot } from "./utils/pedersen.ts";

// nargo 0.16.0 (git version hash: 4646a93f5e95604b5710353764b2c4295efaef6b, is dirty: true)

async function main(index: number) {
	let i = 0;
	let hashed_node = [];
	for (i; i < addresses.length; ) {
		hashed_node.push(await pedersen(addresses[i], "0"));
		i = i + 1;
	}

	console.log("hashed_node: ", hashed_node);
	const tree = await getMerkleRoot(hashed_node);
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

main(1);
