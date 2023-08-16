use dep::std;
mod ecrecover;

fn main(
    hashedAddr: pub Field,
    pub_key: [u8; 64], 
    signature: [u8; 64], 
    message_hash: pub [u8; 32],
) {

    let pubkey_x = to_first_32(pub_key);
    let pubkey_y = to_second_32(pub_key);

    let recovered_addr = ecrecover::ecrecover(
        pubkey_x,
        pubkey_y,
        signature,
        message_hash
    );

    std::println(recovered_addr);

    let mut addr: [Field; 1] = [0; 1];
    addr[0] = recovered_addr;

    let computed_root = std::hash::pedersen(addr);
    std::println(computed_root);
    std::println(hashedAddr);

    assert(computed_root[0] == hashedAddr);
}

#[test]
fn test_main() {

  let message_hash = [
    25, 207, 171, 174, 102, 123, 180,
    203, 237, 218, 232, 136, 111, 180,
    142,  11,  68, 251,   9,   3, 144,
    103,  41, 137, 231, 122,   0, 249,
    220, 242, 224, 153
  ];

  let pub_key = [
    131,  24,  83,  91,  84,  16, 93,  74, 122, 174,  96,
    192, 143, 196,  95, 150, 135, 24,  27,  79, 223, 198,
    37, 189,  26, 117,  63, 167, 57, 127, 237, 117,  53,
    71, 241,  28, 168, 105, 102, 70, 242, 243, 172, 176,
    142,  49,   1, 106, 250, 194, 62,  99,  12,  93,  17,
    245, 159,  97, 254, 245, 123, 13,  42, 165
  ];

  let hashedAddr = 0x2840920c6b28172affa5533dbcec73f20e1a7d54cdb0c5d79b1297895c3c6d03;
    
  let signature = [
    210,   1, 118,  62,  14, 109, 127, 105,  12, 114, 199,
    141,  95, 204, 184,  88, 127,  81,  34, 240, 134,  36,
    251,  19, 217, 164,  34,  38, 215, 195, 248, 181,  56,
    80,  60, 135, 183,  77, 233, 227, 170,  10,  94,  17,
    48,  11,  13, 171,  88,  69,  93,  69, 114,  18, 223,
    172, 226,  73, 196, 117, 252, 172,   3,  74
  ];

  main(hashedAddr, pub_key, signature, message_hash);
  //    std::println(ret);
  //    assert(ret == true);
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