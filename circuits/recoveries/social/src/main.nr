use dep::std;
use dep::ecrecover;

// nargo 0.18.0 (git version hash: 4646a93f5e95604b5710353764b2c4295efaef6b, is dirty: true)

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

  //std::println(address);
    
  // Compute input note commitment a.k.a leaf
  let leaf = std::hash::pedersen([address, 0])[0];
  //std::println(leaf);

  let computed_root = std::merkle::compute_merkle_root(leaf, index, hash_path);
  //std::println(computed_root);
  assert(computed_root == root);
    
  // Compute input note nullifier
  let nullifier = std::hash::pedersen([leaf, address, proposal_id])[0];
  assert(nullifierHash == nullifier);
  //std::println(nullifier);

  nullifier
}


// guardian 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
#[test]
fn test_main() {
   let root = 0x2449e58ea6122681cf6b4041d8b17e88979ec0a467000c7230c2cfebf8742944;

  let proposal_id = 0;
  
  let nullifierHash = 0x0d173fa4f77255d90652f059d28541bddfd1bd030a7eb484f94509046e426b20;

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
    142,  49, 1, 106, 250, 194, 62,  99,  12,  93,  17,
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
    0x0653ff335ea4abfee01ea264bc67a3377c587d021a845494fd22cba3ad19596f,
    0x199a33fb7e9e85bded01f24eabac4af5cd53681ffa1df713741a2c93a2e636ab
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

// guardian 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
#[test]
fn test_main_2() {
  let root = 0x2449e58ea6122681cf6b4041d8b17e88979ec0a467000c7230c2cfebf8742944;

  let proposal_id = 0;

  let nullifierHash = 0x0f52f73dc45bf590504c109e54fdb9c8f6bb761d33cf45ee58c6ad175a696bf3;

  let hashed_message:[u8; 32]  = [
  177,  17,  43,  11, 139, 235,  22, 235,
   36, 180,  78, 126,  94,  48, 173,  44,
  242,  66,  14, 127, 220, 122, 119,   7,
  239,   3, 155, 154, 124, 162, 106,  33
  ];

  let pub_key:[u8; 64] = [
		186, 87, 52, 216, 247, 9, 23, 25, 71, 30, 127, 126, 214, 185, 223, 23, 13,
		199, 12, 198, 97, 202, 5, 230, 136, 96, 26, 217, 132, 240, 104, 176, 214,
		115, 81, 229, 240, 96, 115, 9, 36, 153, 51, 106, 176, 131, 158, 248, 165,
		33, 175, 211, 52, 229, 56, 7, 32, 95, 162, 240, 142, 236, 116, 244
  ];
    
  let signature:[u8; 64] = [
  251, 248,  94,  70,  80, 251,   5,  99, 169, 161,  92,
   43,  56,  91, 106, 176, 109, 245, 147,  82, 145, 196,
  137, 232, 110,   9, 122, 121,  64, 114, 168,  32,  45,
   16,  52,  81, 206, 192, 244,  55, 172,   0,   4, 163,
  229, 107, 249, 107, 117, 146, 239,  76,   1, 165, 232,
  149,  85, 147,  71, 183, 109, 148, 109, 199
  ];

  let index = 1;

  let hash_path: [Field; 2] = [
    0x11afe536a3d158d626aabefad9dc7a70ef5f23280d262cd7db5da5bd8d5f87e6,
    0x199a33fb7e9e85bded01f24eabac4af5cd53681ffa1df713741a2c93a2e636ab
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
