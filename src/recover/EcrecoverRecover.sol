// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./RecoverBase.sol";

contract EcrecoverRecover is RecoverBase {
    address public ecrecoverVerifier;
    bool public isEcrecoverRecoverEnabled;
    bytes32[] public hashed_address;

    // should call basic recovery setup func that determines pending period, etc...
    function addEcrecoverRecover(
        uint _recoveryTimeLock,
        bytes32[] memory _hashed_address
    ) public onlySafe {
        require(_hashed_address.length != 0, "INVALID_HASH");
        hashed_address = _hashed_address;
        _addDelay(_recoveryTimeLock);
        isEcrecoverRecoverEnabled = true;
    }

    function removeEcrecoverRecover() public onlySafe {
        require(isEcrecoverRecoverEnabled, "NOT_ENABLED");
        isEcrecoverRecoverEnabled = false;
    }

    function _getPublicInputEcrecover(
        bytes32[] memory _publicInputs,
        bytes32[] memory _message
    ) internal view returns (bytes32[] memory) {
        // bytes32[] memory pubInputs = new bytes32[](96);

        for (uint i = 0; i < 32; i++) {
            _publicInputs[i] = hashed_address[i];
            _publicInputs[i + 32] = _message[i];
        }

        return _publicInputs;
    }

    // function _convertBytes32ToBytes32Array(
    //     bytes32 value
    // ) public pure returns (bytes32[32] memory) {
    //     bytes32[32] memory paddedArray;

    //     for (uint256 i = 0; i < 32; i++) {
    //         paddedArray[i] = bytes32(uint(uint8(value[i])));
    //     }

    //     return paddedArray;
    // }
}
