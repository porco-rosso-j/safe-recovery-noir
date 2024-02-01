// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

uint8 constant RECOVERY_TYPE_K256 = 1;
uint8 constant RECOVERY_TYPE_P256 = 2;
uint8 constant RECOVERY_TYPE_SECRET = 3;
uint8 constant RECOVERY_TYPE_SOCIAL = 4;

enum ProposalStatus {
    PROPOSED,
    EXECUTED,
    REJECTED
}
