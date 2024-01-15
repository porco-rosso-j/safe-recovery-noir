import { useContext, useState } from "react";
import UserDataContext from "src/contexts/userData";
import {
	_addEcrecoverRecover,
	_addSocialRecover,
	_addSecretRecover,
	_addWebAuthnRecover,
} from "../scripts/plugins/index";
import { empTxResult, txResult } from "src/scripts/plugins/types";

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
			ret = await _addEcrecoverRecover(
				safeSDK,
				pluginAddress,
				params.pendingNewOwner,
				BigInt(timeLock)
			);
		} else if (methodIndex === 2) {
			ret = await _addWebAuthnRecover(safeSDK, pluginAddress, BigInt(timeLock));
		} else if (methodIndex === 3) {
			ret = await _addSecretRecover(
				safeSDK,
				pluginAddress,
				BigInt(timeLock),
				params.secretWord
			);
		} else if (methodIndex === 4) {
			ret = await _addSocialRecover(
				safeSDK,
				pluginAddress,
				BigInt(timeLock),
				BigInt(params.threshold),
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
