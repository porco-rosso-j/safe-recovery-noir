import { Fr } from '@aztec/bb.js';
import { MerkleTree } from "./utils/MerkleTree.ts";
import merkle from './merkle.json' assert { type:'json'};
import { pedersen, pedersen3 } from './utils/pedersen.ts';

// nargo 0.16.0 (git version hash: 4646a93f5e95604b5710353764b2c4295efaef6b, is dirty: true)

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

    const nullifierHash = await pedersen3(proof.leaf.toString(), merkle[0], "0")
    console.log("nullifierHash: ", nullifierHash.toString())
}

main()