// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

uint8 constant RECOVERY_TYPE_K256 = 0;
uint8 constant RECOVERY_TYPE_P256 = 1;
uint8 constant RECOVERY_TYPE_SECRET = 2;
uint8 constant RECOVERY_TYPE_SOCIAL = 3;

enum ProposalStatus {
    PROPOSED,
    EXECUTED,
    REJECTED
}
