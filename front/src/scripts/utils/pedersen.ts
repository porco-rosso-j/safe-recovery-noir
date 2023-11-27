import { Barretenberg, Fr } from "@aztec/bb.js";
// import { cpus } from "os";

export async function pedersenHash(inputs: string[]): Promise<string> {
	const bb: Barretenberg = await Barretenberg.new(8);
	const inputArray: Fr[] = inputs.map((str) => Fr.fromString(str));
	return (await bb.pedersenHashWithHashIndex(inputArray, 0)).toString();
}
