// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

//interface IGnosisSafe is IOwnerManager {
interface IGnosisSafe {
    function nonce() external view returns (uint);

    function isOwner(address owner) external view returns (bool);

    function addOwnerWithThreshold(address owner, uint256 _threshold) external;

    function removeOwner(
        address prevOwner,
        address owner,
        uint256 _threshold
    ) external;

    function swapOwner(
        address prevOwner,
        address oldOwner,
        address newOwner
    ) external;
}

// interface IOwnerManager {
//     function isOwner(address owner) external view returns (bool);

//     function addOwnerWithThreshold(address owner, uint256 _threshold) external;

//     function removeOwner(
//         address prevOwner,
//         address owner,
//         uint256 _threshold
//     ) external;

//     function swapOwner(
//         address prevOwner,
//         address oldOwner,
//         address newOwner
//     ) external;
// }
