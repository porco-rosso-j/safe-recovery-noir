use dep::std;

fn main(x : pub Field, y : pub Field) -> pub Field {
    let ret = std::hash::pedersen([x, y])[0];
    ret
}