use dep::std;
use dep::ecrecover;

// nargo 0.19.2 (git version hash: 4646a93f5e95604b5710353764b2c4295efaef6b, is dirty: true)

fn main(
    root: pub Field,
    proposal_id: pub Field,
    nullifierHash: pub Field,
    hashed_message: pub [u8; 32],
    pub_key: [u8; 64],
    signature: [u8; 64],
    index: Field,
    hash_path: [Field; 2]
) {
    let key = ecrecover::secp256k1::PubKey::from_unified(pub_key);
    let address = ecrecover::ecrecover(key.pub_x, key.pub_y, signature, hashed_message);

    std::println(address);

    // Compute input note commitment a.k.a leaf
    let leaf = std::hash::pedersen_hash([address]);
    std::println(leaf);

    let computed_root = std::merkle::compute_merkle_root(leaf, index, hash_path);
    std::println(computed_root);
    assert(computed_root == root);

    // Compute input note nullifier
    let nullifier = std::hash::pedersen_hash([leaf, address, proposal_id]);
    assert(nullifierHash == nullifier);
    std::println(nullifier);
}

// guardian 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
#[test]
fn test_main() {
    let root = 0x11d01c0067d1e894a83c6ac6f935a31e250f9f723f71a4e53b24ae29f47213d2;

    let proposal_id = 1;

    let nullifierHash = 0x2b8caa407eb3bc33aa3b46a6d20ec396dbece04566c10a5acdfdf91da95bc525;

    let hashed_message = [
        82, 154, 122, 115, 3, 254, 180, 9,
        84, 23, 70, 63, 179, 211, 86, 72,
        32, 88, 133, 119, 7, 93, 100, 22,
        177, 234, 251, 240, 46, 87, 132, 171
    ];

    let pub_key = [
        131, 24, 83, 91, 84, 16, 93, 74, 122, 174, 96,
        192, 143, 196, 95, 150, 135, 24, 27, 79, 223, 198,
        37, 189, 26, 117, 63, 167, 57, 127, 237, 117, 53,
        71, 241, 28, 168, 105, 102, 70, 242, 243, 172, 176,
        142, 49, 1, 106, 250, 194, 62, 99, 12, 93, 17,
        245, 159, 97, 254, 245, 123, 13, 42, 165
    ];

    let signature = [
        117, 243, 201, 212, 4, 53, 177, 246, 42, 131, 162, 141,
        164, 28, 57, 67, 154, 138, 178, 165, 211, 94, 234, 229,
        106, 52, 35, 69, 146, 186, 88, 250, 37, 34, 68, 250, 73,
        228, 197, 71, 164, 152, 188, 193, 36, 59, 103, 102, 64,
        164, 145, 77, 73, 58, 143, 198, 53, 20, 11, 19, 23, 136,
        166, 185
    ];

    let index = 0;

    let hash_path: [Field; 2] = [
        0x2746750d26fb25a124823d57b15a2bcdffab42e0b3902a9555d8c8406fb63a59,
        0x0a10de25cde1addf30bc53a2b6aa790783757bab845628a4e4cbf6bbead561ff
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

// #[test]
// fn test_main() {
//     let root = 0x11d01c0067d1e894a83c6ac6f935a31e250f9f723f71a4e53b24ae29f47213d2;

//     let proposal_id = 3;

//     let nullifierHash = 0x2b8caa407eb3bc33aa3b46a6d20ec396dbece04566c10a5acdfdf91da95bc525;

//     let hashed_message = [
//         254, 4, 178, 55, 182, 20, 133, 27, 54, 59, 132, 217, 75, 246, 157, 107, 49, 161, 99, 72, 15, 190, 232, 130, 233, 246, 13, 168, 119, 173, 127, 20
//     ];

//     let pub_key = [
//         144, 42, 126, 243, 197, 224, 171, 52, 111, 185, 89, 58, 124, 43, 67, 145, 33, 52, 201, 163, 3, 120, 8, 32, 182, 45, 118, 44, 81, 48, 209, 100, 136, 241, 183, 136, 148, 34, 109, 75, 246, 179, 41, 2, 37, 29, 213, 190, 100, 221, 225, 102, 45, 225, 143, 179, 239, 173, 143, 29, 155, 153, 192, 194
//     ];

//     let signature = [
//         241, 111, 57, 193, 69, 145, 191, 82, 170, 184, 87, 25, 53, 162, 128, 113, 244, 192, 112, 214, 251, 116, 127, 161, 119, 84, 248, 62, 102, 81, 68, 65, 75, 4, 24, 252, 54, 119, 116, 207, 117, 218, 38, 205, 75, 122, 174, 83, 16, 105, 1, 119, 205, 1, 244, 98, 196, 116, 55, 75, 121, 137, 30, 71
//     ];

//     let index = 0;

//     let hash_path: [Field; 2] = [
//         0x137ad2247d8e089ca5dc03f9a70e5bc68392ac2916495968a80c35582c1a3c37,
//         0x072beba6c02ef2bc3bd7c391ab32e6f0d8ee0a178e95640966e1deb7df1c9f7a
//     ];

//     main(
//         root,
//         proposal_id,
//         nullifierHash,
//         hashed_message,
//         pub_key,
//         signature,
//         index,
//         hash_path
//     );
// }

// guardian 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
// #[test]
// fn test_main_2() {
//     let root = 0x159203bdb93e44c9069d2dea34abdc548c58f22de8a0aaf57f320576a7debb21;

//     let proposal_id = 1;

//     let nullifierHash = 0x2c859828f7a8f32a26583cbbbecc0b4ff84c1ce7ce336ae88ed68ff59cc13cca;

//     let hashed_message:[u8; 32]  = [
//         177, 17, 43, 11, 139, 235, 22, 235,
//         36, 180, 78, 126, 94, 48, 173, 44,
//         242, 66, 14, 127, 220, 122, 119, 7,
//         239, 3, 155, 154, 124, 162, 106, 33
//     ];

//     let pub_key:[u8; 64] = [
//         186, 87, 52, 216, 247, 9, 23, 25, 71, 30, 127, 126, 214, 185, 223, 23, 13,
//         199, 12, 198, 97, 202, 5, 230, 136, 96, 26, 217, 132, 240, 104, 176, 214,
//         115, 81, 229, 240, 96, 115, 9, 36, 153, 51, 106, 176, 131, 158, 248, 165,
//         33, 175, 211, 52, 229, 56, 7, 32, 95, 162, 240, 142, 236, 116, 244
//     ];

//     let signature:[u8; 64] = [
//         251, 248, 94, 70, 80, 251, 5, 99, 169, 161, 92,
//         43, 56, 91, 106, 176, 109, 245, 147, 82, 145, 196,
//         137, 232, 110, 9, 122, 121, 64, 114, 168, 32, 45,
//         16, 52, 81, 206, 192, 244, 55, 172, 0, 4, 163,
//         229, 107, 249, 107, 117, 146, 239, 76, 1, 165, 232,
//         149, 85, 147, 71, 183, 109, 148, 109, 199
//     ];

//     let index = 1;

//     let hash_path: [Field; 2] = [
//         0x11afe536a3d158d626aabefad9dc7a70ef5f23280d262cd7db5da5bd8d5f87e6,
//         0x199a33fb7e9e85bded01f24eabac4af5cd53681ffa1df713741a2c93a2e636ab
//     ];

//     main(
//         root,
//         proposal_id,
//         nullifierHash,
//         hashed_message,
//         pub_key,
//         signature,
//         index,
//         hash_path
//     );
// }

// is double-claim really possible?
// https://x.com/0xPARC/status/1493704577002049537?s=20
// unlike StealthDrop, inputs for nullifier hashing, 
// such as commitment, address, and id, is deterministic.
// recoverer can't create a new nullifier. ig. 
