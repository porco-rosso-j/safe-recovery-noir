use dep::std;
use dep::ecrecover;

fn main(
  root : pub Field, 
  proposal_id: pub Field,
  nullifierHash: pub Field, 
  hashed_message: pub [u8; 32],
  pub_key: [u8; 64],
  signature: [u8; 64],
  index : Field,
  hash_path : [Field; 2]
) -> pub Field {

  let key = ecrecover::secp256k1::PubKey::from_unified(pub_key);
  let address = ecrecover::ecrecover(key.pub_x, key.pub_y, signature, hashed_message);

  std::println(address);
    
  // Compute input note commitment a.k.a leaf
  let leaf = std::hash::pedersen([address, 0])[0];
   std::println(leaf);

  let computed_root = std::merkle::compute_merkle_root(leaf, index, hash_path);
  std::println(computed_root);
  assert(computed_root == root);
    
  // Compute input note nullifier
  let nullifier = std::hash::pedersen([leaf, address, proposal_id])[0];
  assert(nullifierHash == nullifier);
  std::println(nullifier);

  nullifier
}

#[test]
fn test_main() {
  let root = 0x14ed8e8ef5a31fb0d35bac70e981222631e7724280bdd684561b255822760e85;

  let proposal_id = 0;
  
  let nullifierHash = 0x148380388d4098955c15435907dfe0e9135c374660fc3cbaef8b702b87d412a4;

  let hashed_message = [
      82, 154, 122, 115,   3, 254, 180,   9,
      84,  23,  70,  63, 179, 211,  86,  72,
      32,  88, 133, 119,   7,  93, 100,  22,
      177, 234, 251, 240,  46,  87, 132, 171
  ];

  let pub_key = [
    131,  24,  83,  91,  84,  16, 93,  74, 122, 174,  96,
    192, 143, 196,  95, 150, 135, 24,  27,  79, 223, 198,
    37, 189,  26, 117,  63, 167, 57, 127, 237, 117,  53,
    71, 241,  28, 168, 105, 102, 70, 242, 243, 172, 176,
    142,  49,   1, 106, 250, 194, 62,  99,  12,  93,  17,
    245, 159,  97, 254, 245, 123, 13,  42, 165
  ];
    
  let signature = [
    117, 243, 201, 212, 4, 53, 177, 246, 42, 131, 162, 141, 
    164, 28, 57, 67,154, 138, 178, 165, 211, 94, 234, 229, 
    106, 52, 35, 69, 146, 186, 88, 250, 37, 34, 68, 250, 73, 
    228, 197, 71, 164, 152, 188, 193, 36, 59, 103, 102, 64, 
    164, 145, 77, 73, 58, 143, 198, 53, 20, 11, 19, 23, 136, 
    166, 185
  ];

  let index = 0;

  let hash_path: [Field; 2] = [
    0x042ea8c3cebf729da5465ae371db8e8421f7af7d13a4013d2d30cc4d12aefdcc,
    0x074f605dc8b98de80c5c9df19f0e4243e746603631de29e4e86a81d71c9b6581
    ];


  main(
    root, 
    proposal_id, 
    nullifierHash, 
    hashed_message, 
    pub_key, 
    signature, 
    index, 
    hash_path
    );

}

// is double-claim really possible?
// https://x.com/0xPARC/status/1493704577002049537?s=20
// unlike StealthDrop, inputs for nullifier hashing, 
// such as commitment, address, and id, is deterministic.
// recoverer can't create a new nullifier. ig. 
