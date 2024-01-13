pragma solidity 0.8.20;

import "forge-std/console.sol";

contract Inputs {
    bytes32 public secret_test =
        0x15a52a0d6f0eedd4f63d72cb8275ae6826dcd005eafee769658486a2d3c09e1d;

    bytes32 public hashedAddr =
        0x01e32ef55c3585d88ccf0201b61bd7dea1f69b13f251ba9082cf0cb190d47071;

    bytes32 public publickey_x =
        0x0873dcbc0494eccea0a842a731ac7f2804edff2786502dc64b78e2e119baa7a6;
    bytes32 public publickey_y =
        0x30f46d04b51fc3fc97446d3ee8df91a0c0f4d64ce969fa416176b5ee95bc61e3;

    bytes32 public guardiansRoot =
        0x11d01c0067d1e894a83c6ac6f935a31e250f9f723f71a4e53b24ae29f47213d2;

    bytes32 public guardiansRoot2 =
        0x159203bdb93e44c9069d2dea34abdc548c58f22de8a0aaf57f320576a7debb21;

    bytes32 public nullifierHash =
        0x2b8caa407eb3bc33aa3b46a6d20ec396dbece04566c10a5acdfdf91da95bc525;

    bytes32 public nullifierHash2 =
        0x2c859828f7a8f32a26583cbbbecc0b4ff84c1ce7ce336ae88ed68ff59cc13cca;

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
    ) public pure returns (bytes32[] memory) {
        bytes32[] memory array = new bytes32[](32);

        for (uint i; i < 32; i++) {
            array[i] = bytes32(uint256(_array[i]));
        }
        return array;
    }

    function convertUint8ToBytes32(
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

    // for ecrecover-k256
    uint8[] public pubkey = [
        131,
        24,
        83,
        91,
        84,
        16,
        93,
        74,
        122,
        174,
        96,
        192,
        143,
        196,
        95,
        150,
        135,
        24,
        27,
        79,
        223,
        198,
        37,
        189,
        26,
        117,
        63,
        167,
        57,
        127,
        237,
        117,
        53,
        71,
        241,
        28,
        168,
        105,
        102,
        70,
        242,
        243,
        172,
        176,
        142,
        49,
        1,
        106,
        250,
        194,
        62,
        99,
        12,
        93,
        17,
        245,
        159,
        97,
        254,
        245,
        123,
        13,
        42,
        165
    ];

    uint8[] public hashed_message1 = [
        82,
        154,
        122,
        115,
        3,
        254,
        180,
        9,
        84,
        23,
        70,
        63,
        179,
        211,
        86,
        72,
        32,
        88,
        133,
        119,
        7,
        93,
        100,
        22,
        177,
        234,
        251,
        240,
        46,
        87,
        132,
        171
    ];

    uint8[] public hashed_message2 = [
        177,
        17,
        43,
        11,
        139,
        235,
        22,
        235,
        36,
        180,
        78,
        126,
        94,
        48,
        173,
        44,
        242,
        66,
        14,
        127,
        220,
        122,
        119,
        7,
        239,
        3,
        155,
        154,
        124,
        162,
        106,
        33
    ];
}
