import { Barretenberg, Fr, } from '@aztec/bb.js';
import { pedersen } from '../pedersen.ts';

    
export interface IMerkleTree {
  root: () => Fr;
  proof: (index: number) => {
    root: Fr;
    pathElements: Fr[];
    pathIndices: number[];
    leaf: Fr;
  };
  insert: (leaf: Fr) => void;
}


//class MerkleTree implements IMerkleTree {
export class MerkleTree implements IMerkleTree {

   readonly zeroValue = Fr.fromString(
      '18d85f3de6dcd78b6ffbf5d8374433a5528d8e3bf2100df0b7bb43a4c59ebd63',
  );

  levels: number;
  storage: Map<string, Fr>;
  zeros: Fr[];
  totalLeaves: number;
  bb: Barretenberg = {} as Barretenberg;

  constructor(levels: number) {
    this.levels = levels;
    this.storage = new Map();
    this.zeros = [];
    this.totalLeaves = 0;
  }

  async initialize(defaultLeaves: Fr[]) {
    this.bb = await Barretenberg.new(4);

    let currentZero = this.zeroValue;
    this.zeros.push(currentZero);

    for (let i = 0; i < this.levels; i++) {
      currentZero = await this.pedersenHash(currentZero, currentZero);
      this.zeros.push(currentZero);
    }
  }

  async pedersenHash(left: Fr, right: Fr):Promise<Fr> {
    const leftStr = left.toString()
    const rightStr = right.toString()
    const hash = await pedersen(leftStr, rightStr)
    return Fr.fromString(hash)
  }

//  pedersenHash(left: Fr, right: Fr):Promise<Fr> {
//     // let hashRes = await this.bb.pedersenPlookupCommit([left, right]);

//     //let hashRes = await this.bb.pedersenCommit([left, right]);

//     let hashRes = this.bb.pedersenHashPair(left, right);
//     // 0x18b1ffb34a0ba5f89f8da47cc506ed77d38e69f0ab8bf9c87c5ba6ad893ee958

//     //let hashRes = await this.bb.pedersenCompressFields(left, right);
//     // 0x2a83c09ac27cb4a0a94d62d15259092d22ca6824e2a4dab9ace5e9855b17b35e

//     //let hashRes = await this.bb.pedersenPlookupCompressFields(left, right);
//     // 0x04dddc7e9aa030bba792370572ef6c22c4b3a5889f84cdb861ab46affedf0579

//     //let hashRes = await this.bb.pedersenCompress([left, right]);
//     // 0x1ae3d0fcfe4bcd56ebcb34a76955771d05d935fe1f7b588f9f47b630ae68eaa6
    
//     return hashRes;
//   }

//   async pedersenHashMultiple(inputs: Fr[]):Promise<Fr> {
//     let hashRes = await this.bb.pedersenHashMultiple(inputs);
//     return hashRes;
//   }

  static indexToKey(level: number, index: number): string {
    return `${level}-${index}`;
  }

  getIndex(leaf: Fr): number {
    for (const [key, value] of this.storage) {
      if (value.toString() === leaf.toString()) {
        return Number(key.split('-')[1]);
      }
    }
    return -1;
  }

  root(): Fr {
    return this.storage.get(MerkleTree.indexToKey(this.levels, 0)) || this.zeros[this.levels];
  }

 proof(indexOfLeaf: number) {
    let pathElements: Fr[] = [];
    let pathIndices: number[] = [];

    const leaf = this.storage.get(MerkleTree.indexToKey(0, indexOfLeaf));
    if (!leaf) throw new Error('leaf not found');

    // store sibling into pathElements and target's indices into pathIndices
    const handleIndex = async (level: number, currentIndex: number, siblingIndex: number) => {
      const siblingValue = this.storage.get(MerkleTree.indexToKey(level, siblingIndex)) || this.zeros[level];
      pathElements.push(siblingValue);
      pathIndices.push(currentIndex % 2);
    };

    this.traverse(indexOfLeaf, handleIndex);

    return {
      root: this.root(),
      pathElements,
      pathIndices,
      leaf: leaf,
    };
  }

 insert(leaf: Fr) {
    const index = this.totalLeaves;
    this.update(index, leaf, true);
    this.totalLeaves++;
  }

  update(index: number, newLeaf: Fr, isInsert: boolean = false) {
    if (!isInsert && index >= this.totalLeaves) {
      throw Error('Use insert method for new elements.');
    } else if (isInsert && index < this.totalLeaves) {
      throw Error('Use update method for existing elements.');
    }

    let keyValueToStore: { key: string; value: Fr }[] = [];
    let currentElement: Fr = newLeaf;

    const handleIndex = async (level: number, currentIndex: number, siblingIndex: number) => {
      const siblingElement =
        this.storage.get(MerkleTree.indexToKey(level, siblingIndex)) || this.zeros[level];

      let left: Fr;
      let right: Fr;
      if (currentIndex % 2 === 0) {
        left = currentElement;
        right = siblingElement;
      } else {
        left = siblingElement;
        right = currentElement;
      }

      keyValueToStore.push({
        key: MerkleTree.indexToKey(level, currentIndex),
        value: currentElement,
      });
      currentElement = await this.pedersenHash(left, right);
    };

    this.traverse(index, handleIndex);

    // push root to the end
    keyValueToStore.push({
      key: MerkleTree.indexToKey(this.levels, 0),
      value: currentElement,
    });

    keyValueToStore.forEach(o => {
      this.storage.set(o.key, o.value);
    });
  }

  // traverse from leaf to root with handler for target node and sibling node
  private traverse(
    indexOfLeaf: number,
    handler: (level: number, currentIndex: number, siblingIndex: number) => void,
  ) {
    let currentIndex = indexOfLeaf;
    for (let i = 0; i < this.levels; i++) {
      let siblingIndex;
      if (currentIndex % 2 === 0) {
        siblingIndex = currentIndex + 1;
      } else {
        siblingIndex = currentIndex - 1;
      }

      handler(i, currentIndex, siblingIndex);
      currentIndex = Math.floor(currentIndex / 2);
    }
  }
}

// module.exports = {
//     // MerkleTree: typeof MerkleTree,
//     MerkleTree
// }

// export default {MerkleTree