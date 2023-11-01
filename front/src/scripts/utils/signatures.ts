import { privatekeys } from "../constants/addresses";
import { Wallet, utils } from "ethers";

async function getArrarifiedInputs(index: number) {
	const wallet = new Wallet(privatekeys[index]);
	console.log("raw pubkey; ", wallet.publicKey);
	const pubkey = wallet.publicKey.slice(4, 132);
	console.log("pubkey array: ", utils.arrayify("0x" + pubkey));

	const hashed_message =
		"0xb1112b0b8beb16eb24b44e7e5e30ad2cf2420e7fdc7a7707ef039b9a7ca26a21";
	const hashed_message_array = utils.arrayify(hashed_message);
	console.log("hashed_message_array: ", hashed_message_array);

	const r =
		"0xfbf85e4650fb0563a9a15c2b385b6ab06df5935291c489e86e097a794072a820";
	const s =
		"0x2d103451cec0f437ac0004a3e56bf96b7592ef4c01a5e895559347b76d946dc7";
	const sig = r.concat(s.slice(2));
	console.log("sig: ", sig);
	const signature = utils.arrayify(sig);
	console.log("signature: ", signature);
}

getArrarifiedInputs(1);
