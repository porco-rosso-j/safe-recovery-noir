use dep::std;

// credit: https://github.com/WillSchiller/eth-paris-23/tree/main/noir-zk

fn main(preimage: [u8;10], hash: pub [u8; 32]) {
    let h = std::hash::keccak256(preimage, 10);
    std::println(hash);
    std::println(h);
    assert(h == hash);
}

#[test]
fn test_main() {
    let preimage: [u8; 10] = [110,121,97,110,107,111,49,53,56,57];
    let hash: [u8; 32]= [60,244,207,35,188,230,115,39,34,106,114,199,48,99,35,84,188,137,149,154,99,221,239,55,17,156,204,157,63,230,98,245];
    main(preimage, hash);
 }
