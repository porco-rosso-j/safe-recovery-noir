// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./RecoverBase.sol";
import {RECOVERY_TYPE_SOCIAL} from "../Common/Constants.sol";

contract SocialRecover is RecoverBase {
    // address public socialRecoverVerifier;
    // bool public isSocialRecoverEnabled;
    bytes32 public guardiansRoot;
    uint public approvalThreshold;

    // should call basic recovery setup func that determines pending period, etc...
    function addSocialRecover(
        uint _recoveryTimeLock,
        uint _approvalThreshold,
        bytes32 _guardiansRoot
    ) public onlySafe {
        require(_guardiansRoot != bytes32(0), "INVALID_HASH");
        require(_approvalThreshold != 0, "INVALID_APP_THRESHOLD");
        guardiansRoot = _guardiansRoot;
        approvalThreshold = _approvalThreshold;
        _addRecoveryMethod(RECOVERY_TYPE_SOCIAL, _recoveryTimeLock);
    }

    function removeSocialRecover() public onlySafe {
        guardiansRoot = bytes32(0);
        approvalThreshold = 0;
        _removeRecoveryMethod(RECOVERY_TYPE_SOCIAL);
    }

    function _incrementApprovalCount(
        uint _proposalId,
        bytes32 _nullifierHash
    ) internal returns (uint) {
        Proposal storage proposal = recoveryProposals[_proposalId];
        require(!proposal.nullifierHash[_nullifierHash], "INVALID_NULLIFIER");
        proposal.nullifierHash[_nullifierHash] = true;
        proposal.approvalCount += 1;

        return proposal.approvalCount;
    }

    function _getPublicInputSocial(
        uint _proposalId,
        bytes32[] memory _publicInputs,
        bytes32[] memory _message,
        bytes32 _nullifierHash
    ) internal view returns (bytes32[] memory) {
        _publicInputs[0] = guardiansRoot;
        _publicInputs[1] = bytes32(_proposalId);
        _publicInputs[2] = _nullifierHash;

        for (uint i = 0; i < 32; i++) {
            _publicInputs[i + 3] = _message[i];
        }

        return _publicInputs;
    }
}
