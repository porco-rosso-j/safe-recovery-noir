import { ethers, Signer, utils } from "ethers";
import { authenticateWebAuthn } from "../utils/webauthn/webauthn";
import { getNullifierHashAndHashPath } from "../utils/merkle/merkle-helper";
import {
	generateProofK256,
	generateProofP256,
	generateProofSecret,
	generateProofSocial,
} from "../utils/noir-proof";
import { recoveryPluginSigner } from "../utils/contracts";
import { parseUint8ArrayToBytes32 } from "../utils/parser";
import {
	computeMessage,
	getCredentialID,
	getGuardiansRoot,
	getHashedAddr,
	getRecoveryCount,
	getWebAuthnPubkey,
} from "./view";
import { sleep } from "./utils";

export async function _proposeRecovery(
	method: number,
	signer: Signer,
	newThreshold: number,
	oldOwner: string,
	newOwner: string,
	secret: string,
	safeAddr: string
): Promise<string> {
	if (method === 1) {
		await _proposeEcrecoverRecover(signer, newThreshold, oldOwner, newOwner);
	} else if (method === 2) {
		await _proposeFingerPrintRecover(
			signer,
			newThreshold,
			oldOwner,
			newOwner,
			safeAddr
		);
	} else if (method === 3) {
		await _proposeSecretRecover(
			signer,
			newThreshold,
			oldOwner,
			newOwner,
			secret
		);
	} else if (method === 4) {
		await _proposeSocialRecover(signer, newThreshold, oldOwner, newOwner);
	} else {
		console.log("unrecognized method index");
		return "";
	}

	return newOwner;
}

export async function _proposeEcrecoverRecover(
	signer: Signer,
	newThreshold: number,
	oldOwner: string,
	newOwner: string
): Promise<string> {
	const msg = "k256";
	const signature: string = await signer.signMessage(msg);
	const msgHash: string = ethers.utils.hashMessage(msg);
	const pubkey: string = utils.recoverPublicKey(
		msgHash,
		utils.arrayify(signature)
	);

	const hashedAddr = await getHashedAddr();

	const ret = await generateProofK256(
		hashedAddr,
		utils.arrayify(pubkey).slice(1, 65),
		utils.arrayify(signature).slice(0, -1),
		utils.arrayify(msgHash)
	);

	const pubInputMsgHash = await parseUint8ArrayToBytes32(
		utils.arrayify(msgHash)
	);
	console.log("pubInputMsgHash: ", pubInputMsgHash);

	const txResponse = await (
		await recoveryPluginSigner(signer).proposeEcrecoverRecover(
			[oldOwner],
			[newOwner],
			newThreshold,
			//ret.proof,
			ret,
			pubInputMsgHash,
			{ gasLimit: 2000000 }
		)
	).wait();

	console.log("txResponse: ", txResponse);

	await sleep(10000); // Wait for 10 seconds

	// testing purpose to increase block.timestamp
	await signer.sendTransaction({ to: await signer.getAddress() });

	return newOwner;
}

export async function _proposeFingerPrintRecover(
	signer: Signer,
	newThreshold: number,
	oldOwner: string,
	newOwner: string,
	safeAddr: string
) {
	const credentialId = await getCredentialID();
	const [signature, webauthnInputs] = await authenticateWebAuthn(credentialId);
	const pubkey = await getWebAuthnPubkey();

	console.log("webauthnInputs: ", webauthnInputs);
	console.log("signature: ", signature);

	console.log("pubkey: ", pubkey);

	const message = await computeMessage(webauthnInputs);
	console.log("message: ", message);

	const ret = await generateProofP256(
		utils.arrayify(signature),
		utils.arrayify(pubkey[0]),
		utils.arrayify(pubkey[1]),
		utils.arrayify(message)
	);

	// const pubInputMsgHash = await parseUint8ArrayToBytes32(utils.arrayify(msgHash));
	// console.log("pubInputMsgHash: ", pubInputMsgHash);

	const txResponse = await (
		await recoveryPluginSigner(signer).proposeWebAuthnRecover(
			[oldOwner],
			[newOwner],
			newThreshold,
			ret,
			//ret.proof,
			webauthnInputs,
			{ gasLimit: 2000000 }
		)
	).wait();

	console.log("txResponse: ", txResponse);

	await sleep(10000); // Wait for 10 seconds
	// testing purpose to increase block.timestamp
	await signer.sendTransaction({ to: await signer.getAddress() });

	//return newOwner;
}
export async function _proposeSecretRecover(
	signer: Signer,
	newThreshold: number,
	oldOwner: string,
	newOwner: string,
	secret: string
) {
	console.log("oldOwner: ", oldOwner);
	console.log("newOwner: ", newOwner);
	console.log("newThreshold: ", newThreshold);

	const ret = await generateProofSecret(secret);
	console.log("ret: ", ret);

	const txResponse = await (
		await recoveryPluginSigner(signer).proposeSecretRecover(
			[oldOwner],
			[newOwner],
			newThreshold,
			ret,
			//ret.proof,
			{ gasLimit: 2000000 }
		)
	).wait();

	console.log("txResponse: ", txResponse);

	await sleep(10000); // Wait for 10 seconds
	// testing purpose to increase block.timestamp
	await signer.sendTransaction({ to: await signer.getAddress() });
}

export async function _proposeSocialRecover(
	signer: Signer,
	newThreshold: number,
	oldOwner: string,
	newOwner: string
) {
	const msg = "social_recovery";
	const signature: string = await signer.signMessage(msg);
	const msgHash: string = ethers.utils.hashMessage(msg);
	const pubkey: string = utils.recoverPublicKey(
		msgHash,
		utils.arrayify(signature)
	);

	const proposalId = Number(await getRecoveryCount()) + 1;
	const root = await getGuardiansRoot();

	const { index, nullHash, hashPath } = await getNullifierHashAndHashPath(
		root,
		await signer.getAddress(),
		proposalId.toString()
	);

	const ret = await generateProofSocial(
		root,
		nullHash,
		proposalId.toString(),
		utils.arrayify(pubkey).slice(1, 65),
		utils.arrayify(signature).slice(0, -1),
		utils.arrayify(msgHash),
		index.toString(),
		hashPath
	);

	const pubInputMsgHash = await parseUint8ArrayToBytes32(
		utils.arrayify(msgHash)
	);
	console.log("pubInputMsgHash: ", pubInputMsgHash);

	const txResponse = await (
		await recoveryPluginSigner(signer).proposeSocialRecover(
			[oldOwner],
			[newOwner],
			newThreshold,
			ret,
			//ret.proof,
			nullHash,
			pubInputMsgHash,
			{ gasLimit: 2000000 }
		)
	).wait();

	console.log("txResponse: ", txResponse);

	await sleep(10000); // Wait for 10 seconds
	// testing purpose to increase block.timestamp
	await signer.sendTransaction({ to: await signer.getAddress() });
}

export async function _executeRecover(
	signer: Signer,
	proposalId: number
): Promise<boolean> {
	const tx = await recoveryPluginSigner(signer).execRecovery(proposalId, {
		gasLimit: 500000,
	});
	await tx.wait();

	return true;
}
