import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Noir, ProofData } from "@noir-lang/noir_js";
import { CompiledCircuit } from "@noir-lang/types";
import { k256, p256, secret, social } from "../artifacts/circuits/index";
import { getSecretBytesAndHashFromSecret } from "../utils/secret";
import { parseUint8ArrayToStrArray } from "./helper";

export async function generateProofK256(
	hashedAddress: string,
	pubkey: Uint8Array,
	signature: Uint8Array,
	msgHash: Uint8Array
): Promise<ProofData> {
	const program = k256 as CompiledCircuit;
	const backend = new BarretenbergBackend(program);
	const noir = new Noir(program, backend);

	const pubkeyBytes32Array = await parseUint8ArrayToStrArray(pubkey);
	console.log("pubkeyBytes32Array: ", pubkeyBytes32Array);

	const signatureBytes32Array = await parseUint8ArrayToStrArray(signature);
	console.log("signatureBytes32Array: ", signatureBytes32Array);

	const msgHashBytes32Array = await parseUint8ArrayToStrArray(msgHash);
	console.log("msgHashBytes32Array: ", msgHashBytes32Array);

	const input = {
		hashedAddr: hashedAddress,
		pub_key: pubkeyBytes32Array,
		signature: signatureBytes32Array,
		hashed_message: msgHashBytes32Array,
	};

	console.log("input: ", input);

	try {
		const proof: ProofData = await noir.generateFinalProof(input);
		console.log("proof: ", proof);
		console.log("proof: ", proof.publicInputs);
		return proof;
	} catch (e) {
		console.log("proof generation failed: ", e);
	}

	// const result = await noir.verifyFinalProof(proof);
	// console.log("result: ", result);
}

export async function generateProofP256(
	signature: Uint8Array, // BigNumber
	pubkey_x: Uint8Array, // bytes32[]
	pubkey_y: Uint8Array, // bytes32[],
	message: Uint8Array // bytes32
): Promise<ProofData> {
	const program = p256 as CompiledCircuit;
	const backend = new BarretenbergBackend(program);
	const noir = new Noir(program, backend);

	const pubkeyXBytes32Array = await parseUint8ArrayToStrArray(pubkey_x);
	console.log("pubkeyXBytes32Array: ", pubkeyXBytes32Array);

	const pubkeyYBytes32Array = await parseUint8ArrayToStrArray(pubkey_y);
	console.log("pubkeyYBytes32Array: ", pubkeyYBytes32Array);

	const signatureBytes32Array = await parseUint8ArrayToStrArray(signature);
	console.log("signatureBytes32Array: ", signatureBytes32Array);

	const msgHashBytes32Array = await parseUint8ArrayToStrArray(message);
	console.log("msgHashBytes32Array: ", msgHashBytes32Array);

	const input = {
		pub_key_x: pubkeyXBytes32Array,
		pub_key_y: pubkeyYBytes32Array,
		signature: signatureBytes32Array,
		message: msgHashBytes32Array,
	};

	console.log("input: ", input);
	try {
		const proof: ProofData = await noir.generateFinalProof(input);
		console.log("proof: ", proof);
		console.log("proof: ", proof.publicInputs);
		// const result = await noir.verifyFinalProof(proof);
		// console.log("result: ", result);
		return proof;
	} catch (e) {
		console.log("proof generation failed: ", e);
	}
}

export async function generateProofSecret(_secret: string): Promise<ProofData> {
	const program = secret as CompiledCircuit;
	const backend = new BarretenbergBackend(program);
	const noir = new Noir(program, backend);

	const { secretBytes, hash } = await getSecretBytesAndHashFromSecret(_secret);
	const input = {
		preimage: secretBytes,
		hash: hash,
	};

	console.log("input: ", input);

	const proof: ProofData = await noir.generateFinalProof(input);
	console.log("proof: ", proof);

	return proof;
}

export async function generateProofSocial(
	root: string,
	nullHash: string,
	proposalId: string,
	pubkey: Uint8Array,
	signature: Uint8Array,
	msgHash: Uint8Array,
	index: string,
	hashPath: string[]
): Promise<ProofData> {
	const program = social as CompiledCircuit;
	const backend = new BarretenbergBackend(program);
	const noir = new Noir(program, backend);

	const pubkeyBytes32Array = await parseUint8ArrayToStrArray(pubkey);
	console.log("pubkeyBytes32Array: ", pubkeyBytes32Array);

	const signatureBytes32Array = await parseUint8ArrayToStrArray(signature);
	console.log("signatureBytes32Array: ", signatureBytes32Array);

	const msgHashBytes32Array = await parseUint8ArrayToStrArray(msgHash);
	console.log("msgHashBytes32Array: ", msgHashBytes32Array);

	const input = {
		root: root,
		proposal_id: proposalId,
		nullifierHash: nullHash,
		hashed_message: msgHashBytes32Array,
		pub_key: pubkeyBytes32Array,
		signature: signatureBytes32Array,
		index: index,
		hash_path: hashPath,
	};

	console.log("input: ", input);
	const ret = await noir.execute(input);
	console.log("ret: ", ret);

	const proof: ProofData = await noir.generateFinalProof(input);
	console.log("proof: ", proof);

	// const result = await noir.verifyFinalProof(proof);
	// console.log("result: ", result);

	return proof;
}

// const dummyProof = (): ProofData => {
// 	const dummy: ProofData = {
// 		proof: new Uint8Array(new Date().valueOf() % 1000),
// 		publicInputs: [new Uint8Array(0)],
// 	};
// 	return dummy;
// };
