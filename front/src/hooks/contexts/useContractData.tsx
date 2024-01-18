/* eslint-disable @typescript-eslint/no-use-before-define */
import { useContext, useState } from "react";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";
import { chainIds, contracts } from "src/scripts/constants";
import { UserDataContext } from "src/contexts/contextData";

type ContractAddresses = {
	registry: string;
	factory: string;
	manager: string;
};

const useContractData = () => {
	const { chainId } = useWeb3ModalAccount();
	const [managerAddr, setManagerAddr] = useState<string | null>("");
	const [registryAddr, setRegistryAddr] = useState<string | null>("");
	const [pluginFacAddr, setPluginFacAddr] = useState<string | null>("");

	console.log("chainId: ", chainId);

	// get addresses from browser storage
	// in case browser storage is still present
	useState(() => {
		(async () => {
			console.log("managerAddr uf: ", managerAddr);
			if (managerAddr === "" && registryAddr === "" && pluginFacAddr === "") {
				const factory_address = localStorage.getItem(`factory_address`);
				setPluginFacAddr(factory_address ? JSON.parse(factory_address) : "");
				const manager_address = localStorage.getItem(`manager_address`);
				setManagerAddr(manager_address ? JSON.parse(manager_address) : "");
				const registry_address = localStorage.getItem(`registry_address`);
				setRegistryAddr(registry_address ? JSON.parse(registry_address) : "");
				console.log("factory_address: ", factory_address);
				console.log("manager_address: ", manager_address);
				console.log("registry_address: ", registry_address);

				// if (factory_address && manager_address && registry_address) {
				// 	console.log("local str set>: ");

				// }
			}
		})();
	});

	// store addresses to browser storage
	useState(() => {
		console.log("chainId: ", chainId);
		if (chainId !== null) {
			let contractAddresses: ContractAddresses = null;
			console.log("hainIds.goerl: ", chainIds.goerli);
			console.log("contracts.goerli.factory: ", contracts.goerli.factory);
			if (chainId === chainIds.goerli) {
				contractAddresses = {
					factory: contracts.goerli.factory,
					registry: contracts.goerli.registry,
					manager: contracts.goerli.manager,
				};
				console.log("goerli?.: ", contractAddresses);
			} else if (chainId === chainIds.sepolia) {
				contractAddresses = contracts.sepolia;
			} else if (chainId === chainIds.local) {
				contractAddresses = contracts.local;
			}

			console.log("contractAddrs insdie: ", contractAddresses);

			if (contractAddresses !== null) {
				localStorage.setItem(
					`factory_address`,
					JSON.stringify(contractAddresses.factory)
				);
				localStorage.setItem(
					`manager_address`,
					JSON.stringify(contractAddresses.manager)
				);
				localStorage.setItem(
					`registry_address`,
					JSON.stringify(contractAddresses.registry)
				);

				setPluginFacAddr(contractAddresses.factory);
				setManagerAddr(contractAddresses.manager);
				setRegistryAddr(contractAddresses.registry);
			}
		}
	});

	const logoutContract = () => {
		setPluginFacAddr("");
		setManagerAddr("");
		setRegistryAddr("");

		localStorage.removeItem(`factory_address`);
		localStorage.removeItem(`manager_address`);
		localStorage.removeItem(`registry_address`);
	};

	return {
		managerAddr,
		registryAddr,
		pluginFacAddr,
		logoutContract,
	};
};

export default useContractData;
