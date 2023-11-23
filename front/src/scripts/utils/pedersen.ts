import { Barretenberg, Fr } from "@aztec/bb.js";
// import { cpus } from "os";

export async function pedersenHash(inputs: string[]): Promise<string> {
	const inputArray: Fr[] = inputs.map((str) => Fr.fromString(str));
	// const bb: Barretenberg = await Barretenberg.new(cpus().length);
	const bb: Barretenberg = await Barretenberg.new(8);
	return (await bb.pedersenHash(inputArray, 0)).toString();
}
