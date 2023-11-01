import { parseUint8ArrayToStrArray } from "../noir/proof";
import pedersen from "../artifacts/circuits/pedersen_new.json";
import { CompiledCircuit } from "@noir-lang/types";
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";

export async function getHashFromSecret(_secret: string): Promise<string> {
	const textEncoder = new TextEncoder();
	const secretBytes = textEncoder.encode(_secret);
	console.log("secretBytes: ", secretBytes);

	let secretBytes32Array = await parseUint8ArrayToStrArray(secretBytes);
	console.log("secretBytes32Array: ", secretBytes32Array);
	const length = secretBytes32Array.length;
	const lengthComplement = 10 - length;
	for (let i = 0; i < lengthComplement; i++) {
		secretBytes32Array[length + i] = "0";
	}

	const hash = await pedersenSecret(secretBytes32Array, length);
	console.log("hash: ", hash);
	return hash;
}

type SecretBytesAndHash = {
	secretBytes: string[];
	hash: string;
};

export async function getSecretBytesAndHashFromSecret(
	_secret: string
): Promise<SecretBytesAndHash> {
	const textEncoder = new TextEncoder();
	const secretBytes = textEncoder.encode(_secret);
	console.log("secretBytes: ", secretBytes);

	let secretBytes32Array = await parseUint8ArrayToStrArray(secretBytes);
	console.log("secretBytes32Array: ", secretBytes32Array);
	const length = secretBytes32Array.length;
	const lengthComplement = 10 - length;
	for (let i = 0; i < lengthComplement; i++) {
		secretBytes32Array[length + i] = "0";
	}

	const _hash = await pedersenSecret(secretBytes32Array, length);
	console.log("hash: ", _hash);
	return { secretBytes: secretBytes32Array, hash: _hash };
}

async function pedersenSecret(
	secretBytes: string[],
	_length: number
): Promise<string> {
	const program = pedersen as CompiledCircuit;
	const backend = new BarretenbergBackend(program);
	const noir = new Noir(program, backend);

	const inputs = {
		input: secretBytes,
		length: _length.toString(),
	};

	const { returnValue } = await noir.execute(inputs);
	return returnValue.toString();
}
