import { parseUint8ArrayToBytes32 } from "./helper";
import { pedersenHash } from "./pedersen";

export async function getHashFromSecret(_secret: string): Promise<string> {
	const PaddedSecretBytes = await getPaddedSecretBytes(_secret);

	const hash = await pedersenHash(PaddedSecretBytes);
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
	const PaddedSecretBytes = await getPaddedSecretBytes(_secret);
	console.log("PaddedSecretBytes: ", PaddedSecretBytes);

	const _hash = await pedersenHash(PaddedSecretBytes);
	console.log("hash: ", _hash);
	return { secretBytes: PaddedSecretBytes, hash: _hash };
}

async function getPaddedSecretBytes(_secret: string): Promise<string[]> {
	const textEncoder = new TextEncoder();
	const secretBytes = textEncoder.encode(_secret);
	console.log("secretBytes: ", secretBytes);

	let secretBytes32Array = await parseUint8ArrayToBytes32(secretBytes);
	console.log("secretBytes32Array: ", secretBytes32Array);
	const length = secretBytes.length;
	const lengthComplement = 10 - length;
	for (let i = 0; i < lengthComplement; i++) {
		secretBytes32Array[length + i] = "0x0";
	}

	return secretBytes32Array;
}
