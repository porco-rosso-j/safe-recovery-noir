import { ethers, Signer, utils } from "ethers";
import { contracts } from "./constants/addresses";
import RecoveryPlugin from "./artifacts/contracts/RecoveryPluginNoir.json";
import { pedersen, pedersen_new } from "./utils/pedersen";
import { sendSafeTx } from "./safe";
import { getKeyPairAndID } from "./webauthn-utils";
import { getMerkleRootFromAddresses } from "./merkle";
import Safe from "@safe-global/protocol-kit";
import { privatekeys } from "./constants/addresses";
import { arrayify } from "ethers/lib/utils";
import { generateProofK256, parseUint8ArrayToBytes32 } from "./noir/proof";
import { Noir } from "@noir-lang/noir_js";

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const plugin = new ethers.Contract(
	contracts.recoveryPlugin,
	RecoveryPlugin.abi,
	provider
);
// const delay = daysToMilliseconds(45);
const delay = 10; // 10 sec

export async function _isMethodEnabled(moduleId: number): Promise<boolean> {
	let ret;
	if (moduleId === 1) {
		ret = await plugin.isEcrecoverRecoverEnabled();
	} else if (moduleId === 2) {
		ret = await plugin.isWebAuthnRecoverEnabled();
	} else if (moduleId === 3) {
		ret = await plugin.isSecretRecoverEnabled();
	} else if (moduleId === 4) {
		ret = await plugin.isSocialRecoverEnabled();
	} else {
		return false;
	}
	return ret;
}

export async function _addEcrecoverRecover(
	safeSDK: any,
	address: string
): Promise<string> {
	// hash in circuit should also be pedersen
	const hashedAddr = await pedersen_new([address], 1);
	console.log("hashedAddr: ", hashedAddr);

	const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
	const addK256RecoverTx = pluginIface.encodeFunctionData(
		"addEcrecoverRecover",
		[delay, hashedAddr]
	);

	const safeTxData = {
		to: contracts.recoveryPlugin,
		data: addK256RecoverTx,
		value: "0",
	};

	await sendSafeTx(safeSDK, safeTxData);
	return address;
}

// costs about 1.6m gas
export async function _addWebAuthnRecover(safeSDK: Safe) {
	const safeAddr = await safeSDK.getAddress();
	const res = await getKeyPairAndID(safeAddr);

	console.log("res.id: ", res.id);
	console.log("res.pubkey: ", res.pubkey);

	const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
	const addRecoveryData = pluginIface.encodeFunctionData("addWebAuthnRecover", [
		delay,
		res.pubkey,
		res.id,
	]);

	const safeTxData = {
		to: contracts.recoveryPlugin,
		data: addRecoveryData,
		value: "0",
	};

	await sendSafeTx(safeSDK, safeTxData);
}

function daysToMilliseconds(days) {
	return days * 24 * 60 * 60 * 1000;
}

export async function _addSecretRecover(safeSDK: any, secret: string) {
	// hash in circuit should also be pedersen
	const hashedSecret = await ethers.utils.keccak256(Buffer.from(secret));

	const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
	const addSecreRecoverTx = pluginIface.encodeFunctionData("addSecretRecover", [
		delay,
		hashedSecret,
	]);

	const safeTxData = {
		to: contracts.recoveryPlugin,
		data: addSecreRecoverTx,
		value: "0",
	};

	await sendSafeTx(safeSDK, safeTxData);
}

export async function _addSocialRecover(
	safeSDK: any,
	threshold: number,
	guardians: string[]
) {
	console.log("guardians: ", guardians);

	// hash in circuit should also be pedersen
	const merkleRoot = await getMerkleRootFromAddresses(guardians);

	const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
	const addSocialRecoverTx = pluginIface.encodeFunctionData(
		"addSocialRecover",
		[delay, threshold, merkleRoot]
	);

	const safeTxData = {
		to: contracts.recoveryPlugin,
		data: addSocialRecoverTx,
		value: "0",
	};

	await sendSafeTx(safeSDK, safeTxData);
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
		arrayify(pubkey).slice(1, 65),
		arrayify(signature).slice(0, -1),
		arrayify(msgHash)
	);

	//console.log("proof: ", ret.proof);
	//console.log("publicInputs: ", ret.publicInputs);
	//console.log("*pubInputMsgHash: ", ret.publicInputs.slice(1, 33));

	// create proof
	// eth-call func

	const plugin = new ethers.Contract(
		contracts.recoveryPlugin,
		RecoveryPlugin.abi,
		signer
	);

	const pubInputMsgHash = await parseUint8ArrayToBytes32(arrayify(msgHash));
	console.log("pubInputMsgHash: ", pubInputMsgHash);

	const txResponse = await (
		await plugin.proposeEcrecoverRecover(
			[oldOwner],
			[newOwner],
			newThreshold,
			//ret.proof,
			ret,
			pubInputMsgHash,
			//ret.publicInputs.slice(1, 33),
			{ gasLimit: 2000000 }
		)
	).wait();

	console.log("txResponse: ", txResponse);

	//const result = await Noir.

	/*
           recoveryPlugin.proposeEcrecoverRecover(
            ownersReplaced,
            newPendingOwners,
            1, // 2 -> 1
            proof,
            convertUint8ToBytes32(hashed_message1) //  bytes32[] memory _message
        );
    */

	// testing purpose to increase block.timestamp
	await signer.sendTransaction({ to: await signer.getAddress() });

	return newOwner;
}

export async function _executeRecover(
	signer: Signer,
	proposalId: number
): Promise<boolean> {
	const plugin = new ethers.Contract(
		contracts.recoveryPlugin,
		RecoveryPlugin.abi,
		signer
	);

	const tx = await plugin.execRecovery(proposalId, { gasLimit: 500000 });
	await tx.wait();

	return true;
}

export async function getNewOwnerForPoposal(
	proposalId: number
): Promise<string> {
	const res = await plugin.getPendingNewOwners(proposalId);
	console.log("res: ", res);

	//plugin.
	return res[0];
}

export async function _getIsRecoveryExecutable(
	//signer: Signer,
	proposalId: number
): Promise<boolean> {
	return await plugin.getIsRecoveryExecutable(proposalId);

	// this func also takes into account that
	// previous swap execution may invalidates this one
}

export async function getHashedAddr(): Promise<string> {
	return await plugin.hashed_address();
}

export async function getRecoveryCount(): Promise<number> {
	return plugin.recoveryCount();
}

// async function test(msgHash: string, v, r, s) {
// 	const signature = Buffer.concat(
// 		[exports.setLength(r, 32), exports.setLength(s, 32)],
// 		64
// 	);
// 	const recovery = v - 27;
// 	if (recovery !== 0 && recovery !== 1) {
// 		throw new Error("Invalid signature v value");
// 	}
// 	const senderPubKey = ethers.utils.computePublicKey()(
// 		msgHash,
// 		signature,
// 		recovery
// 	);
// 	return secp256k1.publicKeyConvert(senderPubKey, false).slice(1);
// }
