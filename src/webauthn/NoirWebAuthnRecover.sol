// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction, SafeRootAccess} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";
import {BasePluginWithEventMetadata, PluginMetadata} from "../common//Base.sol";
import {WebAuthnHelper} from "../helper/WebAuthnHelper.sol";
import "../../circuits/contract/plonk_vk.sol";
import "forge-std/console.sol";

contract Enum {
    enum Operation {
        Call,
        DelegateCall
    }
}

contract NoirWebAuthnRecover is BasePluginWithEventMetadata {
    error PROOF_VERIFICATION_FAILED();
    error RECOVER_FAILED(bytes reason);
    using WebAuthnHelper for bytes;

    UltraVerifier public verifier;
    address public safe;

    //public key
    bytes32[] public pubkey;

    /// @notice Initialize the contract, binding it to a specified Bonsai relay and RISC Zero guest image.
    //TODO make proxyable w/ initializer
    // bytes32[32] memory _pubkey_y
    constructor(
        address _safe,
        address _verifier,
        bytes32[] memory _pubkey
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
        verifier = UltraVerifier(_verifier);
        pubkey = _pubkey;
    }

    function swapOwnerToRecoverSafe(
        bytes calldata _swapOwnerData,
        uint _nonce,
        address _manager,
        bytes memory _proof,
        bytes memory _webAuthnInputs
    ) public virtual returns (bool success) {
        bytes32 message = WebAuthnHelper.computeMessage(_webAuthnInputs);

        console.logBytes(_proof);
        bytes32[] memory publicInputs = new bytes32[](64);
        publicInputs = getPublicInput(message);

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

    // // b can just be bignumber
    // function setPubkey(
    //     bytes32[32] memory array1,
    //     bytes32[32] memory array2
    // ) public pure returns (bytes32[64] memory) {
    //     // bytes32[] memory pubkey_xy = new bytes32[](64);
    //     bytes32[64] memory pubkey_xy;

    //     for (uint i = 0; i < 32; i++) {
    //         pubkey_xy[i] = array1[i];
    //         pubkey_xy[i + 32] = array2[i];
    //     }

    //     return pubkey_xy;
    // }

    function getPublicInput(
        bytes32 _message
    ) public view returns (bytes32[] memory) {
        // bytes32[] memory pubInputs = new bytes32[](96);
        bytes32[] memory pubInputs = new bytes32[](64);

        console.logString("1");
        console.logBytes32(pubkey[0]);
        console.logString("2");
        console.logBytes32(pubkey[1]);
        console.logBytes32(pubkey[2]);
        console.logBytes32(pubkey[3]);

        for (uint256 i; i < 32; i++) {
            console.logUint(i);
            pubInputs[i] = pubkey[i];
            console.logUint(i + 32);
            pubInputs[i + 32] = pubkey[i + 32];
            console.logBytes32(pubInputs[i]);
            //pubInputs[i + 64] = bytes32(uint256(_message) >> (i * 8));
        }

        return pubInputs;
    }

    // // used for passing uint8array pubkey for publicInputs
    // function putPubKeyToPublicInputs(
    //     bytes32[] memory _pubkey_x,
    //     bytes32[] memory _pubkey_y
    // ) public pure returns (bytes32[] memory publicInputs) {
    //     publicInputs = new bytes32[](64);
    //     for (uint i = 0; i < _pubkey_x.length; i++) {
    //         publicInputs[i] = _pubkey_x[i];
    //     }

    //     for (uint i = 0; i < _pubkey_y.length; i++) {
    //         publicInputs[32 + i] = _pubkey_y[i];
    //     }

    //     return publicInputs;
    // }

    function supportsInterface(
        bytes4 interfaceId
    ) external view returns (bool) {
        return true;
    }

    // function execute(
    //     bool _success,
    //     bytes memory _data
    // ) external onlyBonsaiCallback(imageId) {
    //     require(_success, "VERIFICATION_FAILED");
    //     (
    //         address _to,
    //         uint256 _value,
    //         bytes memory _calldata,
    //         Enum.Operation _operation
    //     ) = abi.decode(_data, (address, uint, bytes, Enum.Operation));

    //     require(
    //         safe.execTransactionFromModule(_to, _value, _calldata, _operation),
    //         "MODULE_TX_FAILED"
    //     );
    // }

    // function addOwner(
    //     bool _success,
    //     bytes memory _data
    // ) external onlyBonsaiCallback(imageId) {
    //     require(_success, "VERIFICATION_FAILED");
    //     (
    //         address _to,
    //         uint256 _value,
    //         bytes memory _calldata,
    //         Enum.Operation _operation,
    //         uint256 _nonce,
    //         address manager
    //     ) = abi.decode(
    //             _data,
    //             (address, uint, bytes, Enum.Operation, uint, address)
    //         );

    //     SafeProtocolAction memory action = SafeProtocolAction(
    //         payable(safe),
    //         _value,
    //         _calldata
    //     );

    //     SafeRootAccess memory safeRoot = SafeRootAccess({
    //         action: action,
    //         nonce: _nonce,
    //         metadataHash: metadataHash
    //     });

    //     try
    //         ISafeProtocolManager(manager).executeRootAccess(
    //             ISafe(safe),
    //             safeRoot
    //         )
    //     returns (bytes memory) {} catch (bytes memory reason) {
    //         revert ChangeOwnerFailure(reason);
    //     }

    //     // SafeProtocolAction[] memory actions = new SafeProtocolAction[](1);
    //     // actions[0].to = payable(safe);
    //     // actions[0].value = _value;
    //     // actions[0].data = _calldata;

    //     // SafeTransaction memory safeTx = SafeTransaction({
    //     //     actions: actions,
    //     //     nonce: _nonce,
    //     //     metadataHash: metadataHash
    //     // });

    //     // try
    //     //     ISafeProtocolManager(manager).executeTransaction(
    //     //         ISafe(safe),
    //     //         safeTx
    //     //     )
    //     // returns (bytes[] memory) {} catch (bytes memory reason) {
    //     //     revert ChangeOwnerFailure(reason);
    //     // }
    // }
}
