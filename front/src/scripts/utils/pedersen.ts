import { Noir } from "@noir-lang/noir_js";
import { CompiledCircuit } from "@noir-lang/types";
// import pedersenCircuit from "../../../circuits/utils/pedersen/target/pedersen.json" assert { type: "json" };
// import pedersen3Circuit from "../../../circuits/utils/pedersen_3/target/pedersen.json" assert { type: "json" };
// import MerkleCircuit from "../../../circuits/utils/merkle/target/merkle.json" assert { type: "json" };
import pedersenCircuit from "../../../../circuits/utils/pedersen/target/pedersen.json";
import pedersen3Circuit from "../../../../circuits/utils/pedersen_3/target/pedersen.json";
import MerkleCircuit from "../../../../circuits/utils/merkle/target/merkle.json";

export async function pedersen(_x: string, _y: string): Promise<string> {
	const program = pedersenCircuit as CompiledCircuit;
	const noir = new Noir(program);

	const inputs = {
		x: _x,
		y: _y,
	};

	const { returnValue } = await noir.execute(inputs);

	//console.log("return: ", returnValue);
	return returnValue.toString();
}

export async function pedersen3(
	_x: string,
	_y: string,
	_z: string
): Promise<string> {
	const program = pedersen3Circuit as CompiledCircuit;
	const noir = new Noir(program);

	const inputs = {
		x: _x,
		y: _y,
		z: _z,
	};

	const { returnValue } = await noir.execute(inputs);
	// console.log("return: ", returnValue);
	return returnValue.toString();
}

export async function merkleRoot(
	_leaf: string,
	_index: string,
	_hash_path: string[]
): Promise<string> {
	const program = MerkleCircuit as CompiledCircuit;
	const noir = new Noir(program);

	const inputs = {
		leaf: _leaf,
		index: _index,
		hash_path: _hash_path,
	};

	const { returnValue } = await noir.execute(inputs);

	console.log("return: ", returnValue);
	return returnValue.toString();
}

type Merkle = {
	root: string;
	hashed_nodes1: string[];
	hashed_nodes0: string[];
};

export async function getMerkleRoot(nodes: string[]): Promise<Merkle> {
	const hash1_0 = await pedersen(nodes[0], nodes[1]);
	const hash1_1 = await pedersen(nodes[2], nodes[3]);
	const root = await pedersen(hash1_0, hash1_1);

	let merkle: Merkle = {
		root: root,
		hashed_nodes1: [hash1_0, hash1_1],
		hashed_nodes0: nodes,
	};

	return merkle;
}

// merkleRoot(
// 	"0x11afe536a3d158d626aabefad9dc7a70ef5f23280d262cd7db5da5bd8d5f87e6",
// 	"0",
// 	[
// 		"0x0653ff335ea4abfee01ea264bc67a3377c587d021a845494fd22cba3ad19596f",
// 		"0x3012a7c05f2d1ecd4e0a857de7fbbae428af4ad5c67ed23657caaa89ec7c090b",
// 	]
// );
// pedersen("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", "0");

// pedersen(
// 	"0x11afe536a3d158d626aabefad9dc7a70ef5f23280d262cd7db5da5bd8d5f87e6",
// 	"0x0653ff335ea4abfee01ea264bc67a3377c587d021a845494fd22cba3ad19596f"
// );
// 0x3012a7c05f2d1ecd4e0a857de7fbbae428af4ad5c67ed23657caaa89ec7c090b

// pedersen(
// 	"0x0ca8da9cb2fb3740faeed71245122d2eed3e94330919cc3d12f5e6374d6f4528",
// 	"0x01e7d1bdfc0f221f1f5fb7d9c3322d17e7cdbac538735126954395e569b4d17b"
// );
// 0x199a33fb7e9e85bded01f24eabac4af5cd53681ffa1df713741a2c93a2e636ab

// pedersen(
// 	"0x199a33fb7e9e85bded01f24eabac4af5cd53681ffa1df713741a2c93a2e636ab",
// 	"0x3012a7c05f2d1ecd4e0a857de7fbbae428af4ad5c67ed23657caaa89ec7c090b"
// );

pedersen(
	"0x3012a7c05f2d1ecd4e0a857de7fbbae428af4ad5c67ed23657caaa89ec7c090b",
	"0x199a33fb7e9e85bded01f24eabac4af5cd53681ffa1df713741a2c93a2e636ab"
);
// 0x2d35f5d629548b5d64dafb3121e721d957d0f3ad0f0cbbfe538828e5acac203e

// pedersen3(
// 	"0x11afe536a3d158d626aabefad9dc7a70ef5f23280d262cd7db5da5bd8d5f87e6",
// 	"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
// 	"0"
// );
// 0x148380388d4098955c15435907dfe0e9135c374660fc3cbaef8b702b87d412a4
