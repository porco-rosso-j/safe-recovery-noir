import { Noir } from "@noir-lang/noir_js"
import { CompiledCircuit } from '@noir-lang/types';
import pedersenCircuit from "../../circuits/pedersen/target/pedersen.json" assert { type: 'json' };
import pedersen3Circuit from "../../circuits/pedersen_3/target/pedersen.json" assert { type: 'json' };

export async function pedersen(_x:string, _y:string):Promise<string> {
    
    const program = pedersenCircuit as CompiledCircuit;
    const noir = new Noir(program)

    const inputs = {
        x: _x,
        y: _y
      };

    const {returnValue} = await noir.execute(inputs)

    //console.log("return: ", returnValue)
    return returnValue.toString()
}

export async function pedersen3(_x:string, _y:string, _z:string):Promise<string> {
    
  const program = pedersen3Circuit as CompiledCircuit;
  const noir = new Noir(program)

  const inputs = {
      x: _x,
      y: _y,
      z: _z
    };

  const {returnValue} = await noir.execute(inputs)

  return returnValue.toString()
}

// pedersen(
//   "0x264f29fd32b7e85540801e6b61922925109c0d66ee5a95c0775054692a31b31f", 
//   "0x042ea8c3cebf729da5465ae371db8e8421f7af7d13a4013d2d30cc4d12aefdcc"
//   )
// 0x04bce55e9a6506e09ea93069863e71e1154a7e34c3677efbefb8a51b559ce12e

// pedersen(
//   "0x2effac571b7c04f4d19b7423c4838b561291889c7cc7f2d22e677953bfecfddc", 
//   "0x0c88c850eb068f048c160b2a1e91b5444984fa7beedb21532acd65e594ff6544"
//   )
// 0x074f605dc8b98de80c5c9df19f0e4243e746603631de29e4e86a81d71c9b6581

// pedersen(
//   "0x04bce55e9a6506e09ea93069863e71e1154a7e34c3677efbefb8a51b559ce12e", 
//   "0x074f605dc8b98de80c5c9df19f0e4243e746603631de29e4e86a81d71c9b6581"
//   )
// 0x14ed8e8ef5a31fb0d35bac70e981222631e7724280bdd684561b255822760e85