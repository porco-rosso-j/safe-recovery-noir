import { Barretenberg, Fr } from "@aztec/bb.js";
// import { cpus } from "os";

export async function pedersenHash(inputs: string[]): Promise<string> {
	const bb: Barretenberg = await Barretenberg.new();
	const inputArray: Fr[] = inputs.map((str) => Fr.fromString(str));
	console.log("inputArray:] ", inputArray);
	return (await bb.pedersenHashWithHashIndex(inputArray, 0)).toString();
}
