import Safe from "@safe-global/protocol-kit";
import { sendSafeTx } from "../utils/safe";
import { contracts } from "../constants/addresses";
import { pluginIface } from "../utils/contracts";

const methodToSelector = [
	"removeEcrecoverRecover",
	"removeWebAuthnRecover",
	"removeSecretRecover",
	"removeSocialRecover",
];

export async function _removeRecover(safeSDK: Safe, method: number) {
	const removeRecoverTx = pluginIface.encodeFunctionData(
		methodToSelector[method - 1]
	);

	const safeTxData = {
		to: contracts.recoveryPlugin,
		data: removeRecoverTx,
		value: "0",
	};

	await sendSafeTx(safeSDK, safeTxData);
}
