import { useContext } from "react";
import { txResult } from "src/scripts/types";
import { useSafe } from "../index";
import { ContractDataContext, UserDataContext } from "src/contexts/contextData";
import { pluginIface } from "src/scripts/utils/contracts";

const useRemoveRecover = () => {
	const { pluginAddress } = useContext(UserDataContext);
	const { sendSafeTx } = useSafe();

	const methodToSelector = [
		"removeEcrecoverRecover",
		"removeWebAuthnRecover",
		"removeSecretRecover",
		"removeSocialRecover",
	];

	async function _removeRecover(method: number): Promise<txResult> {
		const removeRecoverTx = pluginIface.encodeFunctionData(
			methodToSelector[method - 1]
		);

		const safeTxData = {
			to: pluginAddress,
			data: removeRecoverTx,
			value: "0",
		};

		return await sendSafeTx([safeTxData]);
	}
	return { _removeRecover };
};

export default useRemoveRecover;
