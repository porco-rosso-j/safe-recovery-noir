// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import {WebAuthnHelper} from "../helper/WebAuthnHelper.sol";
import "./RecoverBase.sol";

contract WebAuthnRecover is RecoverBase {
    using WebAuthnHelper for bytes;
    address public webAuthnVerifier;
    bool public isWebAuthnRecoverEnabled;
    bytes32[] public pubkeyForVerifier;
    bytes32 public pubkey_x;
    bytes32 public pubkey_y;
    string public credentialId;

    function addWebAuthnRecover(
        uint _recoveryTimeLock,
        bytes32[] memory _pubkeyForVerifier,
        bytes32 _pubkey_x,
        bytes32 _pubkey_y,
        string memory _credentialId
    ) public {
        //require(_pubkey.length != 0, "INVALID_PUBKEY");
        require(
            keccak256(abi.encodePacked(_credentialId)) !=
                keccak256(abi.encodePacked("")),
            "INVALID_CREDENTIAL_ID"
        );
        pubkeyForVerifier = _pubkeyForVerifier;
        pubkey_x = _pubkey_x;
        pubkey_y = _pubkey_y;
        credentialId = _credentialId;
        _setTimeLock(_recoveryTimeLock);
        isWebAuthnRecoverEnabled = true;
    }

    function removeWebAuthnRecover() public {
        require(isWebAuthnRecoverEnabled, "NOT_ENABLED");
        isWebAuthnRecoverEnabled = false;
    }

    function _computeMessage(
        bytes memory _webAuthnInputs
    ) public pure returns (bytes32) {
        return WebAuthnHelper.computeMessage(_webAuthnInputs);
    }

    function _getPublicInputWebAuthn(
        bytes32 _message
    ) internal view returns (bytes32[] memory) {
        bytes32[] memory pubInputs = new bytes32[](96);

        for (uint256 i; i < 32; i++) {
            pubInputs[i] = pubkeyForVerifier[i];
            pubInputs[i + 32] = pubkeyForVerifier[i + 32];
            pubInputs[i + 64] = bytes32(uint(uint8(_message[i])));
        }

        return pubInputs;
    }

    function getPubkeyXY() public view returns (bytes32, bytes32) {
        return (pubkey_x, pubkey_y);
    }

    // function convertBytesToBytes32Array(
    //     bytes memory data
    // ) public pure returns (bytes32[] memory) {
    //     uint256 dataLength = data.length;
    //     uint256 arrayLength = dataLength / 32;
    //     if (dataLength % 32 != 0) {
    //         // Ensure the data length is a multiple of 32 by padding with zeros if necessary
    //         arrayLength++;
    //     }

    //     bytes32[] memory result = new bytes32[](arrayLength);

    //     assembly {
    //         let source := add(data, 0x20) // Start at the first byte (skip the length prefix)
    //         for {
    //             let i := 0
    //         } lt(i, arrayLength) {
    //             i := add(i, 1)
    //         } {
    //             let word := mload(source)
    //             mstore(add(result, mul(i, 0x20), word)) // Store the word in the result array
    //             source := add(source, 0x20) // Move to the next 32-byte chunk
    //         }
    //     }

    //     return result;
    // }

    // function bytesToBytes32Array(
    //     bytes memory data
    // ) public pure returns (bytes32[] memory) {
    //     bytes32[] memory dataList = new bytes32[](32);
    //     // Start array index at 0
    //     uint256 index = 0;
    //     // Loop all 32 bytes segments
    //     for (uint256 i = 32; i <= data.length; i = i + 32) {
    //         bytes32 temp;
    //         // Get 32 bytes from data
    //         assembly {
    //             temp := mload(add(data, i))
    //         }
    //         // Add extracted 32 bytes to list
    //         dataList[index] = temp;
    //         index++;
    //     }
    //     // Return data list
    //     return (dataList);
    // }

    // function convertUint8ToBytes32(
    //     bytes32[] memory _array
    // ) public pure returns (bytes32[] memory) {
    //     bytes32[] memory array = new bytes32[](32);

    //     for (uint i; i < 32; i++) {
    //         array[i] = bytes32(uint256(_array[i]));
    //     }
    //     return array;
    // }
}
