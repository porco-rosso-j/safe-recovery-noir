// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.18;

import {ISafeProtocolHooks} from "@safe-global/safe-core-protocol/contracts/interfaces/Integrations.sol";

contract RecoveryHook is ISafeProtocolHooks {
    function preCheck(
        ISafe safe,
        SafeTransaction calldata tx,
        uint256 executionType,
        bytes calldata executionMeta
    ) external returns (bytes memory preCheckData) {}

    function preCheckRootAccess(
        ISafe safe,
        SafeRootAccess calldata rootAccess,
        uint256 executionType,
        bytes calldata executionMeta
    ) external returns (bytes memory preCheckData);

    function postCheck(
        ISafe safe,
        bool success,
        bytes calldata preCheckData
    ) external;
}
