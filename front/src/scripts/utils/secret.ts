import { parseUint8ArrayToStrArray } from "./parser";
import { pedersenHash } from "./pedersen";

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

	const hash = await pedersenHash(secretBytes32Array);
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

	const _hash = await pedersenHash(secretBytes32Array);
	console.log("hash: ", _hash);
	return { secretBytes: secretBytes32Array, hash: _hash };
}
