import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";
import { CompiledCircuit, ProofData } from "@noir-lang/types";
import k256 from "../artifacts/circuits/k256.json";
import { utils } from "ethers";

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

	const signatureBytes32Array = //(
		await parseUint8ArrayToStrArray(signature);
	//).pop();
	console.log("signatureBytes32Array: ", signatureBytes32Array);

	const msgHashBytes32Array = await parseUint8ArrayToStrArray(msgHash);
	console.log("msgHashBytes32Array: ", msgHashBytes32Array);

	const input = {
		hashedAddr: hashedAddress,
		pub_key: pubkeyBytes32Array,
		signature: signatureBytes32Array,
		hashed_message: msgHashBytes32Array,
		// pub_key: pubkeyBytes32Array,
		// signature: Buffer.from(signature.slice(0, 64)),
		// hashed_message: msgHashBytes32Array,
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

/*
    hashedAddr: pub Field,
    pub_key: [u8; 64], 
    signature: [u8; 64], 
    hashed_message: pub [u8; 32],
*/

// async function parseUint8ArrayToStringArray(value: Uint8Array): Promise<string[]> {
// 	let array: string[] = [];
// 	let i = 0;
// 	for (i; i < value.length; i++) {
// 		array[i] = utils.hexZeroPad(`0x${value[i].toString(16)}`, 32);
// 	}
// 	return array;
// }

export async function parseUint8ArrayToBytes32(
	value: Uint8Array
): Promise<string[]> {
	let array: string[] = [];
	let i = 0;
	for (i; i < value.length; i++) {
		array[i] = utils.hexZeroPad(`0x${value[i].toString(16)}`, 32);
	}
	return array;
}

async function parseUint8ArrayToStrArray(value: Uint8Array): Promise<string[]> {
	let array: string[] = [];
	let i = 0;
	for (i; i < value.length; i++) {
		// array[i] = utils.hexZeroPad(`0x${value[i].toString(16)}`, 32);
		array[i] = value[i].toString();
	}
	return array;
}

async function concatAllInputs(
	hashedAddr: string,
	pubkey: string[],
	signature: string[],
	msgHash: string[]
): Promise<any> {
	let inputArray = new Map<string, string>();
	let total;

	inputArray.set("0", hashedAddr);
	total += 1;

	let i = 0;
	let key;

	for (i; i < 64; i++) {
		key = (total + i).toString();
		inputArray.set(key, pubkey[i]);
	}
	total += 64;

	let j = 0;
	for (j; j < 64; j++) {
		key = (total + j).toString();
		inputArray.set(key, signature[j]);
	}
	total += 64;

	let k = 0;
	for (k; k < 32; k++) {
		key = (total + i).toString();
		inputArray.set(key, msgHash[k]);
	}

	return inputArray;
}
