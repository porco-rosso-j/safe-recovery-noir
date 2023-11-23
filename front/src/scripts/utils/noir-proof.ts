import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";
import { CompiledCircuit } from "@noir-lang/types";
import { k256, p256, secret, social } from "../artifacts/circuits/index";
import { getSecretBytesAndHashFromSecret } from "../utils/secret";
import { parseUint8ArrayToStrArray } from "./parser";

export async function generateProofK256(
	hashedAddress: string,
	pubkey: Uint8Array,
	signature: Uint8Array,
	msgHash: Uint8Array
): Promise<any> {
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

	// const proof: ProofData = await noir.generateFinalProof(input);
	// console.log("proof: ", proof);
	const proof = Buffer.from("0x");
	// // const { witness } = await noir.execute(input);
	// // const proof = await backend.generateFinalProof(witness);

	// const result = await noir.verifyFinalProof(proof);
	// console.log("result: ", result);

	return proof;
}

export async function generateProofP256(
	// webauthnInputs: any, // string
	signature: Uint8Array, // BigNumber
	pubkey_x: Uint8Array, // bytes32[]
	pubkey_y: Uint8Array, // bytes32[],
	message: Uint8Array // bytes32
): Promise<any> {
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

	// const proof: ProofData = await noir.generateFinalProof(input);
	// console.log("proof: ", proof);
	const proof = Buffer.from("0x");
	// // const { witness } = await noir.execute(input);
	// // const proof = await backend.generateFinalProof(witness);

	// const result = await noir.verifyFinalProof(proof);
	// console.log("result: ", result);

	return proof;
}

export async function generateProofSecret(_secret: string): Promise<any> {
	const program = secret as CompiledCircuit;
	const backend = new BarretenbergBackend(program);
	const noir = new Noir(program, backend);

	const { secretBytes, hash } = await getSecretBytesAndHashFromSecret(_secret);
	const input = {
		preimage: secretBytes,
		hash: hash,
	};

	console.log("input: ", input);

	// const proof: ProofData = await noir.generateFinalProof(input);
	// console.log("proof: ", proof);
	const proof = Buffer.from("0x");
	// // const { witness } = await noir.execute(input);
	// // const proof = await backend.generateFinalProof(witness);

	// const result = await noir.verifyFinalProof(proof);
	// console.log("result: ", result);

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
): Promise<any> {
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

	// const proof: ProofData = await noir.generateFinalProof(input);
	// console.log("proof: ", proof);
	const proof = Buffer.from("0x");
	// // const { witness } = await noir.execute(input);
	// // const proof = await backend.generateFinalProof(witness);

	// const result = await noir.verifyFinalProof(proof);
	// console.log("result: ", result);

	return proof;
}
