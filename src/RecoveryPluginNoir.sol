// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// openzeppelin modules for proxy upgradability
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";
import {PLUGIN_PERMISSION_CALL_TO_SELF} from "@safe-global/safe-core-protocol/contracts/common/Constants.sol";
import {BasePluginWithEventMetadata, PluginMetadata} from "./common/Base.sol";

// interfaces
import {IGnosisSafe} from "./interfaces/IGnosisSafe.sol";
import {IUltraVerifier} from "./interfaces/IUltraVerifier.sol";

// recovery contracts
import {WebAuthnRecover} from "./recover/WebAuthnRecover.sol";
import {SecretRecover} from "./recover/SecretRecover.sol";
import {EcrecoverRecover} from "./recover/EcrecoverRecover.sol";
import {SocialRecover} from "./recover/SocialRecover.sol";
import {RECOVERY_TYPE_K256, RECOVERY_TYPE_P256, RECOVERY_TYPE_SECRET, RECOVERY_TYPE_SOCIAL, ProposalStatus} from "./common/Constants.sol";

import "forge-std/console.sol";

contract RecoveryPluginNoir is
    UUPSUpgradeable,
    Initializable,
    BasePluginWithEventMetadata,
    WebAuthnRecover,
    SecretRecover,
    EcrecoverRecover,
    SocialRecover
{
    error PROOF_VERIFICATION_FAILED();
    error RECOVER_FAILED(bytes reason);

    ISafeProtocolManager public safeProtocolManager;

    function initialize(
        address _safe,
        address _safeProtocolManager,
        address _ecrecoverVerifier,
        address _webAuthnVerifier, // stored and passed by factory
        address _secretVerifier,
        address _socialRecoverVerifier
    ) public initializer {
        _initializeBasePluginWithEventMetadata(
            PluginMetadata({
                name: "Safe Recovery Plugin",
                version: "1.0.0",
                requiresRootAccess: true,
                iconUrl: "",
                appUrl: "https://github.com/porco-rosso-j/safe-recovery-noir"
            })
        );
        safe = _safe;
        safeProtocolManager = ISafeProtocolManager(_safeProtocolManager);
        _setVerifier(RECOVERY_TYPE_K256, _ecrecoverVerifier);
        _setVerifier(RECOVERY_TYPE_P256, _webAuthnVerifier);
        _setVerifier(RECOVERY_TYPE_SECRET, _secretVerifier);
        _setVerifier(RECOVERY_TYPE_SOCIAL, _socialRecoverVerifier);
    }

    function proposeEcrecoverRecover(
        address[] memory _oldAddresses,
        address[] memory _newAddresses,
        uint _newThreshold,
        bytes memory _proof,
        bytes32[] memory _message
    ) public returns (uint, uint) {
        require(msg.sender != safe, "INVALID_SENDER");
        require(isMethodEnabled[RECOVERY_TYPE_K256], "NOT_ENABLED");
        bytes32 proofNullifier = keccak256(_proof);
        require(
            !recoveryNullifiers[RECOVERY_TYPE_K256][proofNullifier],
            "DUPLICATED_PROOF"
        );

        uint newThreshold = _validateAddressesAndThreshold(
            _oldAddresses,
            _newAddresses,
            _newThreshold
        );

        bytes32[] memory publicInputs = new bytes32[](33);

        publicInputs = _getPublicInputEcrecover(publicInputs, _message);

        if (
            !IUltraVerifier(verifiers[RECOVERY_TYPE_K256]).verify(
                _proof,
                publicInputs
            )
        ) revert PROOF_VERIFICATION_FAILED();

        recoveryNullifiers[RECOVERY_TYPE_K256][proofNullifier] = true;

        return
            _proposeRecovery(
                RECOVERY_TYPE_K256,
                _oldAddresses,
                _newAddresses,
                newThreshold
            );
    }

    function proposeWebAuthnRecover(
        address[] memory _oldAddresses,
        address[] memory _newAddresses,
        uint _newThreshold,
        bytes memory _proof,
        bytes memory _webAuthnInputs
    ) public returns (uint, uint) {
        require(msg.sender != safe, "INVALID_SENDER");
        require(isMethodEnabled[RECOVERY_TYPE_P256], "NOT_ENABLED");
        bytes32 proofNullifier = keccak256(_proof);
        require(
            !recoveryNullifiers[RECOVERY_TYPE_P256][proofNullifier],
            "DUPLICATED_PROOF"
        );

        uint newThreshold = _validateAddressesAndThreshold(
            _oldAddresses,
            _newAddresses,
            _newThreshold
        );

        bytes32 message = _computeMessage(_webAuthnInputs);

        bytes32[] memory publicInputs = new bytes32[](32);
        publicInputs = _getPublicInputWebAuthn(message);

        if (
            !IUltraVerifier(verifiers[RECOVERY_TYPE_P256]).verify(
                _proof,
                publicInputs
            )
        ) revert PROOF_VERIFICATION_FAILED();

        recoveryNullifiers[RECOVERY_TYPE_P256][proofNullifier] = true;

        return
            _proposeRecovery(
                RECOVERY_TYPE_P256,
                _oldAddresses,
                _newAddresses,
                newThreshold
            );
    }

    function proposeSecretRecover(
        address[] memory _oldAddresses,
        address[] memory _newAddresses,
        uint _newThreshold,
        bytes memory _proof
    ) public returns (uint, uint) {
        require(msg.sender != safe, "INVALID_SENDER");
        require(isMethodEnabled[RECOVERY_TYPE_SECRET], "NOT_ENABLED");

        bytes32 proofNullifier = keccak256(_proof);
        require(
            !recoveryNullifiers[RECOVERY_TYPE_SECRET][proofNullifier],
            "DUPLICATED_PROOF"
        );

        uint newThreshold = _validateAddressesAndThreshold(
            _oldAddresses,
            _newAddresses,
            _newThreshold
        );

        bytes32[] memory publicInputs = new bytes32[](1);
        publicInputs[0] = hashed_secret;

        if (
            !IUltraVerifier(verifiers[RECOVERY_TYPE_SECRET]).verify(
                _proof,
                publicInputs
            )
        ) revert PROOF_VERIFICATION_FAILED();

        recoveryNullifiers[RECOVERY_TYPE_SECRET][proofNullifier] = true;

        return
            _proposeRecovery(
                RECOVERY_TYPE_SECRET,
                _oldAddresses,
                _newAddresses,
                newThreshold
            );
    }

    function proposeSocialRecover(
        address[] memory _oldAddresses,
        address[] memory _newAddresses,
        uint _newThreshold,
        bytes memory _proof,
        bytes32 _nullifierHash,
        bytes32[] memory _message
    ) public returns (uint, uint) {
        require(msg.sender != safe, "INVALID_SENDER");
        require(isMethodEnabled[RECOVERY_TYPE_SOCIAL], "NOT_ENABLED");
        bytes32 proofNullifier = keccak256(_proof);
        require(
            !recoveryNullifiers[RECOVERY_TYPE_SOCIAL][proofNullifier],
            "DUPLICATED_PROOF"
        );

        uint newThreshold = _validateAddressesAndThreshold(
            _oldAddresses,
            _newAddresses,
            _newThreshold
        );

        bytes32[] memory publicInputs = new bytes32[](35);
        uint _proposalId = proposalCount + 1;

        publicInputs = _getPublicInputSocial(
            _proposalId,
            publicInputs,
            _message,
            _nullifierHash
        );

        if (
            !IUltraVerifier(verifiers[RECOVERY_TYPE_SOCIAL]).verify(
                _proof,
                publicInputs
            )
        ) revert PROOF_VERIFICATION_FAILED();

        recoveryNullifiers[RECOVERY_TYPE_SOCIAL][proofNullifier] = true;

        (uint proposalId, uint timeLockEnd) = _proposeRecovery(
            RECOVERY_TYPE_SOCIAL,
            _oldAddresses,
            _newAddresses,
            newThreshold
        );

        _incrementApprovalCount(proposalId, _nullifierHash);

        return (proposalId, timeLockEnd);
    }

    function approveSocialRecovery(
        uint _proposalId,
        bytes memory _proof,
        bytes32 nullifierHash,
        bytes32[] memory _message
    ) public returns (uint) {
        require(msg.sender != safe, "INVALID_SENDER");
        require(isMethodEnabled[RECOVERY_TYPE_SOCIAL], "NOT_ENABLED");

        bytes32[] memory publicInputs = new bytes32[](35);

        bytes32 proofNullifier = keccak256(_proof);
        require(
            !recoveryNullifiers[RECOVERY_TYPE_SOCIAL][proofNullifier],
            "DUPLICATED_PROOF"
        );

        publicInputs = _getPublicInputSocial(
            _proposalId,
            publicInputs,
            _message,
            nullifierHash
        );

        if (
            !IUltraVerifier(verifiers[RECOVERY_TYPE_SOCIAL]).verify(
                _proof,
                publicInputs
            )
        ) revert PROOF_VERIFICATION_FAILED();

        recoveryNullifiers[RECOVERY_TYPE_SOCIAL][proofNullifier] = true;

        uint approvalCount = _incrementApprovalCount(
            _proposalId,
            nullifierHash
        );

        return approvalCount;
    }

    function rejectRecovery(uint _proposalId) public onlySafe {
        Proposal storage proposal = recoveryProposals[_proposalId];
        if (proposal.status == ProposalStatus.REJECTED) {
            revert("ALREADY_REJECTED");
        } else if (proposal.status == ProposalStatus.EXECUTED) {
            revert("ALREADY_EXECUTED");
        }
        proposal.status = ProposalStatus.REJECTED;
    }

    function execRecovery(uint _proposalId) public returns (bool) {
        getIsRecoveryExecutable(_proposalId);
        Proposal storage proposal = recoveryProposals[_proposalId];

        bool isNewThreshold = IGnosisSafe(safe).getThreshold() !=
            proposal.newThreshold;

        uint swapTimes = proposal.ownersReplaced.length;
        uint length = isNewThreshold ? swapTimes + 1 : swapTimes;

        SafeProtocolAction[] memory actions = new SafeProtocolAction[](length);

        bytes memory _data;
        for (uint i; i < swapTimes; i++) {
            _data = abi.encodeWithSelector(
                IGnosisSafe.swapOwner.selector,
                _getPrevOwner(
                    proposal.ownersReplaced[i],
                    proposal.ownersReplaced,
                    proposal.pendingNewOwners
                ),
                proposal.ownersReplaced[i],
                proposal.pendingNewOwners[i]
            );
            actions[i].to = payable(safe);
            actions[i].data = _data;
        }

        if (isNewThreshold) {
            actions[length - 1].to = payable(safe);
            actions[length - 1].data = abi.encodeWithSelector(
                IGnosisSafe.changeThreshold.selector,
                proposal.newThreshold
            );
        }

        SafeTransaction memory safeTx = SafeTransaction({
            actions: actions,
            nonce: IGnosisSafe(safe).nonce() + 1, // should be fiexed: this isn't abt account nonce
            metadataHash: metadataHash
        });

        try safeProtocolManager.executeTransaction(safe, safeTx) returns (
            bytes[] memory
        ) {} catch (bytes memory reason) {
            revert RECOVER_FAILED(reason);
        }

        lastExecutionTimestamp = block.timestamp;
        proposal.status = ProposalStatus.EXECUTED;
        return true;
    }

    function getIsRecoveryExecutable(
        uint _proposalId
    ) public view returns (bool) {
        require(_proposalId != 0 && _proposalId <= proposalCount, "INVALID_ID");
        Proposal storage proposal = recoveryProposals[_proposalId];

        if (
            proposal.recoveryType == RECOVERY_TYPE_K256 &&
            !isMethodEnabled[RECOVERY_TYPE_K256]
        ) {
            revert("K256_RECOVERY_NOT_ENABLED");
        } else if (
            proposal.recoveryType == RECOVERY_TYPE_P256 &&
            !isMethodEnabled[RECOVERY_TYPE_P256]
        ) {
            revert("P256_RECOVERY_NOT_ENABLED");
        } else if (
            proposal.recoveryType == RECOVERY_TYPE_SECRET &&
            !isMethodEnabled[RECOVERY_TYPE_SECRET]
        ) {
            revert("SECRET_RECOVERY_NOT_ENABLED");
        } else if (
            proposal.recoveryType == RECOVERY_TYPE_SOCIAL &&
            !isMethodEnabled[RECOVERY_TYPE_SOCIAL]
        ) {
            revert("SOCIAL_RECOVERY_NOT_ENABLED");
        }

        _validateAddressesAndThreshold(
            proposal.ownersReplaced,
            proposal.pendingNewOwners,
            proposal.newThreshold
        );

        if (proposal.status == ProposalStatus.REJECTED) {
            revert("ALREADY_REJECTED");
        } else if (proposal.status == ProposalStatus.EXECUTED) {
            revert("ALREADY_EXECUTED");
        }

        require(block.timestamp >= proposal.timeLockEnd, "TIMELOCK_NOT_ENDED");

        require(
            proposal.proposedTimestamp >= lastExecutionTimestamp,
            "PROPOSAL_EXPIRED"
        );

        if (
            proposal.recoveryType == RECOVERY_TYPE_SOCIAL &&
            proposal.approvalCount < approvalThreshold
        ) revert("INSUFFICIENT_APPROVAL_COUNT");

        return true;
    }

    function _validateAddressesAndThreshold(
        address[] memory _oldAddresses,
        address[] memory _newAddresses,
        uint _newThreshold
    ) internal view returns (uint) {
        require(_oldAddresses.length == _newAddresses.length, "UNEQUAL_LENGTH");

        address[] memory owners = IGnosisSafe(safe).getOwners();

        require(_oldAddresses.length <= owners.length, "INVALID_LENGTH");

        for (uint i; i < _oldAddresses.length; i++) {
            require(IGnosisSafe(safe).isOwner(_oldAddresses[i]), "NOT_OWNER");
            require(
                !IGnosisSafe(safe).isOwner(_newAddresses[i]),
                "ALDREDY_OWNER"
            );

            require(
                _newAddresses[i] != address(0) &&
                    _newAddresses[i] != SENTINEL_DELEGATES,
                "INVALID_ADDRESS"
            );
        }

        uint currenThreshold = IGnosisSafe(safe).getThreshold();
        uint newThreshold = _newThreshold != currenThreshold
            ? _newThreshold
            : currenThreshold;
        require(owners.length >= newThreshold, "INVALID_THRESHOLD");

        return newThreshold;
    }

    function _getPrevOwner(
        address _ownerReplaced,
        address[] memory _ownersReplaced,
        address[] memory _pendingNewOwners
    ) internal view returns (address) {
        address[] memory owners = IGnosisSafe(safe).getOwners();

        uint index;
        for (uint i; i < owners.length; i++) {
            if (owners[i] == _ownerReplaced) {
                index = i;
                break;
            }
        }

        address prevOwner = index == 0 ? SENTINEL_DELEGATES : owners[index - 1];

        for (uint i; i < _ownersReplaced.length; i++) {
            if (_ownersReplaced[i] == prevOwner) {
                prevOwner = _pendingNewOwners[i];
                break;
            }
        }

        return prevOwner;
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal view override {
        (newImplementation);
    }

    function requiresPermissions() external view returns (uint8 permissions) {
        return PLUGIN_PERMISSION_CALL_TO_SELF;
    }
}

