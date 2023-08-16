// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract SecretRecover {
    address public secretVerifeir;
    bool public isSecretRecoverEnabled;
    bytes32[] public hashed_secret;

    function addSecretRecover(bytes32 _hashed_secret) public {
        require(_hashed_secret != bytes32(0), "INVALID_HASH");
        hashed_secret = _convertBytes32ToBytes32Array(_hashed_secret);
        isSecretRecoverEnabled = true;
    }

    function removeSecretRecover() public {
        require(isSecretRecoverEnabled, "NOT_ENABLED");
        isSecretRecoverEnabled = false;
    }

    function _convertBytes32ToBytes32Array(
        bytes32 value
    ) public pure returns (bytes32[32] memory) {
        bytes32[32] memory paddedArray;

        for (uint256 i = 0; i < 32; i++) {
            paddedArray[i] = bytes32(uint(uint8(value[i])));
        }

        return paddedArray;
    }
}
