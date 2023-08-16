// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract RecoveryBase {
    function _verifier() internal view virtual returns (address) {}
}
