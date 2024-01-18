import { useContext, useState } from "react";
import { empTxResult, error, txResult } from "src/scripts/types";
import { getMerkleRootFromAddresses } from "src/scripts/utils/merkle/merkle-helper";
import { pedersenHash } from "src/scripts/utils/pedersen";
import { getKeyPairAndID } from "src/scripts/utils/webauthn/webauthn";
import { getHashFromSecret } from "src/scripts/utils/secret";
import { useSafe } from "../index";
import { ContractDataContext, UserDataContext } from "src/contexts/contextData";
import { pluginIface } from "src/scripts/utils/contracts";

type UseAddRecoverType = {
	methodIndex: number;
	timeLock: number;
	pendingNewOwner?: string;
	secretWord?: string;
	threshold?: number;
	guardians?: string[];
};

const useAddRecover = (onOpen: () => void) => {
	const { safeSDK, pluginAddress } = useContext(UserDataContext);
	const { sendSafeTx } = useSafe();

	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [txHash, setTxHash] = useState<string>("");
	const [result, setResult] = useState<boolean>(false);

	async function addRecover(params: UseAddRecoverType) {
		const methodIndex = params.methodIndex;
		const timeLock = params.timeLock;

		setErrorMessage("");
		setLoading(true);

		let ret: txResult = empTxResult;
		if (methodIndex === 1) {
			ret = await _addEcrecoverRecover(params.pendingNewOwner, timeLock);
		} else if (methodIndex === 2) {
			console.log("addWebAuthnRecover: ");
			ret = await _addWebAuthnRecover(timeLock);
		} else if (methodIndex === 3) {
			ret = await _addSecretRecover(timeLock, params.secretWord);
		} else if (methodIndex === 4) {
			ret = await _addSocialRecover(
				timeLock,
				params.threshold,
				params.guardians
			);
		}

		console.log("ret: ", ret);
		if (ret.result) {
			setResult(true);
		} else if (!ret.result && ret.txHash === "") {
			console.log("ret.result: ", ret.result);
			setErrorMessage("Something went wrong");
			setLoading(false);
			return;
		}
		setTxHash(ret.txHash);
		onOpen();
		setLoading(false);
	}

	async function _addEcrecoverRecover(
		address: string,
		timelock: number = 1
	): Promise<txResult> {
		const hashedAddr = await pedersenHash([address]);
		console.log("hashedAddr: ", hashedAddr);

		const addK256RecoverTx = pluginIface.encodeFunctionData(
			"addEcrecoverRecover",
			[timelock, hashedAddr]
		);

		const safeTxData = {
			to: pluginAddress,
			data: addK256RecoverTx,
			value: "0",
		};

		return await sendSafeTx([safeTxData]);
	}

	// costs about 1.6m gas
	async function _addWebAuthnRecover(timelock: number = 1): Promise<txResult> {
		const safeAddr = await safeSDK.getAddress();

		let res;
		try {
			res = await getKeyPairAndID(safeAddr);
		} catch (e) {
			console.log("res: ", res);
			return error;
		}

		console.log("res.id: ", res.id);
		console.log("res.pubkey: ", res.pubkeyHex);

		const addRecoveryData = pluginIface.encodeFunctionData(
			"addWebAuthnRecover",
			[timelock, res.pubkeyHex[0], res.pubkeyHex[1], res.id]
		);

		const safeTxData = {
			to: pluginAddress,
			data: addRecoveryData,
			value: "0",
		};

		console.log("safeTxData: ", safeTxData);

		return await sendSafeTx([safeTxData]);
	}

	async function _addSecretRecover(
		timelock: number = 1,
		secret: string
	): Promise<txResult> {
		// hash in circuit should also be pedersen
		const hashedSecret = await getHashFromSecret(secret);
		console.log("hashedSecret: ", hashedSecret);

		// const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi);
		const addSecreRecoverTx = pluginIface.encodeFunctionData(
			"addSecretRecover",
			[timelock, hashedSecret]
		);

		const safeTxData = {
			to: pluginAddress,
			data: addSecreRecoverTx,
			value: "0",
		};

		return await sendSafeTx([safeTxData]);
	}

	async function _addSocialRecover(
		timelock: number = 1,
		threshold: number,
		guardians: string[]
	): Promise<txResult> {
		console.log("guardians: ", guardians);

		// hash in circuit should also be pedersen
		const merkleRoot = await getMerkleRootFromAddresses(guardians);
		const addSocialRecoverTx = pluginIface.encodeFunctionData(
			"addSocialRecover",
			[timelock, threshold, merkleRoot]
		);

		const safeTxData = {
			to: pluginAddress,
			data: addSocialRecoverTx,
			value: "0",
		};

		return await sendSafeTx([safeTxData]);
	}

	return {
		loading,
		errorMessage,
		txHash,
		result,
		setErrorMessage,
		addRecover,
	};
};

export default useAddRecover;
