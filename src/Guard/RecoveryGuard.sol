// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.18;

import {Safe} from "@safe-global/safe-contracts/contracts/Safe.sol";
import {GuardManager} from "@safe-global/safe-contracts/contracts/base/GuardManager.sol";
import {Enum} from "@safe-global/safe-contracts/contracts/common/Enum.sol";

contract RecoveryGuard is BaseGuard {
    address public immutable allowedTarget;

    constructor(address target) {
        allowedTarget = target;
    }

    event ModuleTransasctionDetails(
        bytes32 indexed txHash,
        address to,
        uint256 value,
        bytes data,
        Enum.Operation operation,
        address module
    );

    fallback() external {
        // We don't revert on fallback to avoid issues in case of a Safe upgrade
        // E.g. The expected check method might change and then the Safe would be locked.
    }

    function checkTransaction(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address payable refundReceiver,
        bytes memory signatures,
        address msgSender
    ) external;

    // check if module inherits IRecoveryGuard interface that has
    //

    function checkModuleTransaction(
        address to,
        uint256 value,
        bytes memory data,
        Enum.Operation operation,
        address module
    ) external returns (bytes32 moduleTxHash) {
        // check selector
        // retrieve

        bytes4 selector = bytes4(data);
        if (selector == ADD_OWNER_W_THRESHOLD_SELECTOR) {} else if (
            selector == SWAP_OWNER_SELECTOR
        ) {} else if (selector == REMOVE_OWNER_SELECTOR) {} else if (
            selector == CHANGE_THRESHOLD_SELECTOR
        ) {}
    }

    function checkAfterExecution(bytes32 hash, bool success) external;

    function supportsInterface(
        bytes4 interfaceId
    ) external view virtual override returns (bool) {
        return
            interfaceId == type(Guard).interfaceId || // 0x945b8148
            interfaceId == type(IERC165).interfaceId; // 0x01ffc9a7
    }
}
