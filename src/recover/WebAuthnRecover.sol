// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import {WebAuthnHelper} from "../helper/WebAuthnHelper.sol";
import "./RecoverBase.sol";
import {RECOVERY_TYPE_P256} from "../Common/Constants.sol";

contract WebAuthnRecover is RecoverBase {
    using WebAuthnHelper for bytes;
    // address public webAuthnVerifier;
    // bool public isWebAuthnRecoverEnabled;
    bytes32 public pubkey_x;
    bytes32 public pubkey_y;
    string public credentialId;

    function addWebAuthnRecover(
        uint _recoveryTimeLock,
        bytes32 _pubkey_x,
        bytes32 _pubkey_y,
        string memory _credentialId
    ) public onlySafe {
        require(
            _pubkey_x != bytes32(0) && _pubkey_y != bytes32(0),
            "INVALID_PUBKEY"
        );
        require(
            keccak256(abi.encodePacked(_credentialId)) !=
                keccak256(abi.encodePacked("")),
            "INVALID_CREDENTIAL_ID"
        );

        pubkey_x = _pubkey_x;
        pubkey_y = _pubkey_y;
        credentialId = _credentialId;
        _addRecoveryMethod(RECOVERY_TYPE_P256, _recoveryTimeLock);
    }

    function removeWebAuthnRecover() public onlySafe {
        pubkey_x = bytes32(0);
        pubkey_y = bytes32(0);
        credentialId = "";
        _removeRecoveryMethod(RECOVERY_TYPE_P256);
    }

    function _computeMessage(
        bytes memory _webAuthnInputs
    ) public pure returns (bytes32) {
        return WebAuthnHelper.computeMessage(_webAuthnInputs);
    }

    function _getPublicInputWebAuthn(
        bytes32 _message
    ) internal view returns (bytes32[] memory) {
        bytes32[] memory pubInputs = new bytes32[](32);

        for (uint256 i; i < 32; i++) {
            pubInputs[i] = bytes32(uint(uint8(_message[i])));
        }

        return pubInputs;
    }

    function getPubkeyXY() public view returns (bytes32, bytes32) {
        return (pubkey_x, pubkey_y);
    }
}
