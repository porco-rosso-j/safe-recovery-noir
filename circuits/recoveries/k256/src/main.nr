use dep::std;
use dep::ecrecover;

fn main(
    hashedAddr: pub Field,
    pub_key: [u8; 64], 
    signature: [u8; 64], 
    hashed_message: pub [u8; 32],
) {
    let key = ecrecover::secp256k1::PubKey::from_unified(pub_key);

    let recovered_addr = ecrecover::ecrecover(
        key.pub_x, 
        key.pub_y,
        signature,
        hashed_message
    );

    //std::println(recovered_addr);

    let computed_hash = std::hash::pedersen_hash([recovered_addr]);
    // std::println(computed_hash);
    // std::println(hashedAddr);

    assert(computed_hash == hashedAddr);
}

#[test]
fn test_main() {

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

  let hashedAddr = 0x01e32ef55c3585d88ccf0201b61bd7dea1f69b13f251ba9082cf0cb190d47071;
    
  let signature = [
    117, 243, 201, 212, 4, 53, 177, 246, 42, 131, 162, 141, 
    164, 28, 57, 67,154, 138, 178, 165, 211, 94, 234, 229, 
    106, 52, 35, 69, 146, 186, 88, 250, 37, 34, 68, 250, 73, 
    228, 197, 71, 164, 152, 188, 193, 36, 59, 103, 102, 64, 
    164, 145, 77, 73, 58, 143, 198, 53, 20, 11, 19, 23, 136, 
    166, 185
  ];
    

  main(hashedAddr, pub_key, signature, hashed_message);
}


fn to_first_32(array_x: [u8; 64]) -> [u8; 32] {
      let mut combined: [u8; 32] = [0; 32];

      for i in 0..32 {
          combined[i] = array_x[i];
      }

      combined
}

fn to_second_32(array_x: [u8; 64]) -> [u8; 32] {
      let mut combined: [u8; 32] = [0; 32];
      let mut j = 0;
      for i in 0..32 {
        j = i + 32;
        //std::println(j);
        combined[i] = array_x[j];
      }
      combined
}

#[test] 
fn test_to_first_32() {
    let ret = to_first_32(TEST_ARRAY_64);

    // 141
    let tenth = ret[10];
    std::println(tenth);
}

#[test] 
fn test_to_second_32() {
    let ret = to_second_32(TEST_ARRAY_64);

    // 38
    let tenth = ret[10];
    std::println(tenth);
}


global TEST_ARRAY_64: [u8;64]
 = [
    118, 190, 21, 249, 139, 28, 162, 171, 252, 167, 234, 29, 188, 180, 82, 241, 91, 191, 193, 206, 15, 102, 35, 4, 79, 76, 69, 27, 27, 191, 31, 128,
    50, 49, 102, 29, 255, 107, 87, 223, 119, 141, 38, 132, 19, 105, 246, 167, 216, 172, 148, 34, 60, 43, 97, 141, 11, 223, 40, 120, 196, 61, 42, 79
   ];