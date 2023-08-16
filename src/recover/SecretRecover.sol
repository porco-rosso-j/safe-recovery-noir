// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract SecretRecover {
    address public secretVerifeir;
    bytes32 public hashed_secret;

    function addSecretRecover(bytes32 _hashed_secret) public {
        hashed_secret = _hashed_secret;
    }

    function removeSecretRecover() public {}
}
