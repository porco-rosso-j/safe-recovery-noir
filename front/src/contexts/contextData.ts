import React from "react";

interface ContractDataContextInterface {
	managerAddr: string | null;
	registryAddr: string | null;
	pluginFacAddr: string | null;
	logoutContract: () => void;
}

const ContractDataContext = React.createContext<ContractDataContextInterface>({
	managerAddr: "",
	registryAddr: "",
	pluginFacAddr: "",
	logoutContract: function (): void {
		throw new Error("Function not implemented.");
	},
});
const UserDataContext = React.createContext<any>({});
const PluginDataContext = React.createContext<any>({});

export { ContractDataContext, UserDataContext, PluginDataContext };
