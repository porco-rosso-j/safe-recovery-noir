pragma solidity 0.8.18;

// import {TestBase} from "forge-std/Base.sol";
import "./Inputs.sol";
import "forge-std/Test.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NoirHelper is Inputs, Test {
    using Strings for uint;

    function generateProofP256(
        string memory _path,
        string memory _proof_name
    ) public returns (bytes memory) {
        string memory proverTOML = "circuits/Prover.toml";

        string memory pub_key_x = string.concat(
            "pub_key_x",
            " = ",
            uint8ArrayToString(pubkey_x)
        );

        string memory pub_key_y = string.concat(
            "pub_key_y",
            " = ",
            uint8ArrayToString(pubkey_y)
        );

        string memory signature = string.concat(
            "signature",
            " = ",
            uint8ArrayToString(signature)
        );

        string memory hashed_message = string.concat(
            "hashed_message"
            " = ",
            uint8ArrayToString(message)
        );

        vm.writeLine(proverTOML, pub_key_x);
        vm.writeLine(proverTOML, pub_key_y);
        vm.writeLine(proverTOML, signature);
        vm.writeLine(proverTOML, hashed_message);

        // generate proof
        string[] memory ffi_cmds = new string[](1);
        ffi_cmds[0] = string.concat("./prove/prove_", _proof_name, ".sh");
        // chmod +x ./prove.sh to give the permission.
        vm.ffi(ffi_cmds);

        // clean inputs
        clean();
        // read proof
        string memory proof = vm.readFile(_path); // "circuits/proofs/.proof"
        return vm.parseBytes(proof);
    }

    function readProof(
        string memory fileName
    ) public view returns (bytes memory) {
        string memory file = vm.readFile(
            string.concat("circuits/proofs/", fileName, ".proof")
        );
        return vm.parseBytes(file);
    }

    function uint8ArrayToString(
        uint8[] memory array
    ) internal pure returns (string memory) {
        string memory str = "[";
        for (uint i = 0; i < array.length; i++) {
            str = string(abi.encodePacked(str, uint256(array[i]).toString()));
            if (i < array.length - 1) {
                str = string(abi.encodePacked(str, ","));
            }
        }
        str = string(abi.encodePacked(str, "]"));
        return str;
    }

    function clean() public {
        string[] memory ffi_cmds = new string[](1);
        ffi_cmds[0] = "./delete.sh";
        vm.ffi(ffi_cmds);
        // delete inputs;
    }
}

// 161b
