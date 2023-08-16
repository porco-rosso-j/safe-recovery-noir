// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// import {BonsaiWebAuthnRecover} from "./webauthn/BonsaiWebAuthnRecover.sol";
// import {IBonsaiRelay} from "bonsai-lib-sol/IBonsaiRelay.sol";
import {NoirWebAuthnRecover} from "./webauthn/NoirWebAuthnRecover.sol";

// will be proxy factory in the future.
contract RecoveryModuleFactory {
    // address public bonsaiRelay;
    // bytes32 public imageId;

    address public verifier;

    struct ModuleUserData {
        address moduleAddr;
        bytes32[] pubKeys;
        string credentialId;
    }

    mapping(address => ModuleUserData) public moduleUserData;

    // constructor(address _bonsaiRelay, bytes32 _imageId) {
    //     bonsaiRelay = _bonsaiRelay;
    //     imageId = _imageId;
    // }

    constructor(address _verifier) {
        verifier = _verifier;
    }

    function deployNoirWebAuthnRecovery(
        address _safe,
        bytes32[] memory _pubkey,
        // bytes32[32] memory _pubkey_y,
        string memory _credentialId
    ) public returns (address) {
        address _moduleAddr = address(
            new NoirWebAuthnRecover(_safe, verifier, _pubkey)
        );

        moduleUserData[_safe].moduleAddr = _moduleAddr;
        moduleUserData[_safe].pubKeys = _pubkey;
        moduleUserData[_safe].credentialId = _credentialId;

        return _moduleAddr;
    }

    // safe deployment function can be adderess
    // function deployBonsaiWebAuthnRecovery(
    //     address _safe,
    //     uint256[2] memory _pubKeys,
    //     string memory _credentialId
    // ) public returns (address) {
    //     address _moduleAddr = address(
    //         new BonsaiWebAuthnRecover(
    //             _safe,
    //             IBonsaiRelay(bonsaiRelay),
    //             imageId,
    //             _pubKeys
    //         )
    //     );

    //     moduleUserData[_safe].moduleAddr = _moduleAddr;
    //     moduleUserData[_safe].pubKeys = _pubKeys;
    //     moduleUserData[_safe].credentialId = _credentialId;

    //     return _moduleAddr;
    // }

    function getModuleUserData(
        address _safe
    ) public view returns (address, bytes32[] memory, string memory) {
        return (
            moduleUserData[_safe].moduleAddr,
            moduleUserData[_safe].pubKeys,
            moduleUserData[_safe].credentialId
        );
    }
}
