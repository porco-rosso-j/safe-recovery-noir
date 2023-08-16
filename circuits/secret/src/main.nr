use dep::std;

// credit: https://github.com/WillSchiller/eth-paris-23/tree/main/noir-zk

fn main(preimage : [u8; 2],  hash : pub [u8; 32]) {
    let h = std::hash::sha256(preimage);
    std::println(h);
    assert(h == hash);
}

#[test]
fn test_main() {
    let preimage = [11, 11];
    let hash = [190, 31, 112, 6, 58, 1, 0, 85, 208, 15, 131, 187, 154, 236, 131, 18, 25, 1, 225, 166, 150, 70, 118, 122, 227, 71, 156, 35, 11, 3, 12, 231];
    main(preimage, hash);
 }
