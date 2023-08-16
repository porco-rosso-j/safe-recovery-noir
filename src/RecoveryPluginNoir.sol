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

    address public safe;
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

    function execWebAuthnRecover(
        address _oldAddress,
        address _newAddress,
        bytes memory _proof,
        bytes memory _webAuthnInputs
    ) public virtual returns (bool success) {
        require(isWebAuthnRecoverEnabled, "NOT_ENABLED");
        require(_checkAddresses(_oldAddress, _newAddress), "INVALID_ADRESS");

        bytes32 message = _computeMessage(_webAuthnInputs);

        bytes32[] memory publicInputs = new bytes32[](64);
        publicInputs = getPublicInputWebAuthn(message);

        if (!IUltraVerifier(webAuthnVerifier).verify(_proof, publicInputs))
            revert PROOF_VERIFICATION_FAILED();

        return _execSafeTx(_oldAddress, _newAddress);
    }

    function execSecretRecover(
        address _oldAddress,
        address _newAddress,
        bytes memory _proof
    ) public virtual returns (bool success) {
        require(isSecretRecoverEnabled, "NOT_ENABLED");
        require(_checkAddresses(_oldAddress, _newAddress), "INVALID_ADRESS");

        bytes32[] memory publicInputs = new bytes32[](32);
        publicInputs = hashed_secret;

        // for (uint i; i < publicInputs.length; i++) {
        //     console.logBytes32(publicInputs[i]);
        // }

        if (!IUltraVerifier(secretVerifeir).verify(_proof, publicInputs))
            revert PROOF_VERIFICATION_FAILED();

        return _execSafeTx(_oldAddress, _newAddress);
    }

    function _execSafeTx(
        address _oldAddress,
        address _newAddress
    ) internal returns (bool) {
        bytes memory _data = abi.encodeWithSelector(
            IGnosisSafe.swapOwner.selector,
            address(0x1),
            _oldAddress,
            _newAddress
        );

        SafeProtocolAction[] memory actions = new SafeProtocolAction[](1);
        actions[0].to = payable(safe);
        actions[0].value = 0;
        actions[0].data = _data;

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

    function _checkAddresses(
        address _oldAddress,
        address _newAddress
    ) internal view returns (bool) {
        if (_oldAddress == address(0) || _newAddress == address(0))
            return false;
        if (
            !IGnosisSafe(safe).isOwner(_oldAddress) ||
            IGnosisSafe(safe).isOwner(_newAddress)
        ) return false;
        return true;
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
