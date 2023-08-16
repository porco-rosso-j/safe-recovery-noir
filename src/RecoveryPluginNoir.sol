// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction, SafeRootAccess} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";
import {BasePluginWithEventMetadata, PluginMetadata} from "../common/Base.sol";
import {IUltraVerifier} from "./interfaces/IUltraVerifier.sol";
import "forge-std/console.sol";
import {WebAuthnRecover} from "./recover/WebAuthnRecover.sol";
import {SecretRecover} from "./recover/SecretRecover.sol";

contract Enum {
    enum Operation {
        Call,
        DelegateCall
    }
}

contract RecoveryPluginNoir is UUPSUpgradeable, Initializable, BasePluginWithEventMetadata, SecretRecover {
    error PROOF_VERIFICATION_FAILED();
    error RECOVER_FAILED(bytes reason);

    address public safe;
    address public safeCoreManager;

    /// @notice Initialize the contract, binding it to a specified Bonsai relay and RISC Zero guest image.
    //TODO make proxyable w/ initializer
    // bytes32[32] memory _pubkey_y
    constructor(
        address _safe,
        address _safeCoreManager,
        address _webAuthnVerifier, // stored and passed by factory
        address _secretVerifeir
    )
        BasePluginWithEventMetadata(
            PluginMetadata({
                name: "zkTouchID Recovery Plugin",
                version: "1.0.0",
                requiresRootAccess: true,
                iconUrl: "",
                appUrl: "https://github.com/porco-rosso-j/safemod-risc0-p256"
            })
        )
    {
        // safe = GnosisSafe(_safe);
        safe = _safe;
        safeCoreManager = _safeCoreManager;
        webAuthnVerifier = _webAuthnVerifier;
        secretVerifeir = _secretVerifeir;
    }

    function initialize() 

    function execSecretRecover(
        bytes calldata _swapOwnerData,
        uint _nonce,
        address _manager,
        bytes memory _proof,
    ) public virtual returns (bool success) {

        bytes32[] memory publicInput = new bytes32[](1);
        publicInput[0] = hashed_secret;

        if (!verifier.verify(_proof, publicInput))
            revert PROOF_VERIFICATION_FAILED();

        SafeProtocolAction[] memory actions = new SafeProtocolAction[](1);
        actions[0].to = payable(safe);
        actions[0].value = 0;
        actions[0].data = _swapOwnerData;

        SafeTransaction memory safeTx = SafeTransaction({
            actions: actions,
            nonce: _nonce,
            metadataHash: metadataHash
        });

        try
            ISafeProtocolManager(_manager).executeTransaction(
                ISafe(safe),
                safeTx
            )
        returns (bytes[] memory) {} catch (bytes memory reason) {
            revert RECOVER_FAILED(reason);
        }

        return true;
    }

    function execWebAuthnRecover(
        bytes calldata _swapOwnerData,
        uint _nonce,
        address _manager,
        bytes memory _proof,
        bytes memory _webAuthnInputs
    ) public virtual returns (bool success) {
        bytes32 message = WebAuthnHelper.computeMessage(_webAuthnInputs);

        bytes32[] memory publicInputs = new bytes32[](64);
        publicInputs = getPublicInputWebAuthn(message);

        if (!verifier.verify(_proof, publicInputs))
            revert PROOF_VERIFICATION_FAILED();

        SafeProtocolAction[] memory actions = new SafeProtocolAction[](1);
        actions[0].to = payable(safe);
        actions[0].value = 0;
        actions[0].data = _swapOwnerData;

        SafeTransaction memory safeTx = SafeTransaction({
            actions: actions,
            nonce: _nonce,
            metadataHash: metadataHash
        });

        try
            ISafeProtocolManager(_manager).executeTransaction(
                ISafe(safe),
                safeTx
            )
        returns (bytes[] memory) {} catch (bytes memory reason) {
            revert RECOVER_FAILED(reason);
        }

        return true;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) external view returns (bool) {
        return true;
    }
}
