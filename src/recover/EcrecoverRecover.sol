// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./RecoverBase.sol";
import {RECOVERY_TYPE_K256} from "../Common/Constants.sol";

contract EcrecoverRecover is RecoverBase {
    // address public ecrecoverVerifier;
    // bool public isEcrecoverRecoverEnabled;
    bytes32 public hashed_address;

    function addEcrecoverRecover(
        uint _recoveryTimeLock,
        bytes32 _hashed_address
    ) public onlySafe {
        require(_hashed_address != bytes32(0), "INVALID_HASH");
        hashed_address = _hashed_address;
        // _setTimeLock(1, _recoveryTimeLock);
        // isEcrecoverRecoverEnabled = true;
        _addRecoveryMethod(RECOVERY_TYPE_K256, _recoveryTimeLock);
    }

    function removeEcrecoverRecover() public onlySafe {
        hashed_address = bytes32(0);
        _removeRecoveryMethod(RECOVERY_TYPE_K256);
        // require(isEcrecoverRecoverEnabled, "NOT_ENABLED");
        // isEcrecoverRecoverEnabled = false;
    }

    function _getPublicInputEcrecover(
        bytes32[] memory _publicInputs,
        bytes32[] memory _message
    ) internal view returns (bytes32[] memory) {
        _publicInputs[0] = hashed_address;

        for (uint i = 0; i < 32; i++) {
            _publicInputs[i + 1] = _message[i];
        }

        return _publicInputs;
    }
}
