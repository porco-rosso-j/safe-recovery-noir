
//@ts-ignore
//import {MerkleTree} from "./utils/MerkleTree";
import { Fr } from '@aztec/bb.js';
import { MerkleTree } from "./utils/MerkleTree.ts";
import merkle from './merkle.json' assert { type:'json'};
import * as ethers from "ethers"
// const { Fr } = await import('@aztec/bb.js');
// import {FrType} from "./utils/MerkleTree.js"

// let bb: any;

async function main() {
    let merkleTree = new MerkleTree(3);
    await merkleTree.initialize([]);

   let i = 0;
   let hashed_node = []
   for (i; i < merkle.length;) {
    const leaf = await Fr.fromString(merkle[i]);
    hashed_node.push(await merkleTree.pedersenHash(leaf, Fr.fromString("0")))
    await merkleTree.insert(hashed_node[i]);
    i = i + 1;
   }

  console.log("hashed_node: ", hashed_node)

  const index = merkleTree.getIndex(hashed_node[0])

    const proof = merkleTree.proof(index)
    console.log("root: ", proof.root.toString())
    console.log("leaf: ", proof.leaf.toString())
    console.log("path 0: ", proof.pathElements[0].toString())
    console.log("path 2: ", proof.pathElements[2].toString())

  // let i = 0;
  // for (i; i < merkle.length;) {
  //  const leaf = await Fr.fromString(merkle[i]);
  //  await merkleTree.insert(leaf);
  //  i = i + 1;
  // }

  // const proof = merkleTree.proof(0)
  // console.log("proof: ", proof.leaf.toString())

    const address = Fr.fromString("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
    const leaf = await merkleTree.pedersenHash(address,  Fr.fromString("0"))
    console.log("leaf: ", leaf.toString())

    const _leaf = await merkleTree.pedersenHash(address,  Fr.fromString("0"))
    console.log("_leaf: ", _leaf.toString())

    const nullifierHash = await merkleTree.pedersenHashMultiple([leaf, address, Fr.fromString("0")])
    console.log("nullifierHash: ", nullifierHash.toString())

    const _nullifierHash = await merkleTree.pedersenHashMultiple([leaf, address, Fr.fromString("0")])
    console.log("_nullifierHash: ", _nullifierHash.toString())
}

main()

//import merkle from './merkle.json'

//import * as bb from '@aztec/bb.js'
// import * as bb from '@aztec/bb.js'
// import { Fr } from '@aztec/bb.js'
// import { Fr } from '@aztec/bb.js/dest/node'
//import { Fr } from '@aztec/bb.js/dest/types';
// import { Fr } from '@aztec/bb.js/dest/node/types/index.js';