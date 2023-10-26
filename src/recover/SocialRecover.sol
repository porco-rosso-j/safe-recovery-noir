// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./RecoverBase.sol";

contract SocialRecover is RecoverBase {
    address public socialRecoverVerifier;
    bool public isSocialRecoverEnabled;
    bytes32 public guardiansRoot;
    uint public threshold;

    // should call basic recovery setup func that determines pending period, etc...
    function addSocialRecover(
        uint _recoveryTimeLock,
        uint _threshold,
        bytes32 _guardiansRoot
    ) public onlySafe {
        require(_guardiansRoot != bytes32(0), "INVALID_HASH");
        guardiansRoot = _guardiansRoot;
        threshold = _threshold;
        _addDelay(_recoveryTimeLock);
        isSocialRecoverEnabled = true;
    }

    function removeSocialRecover() public onlySafe {
        require(isSocialRecoverEnabled, "NOT_ENABLED");
        guardiansRoot = bytes32(0);
        threshold = 0;
        isSocialRecoverEnabled = false;
    }

    function _incrementApprovalCount(
        uint _recoveryId,
        bytes32 _nullifierHash
    ) internal returns (uint) {
        Recovery storage recovery = recoveries[_recoveryId];
        require(!recovery.nullifierHash[_nullifierHash], "INVALID_NULLIFIER");
        recovery.nullifierHash[_nullifierHash] = true;
        recovery.approvalCount += 1;

        return recovery.approvalCount;
    }

    function _getPublicInputSocial(
        bytes32[] memory _publicInputs,
        bytes32[] memory _message,
        bytes32 nullifierHash
    ) internal view returns (bytes32[] memory) {
        _publicInputs[0] = guardiansRoot;
        _publicInputs[1] = bytes32(recoveryCount);
        _publicInputs[2] = nullifierHash;

        for (uint i = 0; i < 32; i++) {
            _publicInputs[i + 3] = _message[i];
        }

        return _publicInputs;
    }
}