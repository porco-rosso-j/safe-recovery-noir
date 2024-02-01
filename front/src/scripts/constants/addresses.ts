import dep from "./addresses.json";

const deployedContracts = {
	registry: "0x1192aB954Db4E18f5B13741cB5f54fA7562ba280",
	factory: "0xF604ecAE99f1C5A7abF9afFf0A86982c239989B1",
	manager: "0xb935B5BEB95Bdb2B2452503743E2c41a3F6e87b8",
};

const isLOCAL = process.env.REACT_APP_ENV === "LOCAL";

// deployed contract addresses
export const contracts = {
	safeProtocolRegistry: isLOCAL ? dep.contracts[0] : deployedContracts.registry,
	recoveryPluginFac: isLOCAL ? dep.contracts[1] : deployedContracts.factory,
	safeProotcolManager: isLOCAL ? dep.contracts[2] : deployedContracts.manager,
};

// addresses for local test
export const addresses = [
	"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
	"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
	"0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
	"0x90F79bf6EB2c4f870365E785982E1f101E93b906",
];

// pks for local test
export const privatekeys = [
	"0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
	"0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
	"0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
	"0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
];
