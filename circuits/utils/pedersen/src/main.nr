use dep::std;

// fn main(x: pub Field) -> pub Field {
//     let ret = std::hash::pedersen([x])[0];
//     // std::println(ret);
//     ret
// }

fn main(input: pub [Field;3], length:Field) -> pub Field {
   let mut ret:Field = 0;
   
    if length == 1 {
        //ret = pedersen_one(input[0]);
        ret = std::hash::pedersen([input[0]])[0];
    } else if length == 2 {
        // ret = pedersen_two(input[0], input[1]);
        ret = std::hash::pedersen([input[0], input[1]])[0];
    } else if length == 3 {
       //  ret = pedersen_three(input[0], input[1], input[2]);
        ret = std::hash::pedersen([input[0], input[1], input[2]])[0];
    }

    ret
}




// fn pedersen_one(x: Field) -> pub Field {
//     let ret = std::hash::pedersen([x])[0];
//     ret
// }

// fn pedersen_two(x: Field, y: Field) -> pub Field {
//     let ret = std::hash::pedersen([x, y])[0];
//     ret
// }

// fn pedersen_three(x: Field, y: Field, z: Field) -> pub Field {
//     let ret = std::hash::pedersen([x, y, z])[0];
//     ret
// }

#[test]
fn test_main() {
    let x = 0xAB256C9d6aAE9ee6118A1531d43751996541799D;
    let y = 0x3012a7c05f2d1ecd4e0a857de7fbbae428af4ad5c67ed23657caaa89ec7c090b;
    // let ret = main([x, y, 0], 2);
    let ret = main([x, 0, 0], 1);
    std::println(ret);
}