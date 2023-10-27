use dep::std;

fn main(leaf: Field, index: Field,  hash_path : [Field; 2]) -> pub Field {
    let computed_root = std::merkle::compute_merkle_root(leaf, index, hash_path);
    computed_root
}

#[test]
fn test_main() {
    let leaf = 0x11afe536a3d158d626aabefad9dc7a70ef5f23280d262cd7db5da5bd8d5f87e6;
    let hash_path: [Field; 2] = [
    0x0653ff335ea4abfee01ea264bc67a3377c587d021a845494fd22cba3ad19596f,
    0x3012a7c05f2d1ecd4e0a857de7fbbae428af4ad5c67ed23657caaa89ec7c090b
    ];

    let ret = main(leaf, 0, hash_path);
    std::println(ret);
}
