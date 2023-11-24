// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract RecoverBase {
    struct Recovery {
        uint8 recoveryType;
        address[] pendingNewOwners;
        address[] ownersReplaced;
        uint newThreshold;
        uint deadline;
        bool rejected;
        uint approvalCount;
        mapping(bytes32 => bool) nullifierHash;
    }

    address public safe;
    address internal constant SENTINEL_DELEGATES = address(0x1);
    // uint256 public constant MIN_TIMELOCK = 30 days;
    // set to 10 secds for testing
    uint256 public constant MIN_TIMELOCK = 10 seconds;
    uint256 public recoveryTimeLock;

    uint public recoveryCount;
    mapping(uint => Recovery) public recoveries;

    modifier onlySafe() {
        require(msg.sender == safe, "SENDER_NOT_SAFE");
        _;
    }

    function _setTimeLock(uint _recoveryTimeLock) internal {
        require(_recoveryTimeLock >= MIN_TIMELOCK, "DELAY_TOO_SHORT");
        recoveryTimeLock = _recoveryTimeLock;
    }

    function _proposeRecovery(
        uint8 _recoveryType,
        address[] memory _oldAddresses,
        address[] memory _newAddresses,
        uint _newThreshold
    ) internal returns (uint, uint) {
        uint newRecoveryCount = recoveryCount + 1;
        recoveryCount = newRecoveryCount;

        Recovery storage recovery = recoveries[newRecoveryCount];

        recovery.recoveryType = _recoveryType;
        recovery.ownersReplaced = _oldAddresses;
        recovery.pendingNewOwners = _newAddresses;
        recovery.newThreshold = _newThreshold;
        recovery.deadline = block.timestamp + recoveryTimeLock;

        // should emit an event to notify owner
        return (newRecoveryCount, recovery.deadline);
    }

    // getter

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
            bool,
            uint
        )
    {
        require(_proposalId != 0 && _proposalId <= recoveryCount, "INVALID_ID");
        Recovery storage recovery = recoveries[_proposalId];
        return (
            recovery.recoveryType,
            recovery.pendingNewOwners,
            recovery.ownersReplaced,
            recovery.newThreshold,
            recovery.deadline,
            recovery.rejected,
            recovery.approvalCount
        );
    }

    function getPendingNewOwners(
        uint _proposalId
    ) public view returns (address[] memory) {
        require(_proposalId != 0 && _proposalId <= recoveryCount, "INVALID_ID");
        Recovery storage recovery = recoveries[_proposalId];
        return recovery.pendingNewOwners;
    }
}
