const ethers = require('ethers');
const SafeWebAuthnFacAbi = require('../src/abi/SafeWebAuthnFac.json');
const SafeAbi = require('../src/abi/Safe.json');
const addresses = require('../src/utils/addresses.json');

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
const relayer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider)

const safeAddr = "0x786458FBFa964E34e417F305EDa3dbC02cA7a13D"
async function getPubkeys() {
    const safeModuleFac = new ethers.Contract(addresses.safeWebAuthnFac, SafeWebAuthnFacAbi, relayer);

    const [a, b, c] = await safeModuleFac.getModuleUserData(safeAddr)
    console.log("a: ", a)
    console.log("x: ", b[0])
    console.log("y: ", b[1])
    console.log("c: ", c)

}

async function getOwner() {
    const safe = new ethers.Contract(safeAddr, SafeAbi, relayer);
    const owners = await safe.getOwners()
    console.log("owners: ", owners)

}

// getPubkeys();
getOwner();