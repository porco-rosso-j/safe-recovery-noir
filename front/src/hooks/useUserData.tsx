import { useState } from "react";
import { Signer } from "ethers";
import Safe from "@safe-global/protocol-kit";

const useUserData = () => {
	const [safeAddress, setSafeAddress] = useState<string | null>("");
	const [safeSDK, setSafeSDK] = useState<Safe | null>(null);
	const [signer, setSigner] = useState<Signer | null>(null);
	const [pluginAddress, setPluginAddress] = useState<string | null>("");
	const [isPluinEnabled, setIsPluginEnabled] = useState<boolean>(false);
	const [currentOwner, setCurrentOwner] = useState<string>("");

	const saveSafeAddress = (
		_safeAddress: string,
		storeLocalStorage?: boolean
	) => {
		setSafeAddress(_safeAddress);
		if (storeLocalStorage) {
			localStorage.setItem(`safe_address`, JSON.stringify(_safeAddress));
		}
	};

	const removeSafeAddress = () => {
		localStorage.removeItem(`safe_address`);
		setSafeAddress("");
	};

	const saveSafeSDK = (_safeSDK: any) => {
		setSafeSDK(_safeSDK);
	};

	const saveSigner = (_signer: Signer) => {
		setSigner(_signer);
	};

	const savePluginAdddress = (_plugin: string) => {
		setPluginAddress(_plugin);
	};

	const saveIsPluginEnabled = (_isEnabled: boolean) => {
		setIsPluginEnabled(_isEnabled);
	};

	const saveCurrentOwner = (_currentOwner: string) => {
		setCurrentOwner(_currentOwner);
	};

	const logout = () => {
		removeSafeAddress();
		saveSafeSDK(null);
		saveSigner(null);
	};

	return {
		safeAddress,
		safeSDK,
		signer,
		pluginAddress,
		isPluinEnabled,
		currentOwner,
		saveSafeAddress,
		saveSafeSDK,
		saveSigner,
		savePluginAdddress,
		saveIsPluginEnabled,
		saveCurrentOwner,
		logout,
	};
};

export default useUserData;
