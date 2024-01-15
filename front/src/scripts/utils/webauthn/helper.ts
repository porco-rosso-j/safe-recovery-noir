// import { utils } from "@passwordless-id/webauthn";
import {
	AuthenticateOptions,
	AuthenticationEncoded,
	AuthType,
	NamedAlgo,
	NumAlgo,
	RegisterOptions,
	RegistrationEncoded,
} from "./types";
import * as ethers from "ethers";

export function randomChallenge() {
	return crypto.randomUUID();
}

export function toBuffer(txt: string): ArrayBuffer {
	return Uint8Array.from(txt, (c) => c.charCodeAt(0)).buffer;
}

export function parseBuffer(buffer: ArrayBuffer): string {
	return String.fromCharCode(...new Uint8Array(buffer));
}

export function isBase64url(txt: string): boolean {
	return txt.match(/^[a-zA-Z0-9\-_]+=*$/) !== null;
}

export function toBase64url(buffer: ArrayBuffer): string {
	const txt = btoa(parseBuffer(buffer)); // base64
	return txt.replaceAll("+", "-").replaceAll("/", "_");
}

export function parseBase64url(txt: string): ArrayBuffer {
	txt = txt.replaceAll("-", "+").replaceAll("_", "/"); // base64url -> base64
	return toBuffer(atob(txt));
}

export async function sha256(buffer: ArrayBuffer): Promise<ArrayBuffer> {
	return await crypto.subtle.digest("SHA-256", buffer);
}

export function concatenateBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer) {
	var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
	tmp.set(new Uint8Array(buffer1), 0);
	tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
	return tmp;
}

export const data = {
	challenge: randomChallenge(),
	registerOptions: {
		authenticatorType: "auto",
		userVerification: "required",
		timeout: 0,
		attestation: false,
	} as RegisterOptions,
	authOptions: {
		authenticatorType: "auto",
		userVerification: "required",
		timeout: 0,
	} as AuthenticateOptions,
	algorithm: "ES256",
};

function derToRS(der: Buffer): Buffer[] {
	var offset: number = 3;
	var dataOffset;

	if (der[offset] == 0x21) {
		dataOffset = offset + 2;
	} else {
		dataOffset = offset + 1;
	}
	const r = der.slice(dataOffset, dataOffset + 32);
	offset = offset + der[offset] + 1 + 1;
	if (der[offset] == 0x21) {
		dataOffset = offset + 2;
	} else {
		dataOffset = offset + 1;
	}
	const s = der.slice(dataOffset, dataOffset + 32);
	return [r, s];
}

export function bufferFromBase64(value: string): Buffer {
	return Buffer.from(value, "base64");
}

export function bufferToHex(buffer: ArrayBufferLike): string {
	return "0x".concat(
		[...new Uint8Array(buffer)]
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("")
	);
}

async function getKey(pubkey: ArrayBufferLike) {
	const algoParams = {
		name: "ECDSA",
		namedCurve: "P-256",
		hash: "SHA-256",
	};
	return await crypto.subtle.importKey("spki", pubkey, algoParams, true, [
		"verify",
	]);
}

export async function getCordinates(pubkey: string): Promise<any> {
	const pubKeyBuffer = bufferFromBase64(pubkey as string);
	const rawPubkey = await crypto.subtle.exportKey(
		"jwk",
		await getKey(pubKeyBuffer)
	);
	const { x, y } = rawPubkey;

	const xBuffer = bufferFromBase64(x);
	const yBuffer = bufferFromBase64(y);

	// const pubkeyHex = ethers.BigNumber.from(
	// 	bufferToHex(Buffer.concat([xBuffer, yBuffer]))
	// );
	const pubkeyHex = [bufferToHex(xBuffer), bufferToHex(yBuffer)];
	console.log("pubkeyHex: ", pubkeyHex);
	// console.log("y: ", yBuffer);

	// const uint8ArrayPubkey = new Uint8Array(concatenateBuffers(xBuffer, yBuffer));
	const uint8ArrayPubkey = concatenateBuffers(xBuffer, yBuffer);
	console.log("uint8ArrayPubkey: ", uint8ArrayPubkey);

	let pubkeyBytes32Array: string[] = [];
	let i = 0;
	for (i; i < uint8ArrayPubkey.length; i++) {
		pubkeyBytes32Array[i] = ethers.zeroPadValue(
			`0x${uint8ArrayPubkey[i].toString(16).padStart(2, "0")}`,
			32
		);
	}
	//console.log("pubkeyBytes32Array: ", pubkeyBytes32Array);

	return [pubkeyBytes32Array, pubkeyHex];
}

export async function getSignature(_signature) {
	const signatureParsed = derToRS(bufferFromBase64(_signature));

	console.log(
		"bufferToHex(signatureParsed[0]): ",
		bufferToHex(signatureParsed[0])
	);
	console.log(
		"bufferToHex(signatureParsed[1]): ",
		bufferToHex(signatureParsed[1])
	);
	console.log(
		"bufferToHex(signatureParsed[1]): ",
		bufferToHex(signatureParsed[1]).slice(2)
	);

	const signature =
		bufferToHex(signatureParsed[0]) + bufferToHex(signatureParsed[1]).slice(2);
	return signature;
}
