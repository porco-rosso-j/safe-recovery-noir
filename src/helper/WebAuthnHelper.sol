// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0;

error InvalidAuthenticatorData();
error InvalidClientData();

library WebAuthnHelper {
    function computeMessage(
        bytes calldata _inputs
    ) public pure returns (bytes32) {
        (
            bytes memory authenticatorData,
            bytes1 authenticatorDataFlagMask,
            bytes memory clientData,
            string memory clientChallenge,
            uint clientChallengeDataOffset
        ) = decodeEncodedInputs(_inputs);

        // Let the caller check if User Presence (0x01) or User Verification (0x04) are set
        if (
            (authenticatorData[32] & authenticatorDataFlagMask) !=
            authenticatorDataFlagMask
        ) {
            revert InvalidAuthenticatorData();
        }

        bytes memory challengeExtracted = new bytes(
            bytes(clientChallenge).length
        );

        copyBytes(
            clientData,
            clientChallengeDataOffset,
            challengeExtracted.length,
            challengeExtracted,
            0
        );

        if (
            keccak256(abi.encodePacked(bytes(clientChallenge))) !=
            keccak256(abi.encodePacked(challengeExtracted))
        ) {
            revert InvalidClientData();
        }

        // Verify the signature over sha256(authenticatorData || sha256(clientData))
        bytes memory verifyData = new bytes(authenticatorData.length + 32);

        copyBytes(
            authenticatorData,
            0,
            authenticatorData.length,
            verifyData,
            0
        );

        copyBytes(
            abi.encodePacked(sha256(clientData)),
            0,
            32,
            verifyData,
            authenticatorData.length
        );

        return (sha256(verifyData));
    }

    function copyBytes(
        bytes memory _from,
        uint _fromOffset,
        uint _length,
        bytes memory _to,
        uint _toOffset
    ) internal pure returns (bytes memory _copiedBytes) {
        uint minLength = _length + _toOffset;
        require(_to.length >= minLength); // Buffer too small. Should be a better way?
        uint i = 32 + _fromOffset; // NOTE: the offset 32 is added to skip the `size` field of both bytes variables
        uint j = 32 + _toOffset;
        while (i < (32 + _fromOffset + _length)) {
            assembly {
                let tmp := mload(add(_from, i))
                mstore(add(_to, j), tmp)
            }
            i += 32;
            j += 32;
        }
        return _to;
    }

    function decodeEncodedInputs(
        bytes memory _inputs
    )
        public
        pure
        returns (bytes memory, bytes1, bytes memory, string memory, uint)
    {
        (
            bytes memory authenticatorData,
            bytes1 authenticatorDataFlagMask,
            bytes memory clientData,
            string memory clientChallenge,
            uint clientChallengeDataOffset
        ) = abi.decode(_inputs, (bytes, bytes1, bytes, string, uint));

        return (
            authenticatorData,
            authenticatorDataFlagMask,
            clientData,
            clientChallenge,
            clientChallengeDataOffset
        );
    }
}
