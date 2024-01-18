import { useContext, useState, useEffect } from "react";
import { useViewContract } from "./index";
import { UserDataContext } from "src/contexts/contextData";

const useIsMethodEnabled = (methodIndex: number) => {
	const { isPluginEnabled, pluginAddress } = useContext(UserDataContext);
	const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false);
	const { _isMethodEnabled } = useViewContract();
	console.log("isMethodEnabled: ", isMethodEnabled);
	console.log("methodIndex: ", methodIndex);

	useEffect(() => {
		(async () => {
			if (isPluginEnabled && pluginAddress !== "") {
				const isEnabled = await _isMethodEnabled(methodIndex);
				if (isEnabled) {
					setIsMethodEnabled(isEnabled);
				} else {
					setIsMethodEnabled(false);
				}
			}
		})();
	});

	const handleUpdate = (enabled: boolean) => {
		setIsMethodEnabled(enabled);
	};

	return { isMethodEnabled, handleUpdate };
};

export default useIsMethodEnabled;
