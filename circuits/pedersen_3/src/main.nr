use dep::std;

fn main(x : pub Field, y : pub Field, z : pub Field) -> pub Field {
    let ret = std::hash::pedersen([x, y, z])[0];
    ret
}