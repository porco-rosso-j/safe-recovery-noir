use dep::std;

// credit: https://github.com/WillSchiller/eth-paris-23/tree/main/noir-zk

fn main(preimage: [Field;10], hash: pub Field) {
    // let h = std::hash::keccak256(preimage, 10);
    let h = std::hash::pedersen_hash(preimage);
    // std::println(h);
    assert(h == hash);
}

#[test]
fn test_main() {
    // let preimage: [u8; 10] = [110,121,97,110,107,111,49,50,51,52];
    // let hash: [u8; 32]= [225,173,175,137,173,67,141,144,36,144,135,233,78,113,0,209,182,100,33,124,105,196,60,128,126,95,101,116,145,211,6,100];
    let preimage: [Field; 10] = [116, 101, 115, 116, 0, 0, 0, 0, 0, 0];
    let hash: Field = 0x15a52a0d6f0eedd4f63d72cb8275ae6826dcd005eafee769658486a2d3c09e1d;
    main(preimage, hash);
 }
