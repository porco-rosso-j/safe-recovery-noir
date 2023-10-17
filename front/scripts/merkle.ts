
//@ts-ignore
//import {MerkleTree} from "./utils/MerkleTree";
import { Fr } from '@aztec/bb.js';
import { MerkleTree } from "./utils/MerkleTree.ts";
import merkle from './merkle.json' assert { type:'json'};
import { pedersen, pedersen3 } from './pedersen.ts';

async function main() {
    let merkleTree = new MerkleTree(2);
    await merkleTree.initialize([]);

   let i = 0;
   let hashed_node = []
   for (i; i < merkle.length;) {
    const leaf = await Fr.fromString(merkle[i]);
    hashed_node.push(await pedersen(leaf.toString(), "0"))
    await merkleTree.insert(await Fr.fromString(hashed_node[i]));
    i = i + 1;
   }

  console.log("hashed_node: ", hashed_node)

  const index = merkleTree.getIndex(Fr.fromString(hashed_node[0]))

    const proof = merkleTree.proof(index)
    console.log("root: ", proof.root.toString())
    console.log("leaf: ", proof.leaf.toString())
    console.log("path 0: ", proof.pathElements[0].toString())
    console.log("path 1: ", proof.pathElements[1].toString())
    console.log("path 2: ", proof.pathElements[2]!.toString())

  // let i = 0;
  // for (i; i < merkle.length;) {
  //  const leaf = await Fr.fromString(merkle[i]);
  //  await merkleTree.insert(leaf);
  //  i = i + 1;
  // }

  // const proof = merkleTree.proof(0)
  // console.log("proof: ", proof.leaf.toString())
    const nullifierHash = await pedersen3(proof.leaf.toString(), "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0")
    console.log("nullifierHash: ", nullifierHash.toString())
}

main()