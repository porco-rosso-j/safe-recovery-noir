import { useContext, useState, useEffect } from "react";
import UserDataContext from "src/contexts/userData";
import { _isMethodEnabled } from "../scripts/plugins/index";

const useIsMethodEnabled = (methodIndex: number) => {
	const { pluginAddress, isPluginEnabled } = useContext(UserDataContext);
	const [isMethodEnabled, setIsMethodEnabled] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			if (isPluginEnabled) {
				const isEnabled = await _isMethodEnabled(methodIndex, pluginAddress);
				console.log("methodIndex: ", methodIndex);
				console.log("isEnabled: ", isEnabled);
				if (isEnabled) {
					setIsMethodEnabled(isEnabled);
				} else {
					setIsMethodEnabled(false);
				}
			}
		})();
	});

	return { isMethodEnabled };
};

export default useIsMethodEnabled;
