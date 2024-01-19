use dep::std;

pub fn compute_root_flexible_path_len(leaf: Field, index: Field, hash_path: [Field; 4]) -> Field {
    assert(hash_path.len() != 0);

    let length = get_actual_len(hash_path);
    // std::println(length);

    let mut computed_root :Field = 0;

    if (length == 1) {
        let path = [hash_path[0]];
        computed_root = std::merkle::compute_merkle_root(leaf, index, path);
    } else if (length == 2) {
        let path = [hash_path[0], hash_path[1]];
        computed_root = std::merkle::compute_merkle_root(leaf, index, path);
    } else if (length == 3) {
        let path = [hash_path[0], hash_path[1], hash_path[2]];
        computed_root = std::merkle::compute_merkle_root(leaf, index, path);
    } else {
        computed_root = std::merkle::compute_merkle_root(leaf, index, hash_path);
    }

    //std::println(computed_root);
    computed_root
}

fn get_actual_len(array: [Field; 4]) -> Field {
    let mut len = 0;
    for i in 0..array.len() {
        // std::println(i);
        if (array[i] != 0) {
            len += 1;
        }
    }

    len
}

// #[test]
// fn test_main() {
//     let leaf = 0x189dcaf6f029ce3d4b377878a1ef9983a1bc8822c4bbeb50fe26bfdb8be23e5b;
//     let index = 0;

//     let hash_path: [Field; 4] = [
//         0x137ad2247d8e089ca5dc03f9a70e5bc68392ac2916495968a80c35582c1a3c37,
//         0x072beba6c02ef2bc3bd7c391ab32e6f0d8ee0a178e95640966e1deb7df1c9f7a,
//         0,
//         0
//     ];

//     main(leaf, index, hash_path);
// }
