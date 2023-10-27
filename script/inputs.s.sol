pragma solidity ^0.8.17;

import "forge-std/Script.sol";

contract Sig is Script {
    uint256 deployerPrivateKey =
        0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;

    function run() external {
        vm.startBroadcast(deployerPrivateKey);

        string memory message = "message_test";
        bytes32 hashed_message = keccak256(abi.encodePacked(message));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            deployerPrivateKey,
            hashed_message
        );

        console.logString("hashed_message");
        console.logBytes32(hashed_message);
        console.logString("r");
        console.logBytes32(r);
        console.logString("s");
        console.logBytes32(s);
        // console.logString("manager");
        // console.logAddress(address(manager));
    }
}
