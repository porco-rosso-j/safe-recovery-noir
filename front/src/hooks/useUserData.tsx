import { useEffect, useState } from "react";
import { Signer, ZeroAddress } from "ethers";
import Safe from "@safe-global/protocol-kit";
import {
	getIsPluginEnabled,
	getSafeOwner,
	getSafePluginAddress,
} from "src/scripts/utils/safe";

const useUserData = () => {
	const [safeAddress, setSafeAddress] = useState<string | null>("");
	const [pluginAddress, setPluginAddress] = useState<string | null>("");
	const [currentOwner, setCurrentOwner] = useState<string>("");

	const [safeSDK, setSafeSDK] = useState<Safe | null>(null);
	const [signer, setSigner] = useState<Signer | null>(null);
	const [isPluginEnabled, setIsPluginEnabled] = useState<boolean>(false);

	// in case browser storage is still present
	useEffect(() => {
		(async () => {
			const safe_address = localStorage.getItem(`safe_address`);
			setSafeAddress(safe_address ? JSON.parse(safe_address) : "");

			const plugin_address = localStorage.getItem(`plugin_address`);
			setPluginAddress(plugin_address ? JSON.parse(plugin_address) : "");

			const current_owner = localStorage.getItem(`current_owner`);
			setCurrentOwner(current_owner ? JSON.parse(current_owner) : "");
		})();
	});

	// in case not
	useEffect(() => {
		(async () => {
			if (safeAddress !== "" && pluginAddress === "") {
				try {
					const PluginAddr = await getSafePluginAddress(safeAddress);
					if (PluginAddr !== ZeroAddress) {
						savePluginAddress(PluginAddr, true);
					}
				} catch (e) {
					console.log(e);
				}
			}
		})();
	});

	useEffect(() => {
		(async () => {
			// if (safeAddress !== "" && currentOwner === "") {
			if (safeAddress !== "") {
				try {
					const owner = await getSafeOwner(safeAddress);
					saveCurrentOwner(owner, true);
				} catch (e) {
					console.log(e);
				}
			}
		})();
	});

	useEffect(() => {
		(async () => {
			if (safeAddress !== "" && pluginAddress !== "" && !isPluginEnabled) {
				const _isPluginEnabled = await getIsPluginEnabled(
					safeAddress,
					pluginAddress
				);
				if (_isPluginEnabled) {
					setIsPluginEnabled(_isPluginEnabled);
				}
			}
		})();
	});

	const saveSafeAddress = (
		_safeAddress: string,
		storeLocalStorage?: boolean
	) => {
		setSafeAddress(_safeAddress);
		if (storeLocalStorage) {
			localStorage.setItem(`safe_address`, JSON.stringify(_safeAddress));
		}
	};

	const savePluginAddress = (
		_pluginAddress: string,
		storeLocalStorage?: boolean
	) => {
		setPluginAddress(_pluginAddress);
		if (storeLocalStorage) {
			localStorage.setItem(`plugin_address`, JSON.stringify(_pluginAddress));
		}
	};

	const saveCurrentOwner = (
		_currentOwner: string,
		storeLocalStorage?: boolean
	) => {
		setCurrentOwner(_currentOwner);
		if (storeLocalStorage) {
			localStorage.setItem(`current_owner`, JSON.stringify(_currentOwner));
		}
	};

	const removeSafeAddress = () => {
		localStorage.removeItem(`safe_address`);
		setSafeAddress("");
	};

	const removePluginAddress = () => {
		localStorage.removeItem(`plugin_address`);
		setPluginAddress("");
	};

	const removeCurrentOwner = () => {
		localStorage.removeItem(`current_owner`);
		setCurrentOwner("");
	};

	const saveSafeSDK = (_safeSDK: any) => {
		setSafeSDK(_safeSDK);
	};

	const saveSigner = (_signer: Signer) => {
		setSigner(_signer);
	};

	const logout = () => {
		removeSafeAddress();
		removePluginAddress();
		removeCurrentOwner();
		saveSafeSDK(null);
		saveSigner(null);
		setIsPluginEnabled(false);
	};

	return {
		safeAddress,
		safeSDK,
		signer,
		pluginAddress,
		isPluginEnabled,
		currentOwner,
		saveSafeAddress,
		saveSafeSDK,
		saveSigner,
		savePluginAddress,
		saveCurrentOwner,
		logout,
	};
};

export default useUserData;
