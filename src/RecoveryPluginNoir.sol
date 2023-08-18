// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// openzeppelin modules for proxy upgradability
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

// import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
import {ISafe, ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";
import {BasePluginWithEventMetadata, PluginMetadata} from "./common/Base.sol";

// interfaces
import {IGnosisSafe} from "./interfaces/IGnosisSafe.sol";
import {IUltraVerifier} from "./interfaces/IUltraVerifier.sol";

// recovery contracts
import {WebAuthnRecover} from "./recover/WebAuthnRecover.sol";
import {SecretRecover} from "./recover/SecretRecover.sol";

import "forge-std/console.sol";

contract RecoveryPluginNoir is
    UUPSUpgradeable,
    Initializable,
    BasePluginWithEventMetadata,
    WebAuthnRecover,
    SecretRecover
{
    error PROOF_VERIFICATION_FAILED();
    error RECOVER_FAILED(bytes reason);

    ISafeProtocolManager public safeProtocolManager;

    constructor() {}

    function initialize(
        address _safe,
        address _safeProtocolManager,
        address _webAuthnVerifier, // stored and passed by factory
        address _secretVerifeir
    ) public initializer {
        _initializeBasePluginWithEventMetadata(
            PluginMetadata({
                name: "Safe Recovery Plugin",
                version: "1.0.0",
                requiresRootAccess: true,
                iconUrl: "",
                appUrl: "https://github.com/porco-rosso-j"
            })
        );
        safe = _safe;
        safeProtocolManager = ISafeProtocolManager(_safeProtocolManager);
        webAuthnVerifier = _webAuthnVerifier;
        secretVerifeir = _secretVerifeir;
    }

    function proposeWebAuthnRecover(
        address[] memory _oldAddresses,
        address[] memory _newAddresses,
        uint _newThreshold,
        bytes memory _proof,
        bytes memory _webAuthnInputs
    ) public returns (uint, uint) {
        require(msg.sender != safe, "INVALID_SENDER");
        require(isWebAuthnRecoverEnabled, "NOT_ENABLED");

        uint newThreshold = _validateAddressesAndThreshold(
            _oldAddresses,
            _newAddresses,
            _newThreshold
        );

        bytes32 message = _computeMessage(_webAuthnInputs);

        bytes32[] memory publicInputs = new bytes32[](96);
        publicInputs = _getPublicInputWebAuthn(message);

        if (!IUltraVerifier(webAuthnVerifier).verify(_proof, publicInputs))
            revert PROOF_VERIFICATION_FAILED();

        return _proposeRecovery(_oldAddresses, _newAddresses, newThreshold);
    }

    function proposeSecretRecover(
        address[] memory _oldAddresses,
        address[] memory _newAddresses,
        uint _newThreshold,
        bytes memory _proof
    ) public returns (uint, uint) {
        require(msg.sender != safe, "INVALID_SENDER");
        require(isSecretRecoverEnabled, "NOT_ENABLED");

        uint newThreshold = _validateAddressesAndThreshold(
            _oldAddresses,
            _newAddresses,
            _newThreshold
        );

        bytes32[] memory publicInputs = new bytes32[](32);
        publicInputs = hashed_secret;

        if (!IUltraVerifier(secretVerifeir).verify(_proof, publicInputs))
            revert PROOF_VERIFICATION_FAILED();

        return _proposeRecovery(_oldAddresses, _newAddresses, newThreshold);
    }

    function rejectRecovery(uint _recoveryId) public onlySafe {
        Recovery storage recovery = recoveries[_recoveryId];
        if (recovery.rejected) revert("ALREADY_REJECTED");
        recovery.rejected = true;
    }

    function execRecovery(uint _recoveryId) public returns (bool) {
        require(_recoveryId != 0, "INVALID_RECOVERY_ID");

        Recovery memory recovery = recoveries[_recoveryId];
        require(!recovery.rejected, "PROPOSAL_REJECTED");
        require(block.timestamp >= recovery.deadline, "DELAY_NOT_EXPIRED");

        bool isNewThreshold = IGnosisSafe(safe).getThreshold() !=
            recovery.newThreshold;

        uint swapTimes = recovery.ownersReplaced.length;
        uint length = isNewThreshold ? swapTimes + 1 : swapTimes;

        SafeProtocolAction[] memory actions = new SafeProtocolAction[](length);

        bytes memory _data;
        for (uint i; i < swapTimes; i++) {
            _data = abi.encodeWithSelector(
                IGnosisSafe.swapOwner.selector,
                _getPrevOwner(
                    recovery.ownersReplaced[i],
                    recovery.ownersReplaced,
                    recovery.pendingNewOwners
                ),
                recovery.ownersReplaced[i],
                recovery.pendingNewOwners[i]
            );
            actions[i].to = payable(safe);
            actions[i].data = _data;
        }

        if (isNewThreshold) {
            actions[length - 1].to = payable(safe);
            actions[length - 1].data = abi.encodeWithSelector(
                IGnosisSafe.changeThreshold.selector,
                recovery.newThreshold
            );
        }

        SafeTransaction memory safeTx = SafeTransaction({
            actions: actions,
            nonce: IGnosisSafe(safe).nonce(),
            metadataHash: metadataHash
        });

        try
            safeProtocolManager.executeTransaction(ISafe(safe), safeTx)
        returns (bytes[] memory) {} catch (bytes memory reason) {
            revert RECOVER_FAILED(reason);
        }

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

            // would ensure no duplication in new addresses here if possible
            // but as its hard to implement, just igore it and let have contract check it
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

    function supportsInterface(
        bytes4 interfaceId
    ) external view returns (bool) {
        return true;
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal view override {
        (newImplementation);
        //_onlySelf();
    }
}