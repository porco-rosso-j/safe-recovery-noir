// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import {WebAuthnHelper} from "../helper/WebAuthnHelper.sol";
import "./RecoverBase.sol";

contract WebAuthnRecover is RecoverBase {
    using WebAuthnHelper for bytes;
    address public webAuthnVerifier;
    bool public isWebAuthnRecoverEnabled;
    bytes32[] public pubkey;
    string public credentialId;

    function addWebAuthnRecover(
        uint _recoveryTimeLock,
        bytes32[] memory _pubkey,
        string memory _credentialId
    ) public {
        require(_pubkey.length != 0, "INVALID_PUBKEY");
        require(
            keccak256(abi.encodePacked(_credentialId)) !=
                keccak256(abi.encodePacked("")),
            "INVALID_CREDENTIAL_ID"
        );
        pubkey = _pubkey;
        credentialId = _credentialId;
        _addDelay(_recoveryTimeLock);
        isWebAuthnRecoverEnabled = true;
    }

    function removeWebAuthnRecover() public {
        require(isWebAuthnRecoverEnabled, "NOT_ENABLED");
        isWebAuthnRecoverEnabled = false;
    }

    function _computeMessage(
        bytes memory _webAuthnInputs
    ) internal pure returns (bytes32) {
        return WebAuthnHelper.computeMessage(_webAuthnInputs);
    }

    function _getPublicInputWebAuthn(
        bytes32 _message
    ) internal view returns (bytes32[] memory) {
        bytes32[] memory pubInputs = new bytes32[](96);

        for (uint256 i; i < 32; i++) {
            pubInputs[i] = pubkey[i];
            pubInputs[i + 32] = pubkey[i + 32];
            pubInputs[i + 64] = bytes32(uint(uint8(_message[i])));
        }

        return pubInputs;
    }
}
