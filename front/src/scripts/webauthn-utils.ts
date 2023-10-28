import { _proposeRecoveryWebAuthn, getCredentialID } from "./safe";
import { register, authenticate } from "./webauthn/client";
import * as utils from "./webauthn/helper";
import * as ethers from "ethers";

export async function getKeyPairAndID(safeAddr: string): Promise<any> {
	const username = "Safe:" + safeAddr.slice(0, 6);
	let res;

	console.log("utils.data.challenge: ", utils.data.challenge);
	try {
		res = await register(
			username,
			utils.data.challenge,
			utils.data.registerOptions
		);
		console.log(res);
	} catch (e) {
		console.warn(e);
	}
	console.log(res);

	const cordinates = await utils.getCordinates(res?.credential.publicKey);

	return {
		pubkey: cordinates,
		id: res.credential.id.toString(),
	};
}

// export async function changeOwner(
// 	safeAddr,
// 	safeSdk,
// 	pluginAddr,
// 	currentOwner,
// 	pendingNewOwner,
// 	newThreshold
// ) {
// 	const credentialId = await getCredentialID(safeAddr);
// 	let result;
// 	try {
// 		result = await authenticate(
// 			credentialId ? [credentialId] : [],
// 			utils.data.challenge,
// 			utils.data.authOptions
// 		);
// 	} catch (e) {
// 		console.warn(e);
// 	}

// 	console.log("result: ", result);

// 	const [signature, webauthnInputs] = await getWebAuthnInputs(
// 		result?.signature,
// 		result?.authenticatorData,
// 		result?.clientData
// 	);

// 	await _proposeRecoveryWebAuthn(
// 		pluginAddr,
// 		currentOwner,
// 		pendingNewOwner,
// 		newThreshold,
// 		webauthnInputs
// 	);

// 	return safeSdk.getOwners()[0];
// }

async function getWebAuthnInputs(_signature, _authenticatorData, _clientData) {
	const signature = await utils.getSignature(_signature);
	const authenticatorData = utils.bufferFromBase64(_authenticatorData);
	const clientData = utils.bufferFromBase64(_clientData);
	const challengeOffset =
		clientData.indexOf("226368616c6c656e6765223a", 0, "hex") + 12 + 1;
	const challenge = utils.data.challenge;

	console.log("authenticatorData: ", utils.bufferToHex(authenticatorData));
	console.log("clientData: ", utils.bufferToHex(clientData));
	console.log("challengeOffset: ", challengeOffset);
	console.log("challenge: ", challenge);

	const abiCoder = new ethers.utils.AbiCoder();
	const webauthnInputs = abiCoder.encode(
		["bytes", "bytes1", "bytes", "string", "uint"],
		[authenticatorData, 0x05, clientData, challenge, challengeOffset]
	);

	return [signature, ethers.utils.arrayify(webauthnInputs)];
}
