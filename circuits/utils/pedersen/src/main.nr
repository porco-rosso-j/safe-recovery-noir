use dep::std;

fn main(x : pub Field, y : pub Field) -> pub Field {
    let ret = std::hash::pedersen([x, y])[0];
    ret
}

#[test]
fn test_main() {
    let x = 0x199a33fb7e9e85bded01f24eabac4af5cd53681ffa1df713741a2c93a2e636ab;
    let y = 0x3012a7c05f2d1ecd4e0a857de7fbbae428af4ad5c67ed23657caaa89ec7c090b;
    let ret = main(x, y);
    std::println(ret);
}