// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ProposalStatus} from "../common/Constants.sol";

contract RecoverBase {
    struct Proposal {
        uint8 recoveryType;
        address[] pendingNewOwners;
        address[] ownersReplaced;
        uint newThreshold;
        uint proposedTimestamp;
        uint timeLockEnd;
        ProposalStatus status;
        // following two variables are for social recovery
        uint approvalCount;
        mapping(bytes32 => bool) nullifierHash;
    }

    address public safe;
    address internal constant SENTINEL_DELEGATES = address(0x1);
    // uint256 public constant MIN_TIMELOCK = 30 days;
    // set to 0 for testing
    uint256 public constant MIN_TIMELOCK = 0;
    mapping(uint => uint) public recoveryTimelocks;

    // enabled
    mapping(uint => bool) public isMethodEnabled;

    // veifier
    mapping(uint => address) public verifiers;

    uint public lastExecutionTimestamp;

    uint public proposalCount;
    mapping(uint => Proposal) public recoveryProposals;
    mapping(uint8 => mapping(bytes32 => bool)) public recoveryNullifiers;

    modifier onlySafe() {
        require(msg.sender == safe, "SENDER_NOT_SAFE");
        _;
    }

    function _setVerifier(uint _recoveryType, address _verifier) internal {
        require(_verifier != address(0), "INVALID_VERIFIER_ADDRESS");
        verifiers[_recoveryType] = _verifier;
    }

    function _addRecoveryMethod(
        uint _recoveryType,
        uint _recoveryTimeLock
    ) internal {
        require(!isMethodEnabled[_recoveryType], "ALREADY_ENABLED");
        _setTimeLock(_recoveryType, _recoveryTimeLock);
        isMethodEnabled[_recoveryType] = true;
    }

    function _removeRecoveryMethod(uint _recoveryType) internal {
        require(isMethodEnabled[_recoveryType], "NOT_ENABLED");
        _setTimeLock(_recoveryType, 0);
        isMethodEnabled[_recoveryType] = false;
    }

    function _setTimeLock(uint _recoveryType, uint _recoveryTimeLock) internal {
        require(_recoveryTimeLock >= MIN_TIMELOCK, "TIMELOCK_TOO_SHORT");
        recoveryTimelocks[_recoveryType] = _recoveryTimeLock;
    }

    function _proposeRecovery(
        uint8 _recoveryType,
        address[] memory _oldAddresses,
        address[] memory _newAddresses,
        uint _newThreshold
    ) internal returns (uint, uint) {
        uint newProposalCount = proposalCount + 1;
        proposalCount = newProposalCount;

        Proposal storage proposal = recoveryProposals[newProposalCount];

        proposal.recoveryType = _recoveryType;
        proposal.ownersReplaced = _oldAddresses;
        proposal.pendingNewOwners = _newAddresses;
        proposal.newThreshold = _newThreshold;
        proposal.timeLockEnd =
            block.timestamp +
            recoveryTimelocks[_recoveryType];
        proposal.proposedTimestamp = block.timestamp;
        proposal.status = ProposalStatus.PROPOSED;

        // should emit an event to notify owner
        return (newProposalCount, proposal.timeLockEnd);
    }

    // view

    function getRecoveryByProposalId(
        uint _proposalId
    )
        public
        view
        returns (
            uint8,
            address[] memory,
            address[] memory,
            uint,
            uint,
            uint,
            ProposalStatus,
            uint
        )
    {
        require(_proposalId != 0 && _proposalId <= proposalCount, "INVALID_ID");
        Proposal storage proposal = recoveryProposals[_proposalId];
        return (
            proposal.recoveryType,
            proposal.pendingNewOwners,
            proposal.ownersReplaced,
            proposal.newThreshold,
            proposal.timeLockEnd,
            proposal.proposedTimestamp,
            proposal.status,
            proposal.approvalCount
        );
    }

    function getPendingNewOwners(
        uint _proposalId
    ) public view returns (address[] memory) {
        require(_proposalId != 0 && _proposalId <= proposalCount, "INVALID_ID");
        Proposal storage proposal = recoveryProposals[_proposalId];
        return proposal.pendingNewOwners;
    }

    function getIsMethodEnabled(uint _recoveryType) public view returns (bool) {
        return isMethodEnabled[_recoveryType];
    }
}
