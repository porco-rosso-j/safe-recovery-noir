pragma solidity 0.8.18;

import "forge-std/console.sol";

contract Inputs {
    uint8[] public pubkey_x = [
        8,
        115,
        220,
        188,
        4,
        148,
        236,
        206,
        160,
        168,
        66,
        167,
        49,
        172,
        127,
        40,
        4,
        237,
        255,
        39,
        134,
        80,
        45,
        198,
        75,
        120,
        226,
        225,
        25,
        186,
        167,
        166
    ];

    uint8[] public pubkey_y = [
        48,
        244,
        109,
        4,
        181,
        31,
        195,
        252,
        151,
        68,
        109,
        62,
        232,
        223,
        145,
        160,
        192,
        244,
        214,
        76,
        233,
        105,
        250,
        65,
        97,
        118,
        181,
        238,
        149,
        188,
        97,
        227
    ];

    uint8[] public signature = [
        135,
        158,
        138,
        110,
        148,
        39,
        150,
        7,
        79,
        143,
        70,
        22,
        225,
        192,
        232,
        217,
        48,
        173,
        57,
        165,
        91,
        74,
        239,
        134,
        249,
        242,
        221,
        162,
        85,
        153,
        67,
        91,
        111,
        240,
        37,
        162,
        69,
        238,
        167,
        234,
        236,
        104,
        222,
        55,
        111,
        236,
        54,
        58,
        132,
        9,
        115,
        16,
        60,
        28,
        253,
        228,
        112,
        42,
        248,
        193,
        157,
        7,
        246,
        233
    ];

    uint8[] public message = [
        137,
        176,
        207,
        34,
        13,
        133,
        76,
        21,
        244,
        143,
        220,
        18,
        201,
        230,
        9,
        192,
        75,
        133,
        105,
        73,
        233,
        97,
        9,
        164,
        200,
        116,
        62,
        82,
        146,
        207,
        62,
        147
    ];

    function convertUint8ToBytes32(
        uint8[] memory _array
    ) public pure returns (bytes32[] memory array) {
        for (uint i; i < _array.length; i++) {
            array[i] = bytes32(uint256(_array[i]));
        }
    }

    function concatBytes32Array(
        uint8[] memory _array1,
        uint8[] memory _array2
    ) public pure returns (bytes32[] memory) {
        bytes32[] memory array = new bytes32[](64);

        for (uint i; i < 32; i++) {
            array[i] = bytes32(uint256(_array1[i]));
            array[i + _array1.length] = bytes32(uint256(_array2[i]));
        }

        return array;
    }
}
