use dep::std;

fn main(
    root: pub Field,
    nullifierHash: pub Field,
    index: Field,
    hash_path: [Field; 2],
    otp: Field,
    timestamp: pub Field // time step value. block.timestamp / 30
) {
    let mut leaf = std::hash::pedersen_hash([otp, timestamp]);
    std::println(leaf);

    let mut computed_root = std::merkle::compute_merkle_root(leaf, index, hash_path);

    // retry with one-step-behind time step value
    if (computed_root != root) {
        let one_step_behind_tp = timestamp - 1;

        leaf = std::hash::pedersen_hash([otp, one_step_behind_tp]);
        computed_root = std::merkle::compute_merkle_root(leaf, index, hash_path);

        assert(computed_root == root);
    }

    // Compute input note nullifier
    let nullifier = std::hash::pedersen_hash([leaf, otp, timestamp]);
    assert(nullifierHash == nullifier);
}

#[test]
fn test_main() {
    let root = 0x22fab3d87de44f44f3356520958d0684a5b327e37e0a0dde1a9f3f13c5a07f7e;

    let nullifierHash = 0x2598862d49813e0f738ffb2b316339155fb2ec921ae17ab80c1997651cf6a568;

    let index = 0;

    let hash_path: [Field; 2] = [
        0x137ad2247d8e089ca5dc03f9a70e5bc68392ac2916495968a80c35582c1a3c37,
        0x072beba6c02ef2bc3bd7c391ab32e6f0d8ee0a178e95640966e1deb7df1c9f7a
    ];

    let otp = 412714;
    let timestamp = 56847092; // or 1705412789

    main(root, nullifierHash, index, hash_path, otp, timestamp);
}
