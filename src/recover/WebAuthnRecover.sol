// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import {WebAuthnHelper} from "../helper/WebAuthnHelper.sol";

contract WebAuthnRecover {
    using WebAuthnHelper for bytes;
    address public webAuthnVerifier;
    bool public isWebAuthnRecoverEnabled;

    //public key
    bytes32[] public pubkey;

    function addWebAuthnRecover(bytes32[] memory _pubkey) public {
        pubkey = _pubkey;
        isWebAuthnRecoverEnabled = true;
    }

    function removeWebAuthnRecover() public {
        require(isWebAuthnRecoverEnabled, "NOT_ENABLED");
    }

    function getPublicInputWebAuthn(
        bytes32 _message
    ) internal view returns (bytes32[] memory) {
        bytes32[] memory pubInputs = new bytes32[](64);

        for (uint256 i; i < 32; i++) {
            pubInputs[i] = pubkey[i];
            pubInputs[i + 32] = pubkey[i + 32];
        }

        return pubInputs;
    }
}
