import { utils } from "ethers";
export async function parseUint8ArrayToStrArray(
	value: Uint8Array
): Promise<string[]> {
	let array: string[] = [];
	for (let i = 0; i < value.length; i++) {
		array[i] = value[i].toString();
	}
	return array;
}

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
