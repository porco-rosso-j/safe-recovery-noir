// import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
const merkleTree = require("@openzeppelin/merkle-tree");
const pedersen = require('pedersen-fast')
// import fs from "fs";

function main() {
// (1)
const values = [
    // ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"], 
    // ["0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"],
    // ["0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"], 
    // ["0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"]
    ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", "0x0000000000000000000000000000000000000000000000000000000000000000"], 
    ["0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", "0x0000000000000000000000000000000000000000000000000000000000000000"],
    ["0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", "0x0000000000000000000000000000000000000000000000000000000000000000"], 
    ["0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", "0x0000000000000000000000000000000000000000000000000000000000000000"]
    
  ];

// let commitments = [[""], [""], [""], [""]]
// let commitments = []

// let i = 0
// for (i; i < values.length;) {
//     console.log(i)
//     console.log(values[i])
//     commitments[i] = [pedersen.pedersen_from_hex(values[i][0], values[i][1])]
//     //commitments.push( pedersen.pedersen_from_hex(values[i]))
//     console.log(commitments[i])
//     i = i + 1;
// }

  // (2)
  const tree = merkleTree.StandardMerkleTree.of(values, ["bytes32", "bytes32"]);
  
  // (3)
  console.log("tree; ", tree)
  console.log('Merkle Root:', tree.root);
}

main()


