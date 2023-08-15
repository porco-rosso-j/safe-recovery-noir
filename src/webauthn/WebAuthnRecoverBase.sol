// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.17;

// import {IBonsaiRelay} from "bonsai-lib-sol/IBonsaiRelay.sol";
// import {BonsaiCallbackReceiver} from "bonsai-lib-sol/BonsaiCallbackReceiver.sol";
// import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
// import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
// import {SafeTransaction, SafeProtocolAction, SafeRootAccess} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";
// import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";
// import "./WebAuthnHelper.sol";

// contract Enum {
//     enum Operation {
//         Call,
//         DelegateCall
//     }
// }

// contract SafeWebAuthn is BonsaiCallbackReceiver, BasePluginWithEventMetadata {
//     error ChangeOwnerFailure(bytes reason);
//     using WebAuthnHelper for bytes;

//     // GnosisSafe public safe;
//     address public safe;

//     //public key
//     uint256[2] private publicKey;

//     /// @notice Image ID of the only zkVM binary to accept callbacks from.
//     bytes32 public immutable imageId;

//     /// @notice Gas limit set on the callback from Bonsai.
//     /// @dev Should be set to the maximum amount of gas your callback might reasonably consume.
//     uint64 private constant BONSAI_CALLBACK_GAS_LIMIT = 100000;

//     /// @notice Initialize the contract, binding it to a specified Bonsai relay and RISC Zero guest image.
//     //TODO make proxyable w/ initializer
//     constructor(
//         address _safe,
//         IBonsaiRelay bonsaiRelay,
//         bytes32 _imageId,
//         uint256[2] memory _publicKey
//     )
//         BonsaiCallbackReceiver(bonsaiRelay)
//         BasePluginWithEventMetadata(
//             PluginMetadata({
//                 name: "zkTouchID Recovery Plugin",
//                 version: "1.0.0",
//                 requiresRootAccess: true,
//                 iconUrl: "",
//                 appUrl: "https://github.com/porco-rosso-j/safemod-risc0-p256"
//             })
//         )
//     {
//         // safe = GnosisSafe(_safe);
//         safe = _safe;
//         imageId = _imageId;
//         publicKey = _publicKey;
//     }

//     //, bytes calldata _webAuthnInputs
//     function sendTxToSafe(
//         address _to,
//         uint256 _value,
//         bytes calldata _calldata,
//         Enum.Operation _operation,
//         uint _nonce,
//         address _manager,
//         bytes memory _webAuthnInputs,
//         bytes memory _signature // can be put into _webAuthnInputs;
//     ) public virtual returns (bool success) {
//         bytes32 message = WebAuthnHelper.computeMessage(_webAuthnInputs);

//         bytes memory data = abi.encode(
//             _to,
//             _value,
//             _calldata,
//             _operation,
//             _nonce,
//             _manager
//         );

//         bonsaiRelay.requestCallback(
//             imageId,
//             abi.encodePacked(publicKey, _signature, message, data),
//             address(this),
//             this.addOwner.selector,
//             BONSAI_CALLBACK_GAS_LIMIT
//         );
//     }

//     // function execute(
//     //     bool _success,
//     //     bytes memory _data
//     // ) external onlyBonsaiCallback(imageId) {
//     //     require(_success, "VERIFICATION_FAILED");
//     //     (
//     //         address _to,
//     //         uint256 _value,
//     //         bytes memory _calldata,
//     //         Enum.Operation _operation
//     //     ) = abi.decode(_data, (address, uint, bytes, Enum.Operation));

//     //     require(
//     //         safe.execTransactionFromModule(_to, _value, _calldata, _operation),
//     //         "MODULE_TX_FAILED"
//     //     );
//     // }

//     function addOwner(
//         bool _success,
//         bytes memory _data
//     ) external onlyBonsaiCallback(imageId) {
//         require(_success, "VERIFICATION_FAILED");
//         (
//             address _to,
//             uint256 _value,
//             bytes memory _calldata,
//             Enum.Operation _operation,
//             uint256 _nonce,
//             address manager
//         ) = abi.decode(
//                 _data,
//                 (address, uint, bytes, Enum.Operation, uint, address)
//             );

//         SafeProtocolAction memory action = SafeProtocolAction(
//             payable(safe),
//             _value,
//             _calldata
//         );

//         SafeRootAccess memory safeRoot = SafeRootAccess({
//             action: action,
//             nonce: _nonce,
//             metadataHash: metadataHash
//         });

//         try
//             ISafeProtocolManager(manager).executeRootAccess(
//                 ISafe(safe),
//                 safeRoot
//             )
//         returns (bytes memory) {} catch (bytes memory reason) {
//             revert ChangeOwnerFailure(reason);
//         }

//         // SafeProtocolAction[] memory actions = new SafeProtocolAction[](1);
//         // actions[0].to = payable(safe);
//         // actions[0].value = _value;
//         // actions[0].data = _calldata;

//         // SafeTransaction memory safeTx = SafeTransaction({
//         //     actions: actions,
//         //     nonce: _nonce,
//         //     metadataHash: metadataHash
//         // });

//         // try
//         //     ISafeProtocolManager(manager).executeTransaction(
//         //         ISafe(safe),
//         //         safeTx
//         //     )
//         // returns (bytes[] memory) {} catch (bytes memory reason) {
//         //     revert ChangeOwnerFailure(reason);
//         // }
//     }

//     function supportsInterface(
//         bytes4 interfaceId
//     ) external view returns (bool) {
//         return true;
//     }
// }
