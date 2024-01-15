import Safe from "@safe-global/protocol-kit";
import { sendSafeTx } from "../utils/safe";
import { pluginIface } from "../utils/contracts";
import { txResult } from "./types";

const methodToSelector = [
	"removeEcrecoverRecover",
	"removeWebAuthnRecover",
	"removeSecretRecover",
	"removeSocialRecover",
];

export async function _removeRecover(
	safeSDK: Safe,
	pluginAddress: string,
	method: number
): Promise<txResult> {
	const removeRecoverTx = pluginIface.encodeFunctionData(
		methodToSelector[method - 1]
	);

	const safeTxData = {
		to: pluginAddress,
		data: removeRecoverTx,
		value: "0",
	};

	return await sendSafeTx(safeSDK, [safeTxData]);
}
