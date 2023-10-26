// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// recivert types

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
    uint256 public constant MIN_TIMELOCK = 30 days;
    uint256 public recoveryTimeLock;

    uint public recoveryCount;
    mapping(uint => Recovery) public recoveries;

    modifier onlySafe() {
        require(msg.sender == safe, "SENDER_NOT_SAFE");
        _;
    }

    function _addDelay(uint _recoveryTimeLock) internal {
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
        Recovery storage recovery = recoveries[newRecoveryCount];

        recovery.recoveryType = _recoveryType;
        recovery.ownersReplaced = _oldAddresses;
        recovery.pendingNewOwners = _newAddresses;
        recovery.newThreshold = _newThreshold;
        recovery.deadline = block.timestamp + recoveryTimeLock;

        // should emit an event to notify owner
        return (newRecoveryCount, recovery.deadline);
    }
}
