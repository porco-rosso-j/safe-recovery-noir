import dep from "./addresses.json";

export const contracts = {
	local: {
		registry: dep.contracts[0],
		factory: dep.contracts[1],
		manager: dep.contracts[2],
	},
	goerli: {
		registry: "0x5cC391124fB11a56D974FDaf754f07c67908B6bd",
		factory: "0xb2Ee66FeFfbf9e82D2e86bCF08bC96eb567bA880",
		manager: "0xF95639DaAc47f1e1a2E443E7A58b758BDf773AEc",
	},

	sepolia: {
		registry: "0x8D10DB8716D76d061320CC5B074f264b8177e3F9",
		factory: "0x485b9a90CAe4365aa80F62062EF5D1F470fAB442",
		manager: "0x0dD6Ba234FE0193a1075aac539B39baedDDc057A",
	},
};

// forge script script/DeployGoerli.s.sol:Deploy --rpc-url sepolia --broadcast

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
