// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./RecoverBase.sol";
import {RECOVERY_TYPE_SECRET} from "../Common/Constants.sol";

contract SecretRecover is RecoverBase {
    // address public secretVerifier;
    // bool public isSecretRecoverEnabled;
    bytes32 public hashed_secret;

    function addSecretRecover(
        uint _recoveryTimeLock,
        bytes32 _hashed_secret
    ) public onlySafe {
        require(_hashed_secret != bytes32(0), "INVALID_HASH");
        hashed_secret = _hashed_secret;
        _addRecoveryMethod(RECOVERY_TYPE_SECRET, _recoveryTimeLock);
    }

    function removeSecretRecover() public onlySafe {
        hashed_secret = bytes32(0);
        _removeRecoveryMethod(RECOVERY_TYPE_SECRET);
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
