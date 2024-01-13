pragma solidity ^0.8.17;

import {SafeProtocolRegistry} from "@safe-global/safe-core-protocol/contracts/SafeProtocolRegistry.sol";
import {SafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/SafeProtocolManager.sol";
import {SafeTestTools, DeployedSafe, SafeInstance, SafeTestLib} from "safe-tools/SafeTestTools.sol";
import {RecoveryPluginNoir} from "../src/RecoveryPluginNoir.sol";
import {RecoveryPluginNoirFactory} from "../src/RecoveryPluginNoirFactory.sol";

import {UltraVerifier as EcrecoverVerifier} from "../circuits/k256/contract/k256/plonk_vk.sol";
import {UltraVerifier as WebAuthnVerifier} from "../circuits/p256/contract/p256/plonk_vk.sol";
import {UltraVerifier as SecretVerifier} from "../circuits/secret/contract/secret/plonk_vk.sol";
import {UltraVerifier as SocialVerifier} from "../circuits/social/contract/social/plonk_vk.sol";

import {NoirHelper} from "./utils/NoirHelper.sol";
import "forge-std/console.sol";

contract RecoveryPluginNoirTest is SafeTestTools, NoirHelper {
    using SafeTestLib for SafeInstance;

    SafeProtocolRegistry public registry;
    SafeProtocolManager public manager;
    RecoveryPluginNoir public recoveryPlugin;
    RecoveryPluginNoirFactory public factory;
    DeployedSafe public safe;

    uint[] public privateKeys = [
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80,
        0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d,
        0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a,
        0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
    ];

    address[] public owners = [
        0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65,
        0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,
        0x70997970C51812dc3A010C7d01b50e0d17dc79C8,
        0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    ];

    address[] public newOwners = [
        0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc,
        0x976EA74026E726554dB657fA54763abd0C3a0aa9,
        0x14dC79964da2C08b23698B3D3cc7Ca32193d9955,
        0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f
    ];

    address public pluginOwner = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;

    bytes public proof;

    function setUp() public {
        SafeInstance memory safeInstance = _setupSafe(privateKeys, 1);
        safe = DeployedSafe(payable(address(safeInstance.safe)));

        address secretVerifier = address(new SecretVerifier());
        address webauthnVerifier = address(new WebAuthnVerifier());
        address ecrecoverVerifier = address(new EcrecoverVerifier());
        address socialVerifier = address(new SocialVerifier());

        registry = new SafeProtocolRegistry(pluginOwner);
        manager = new SafeProtocolManager(pluginOwner, address(registry));

        factory = new RecoveryPluginNoirFactory(
            address(manager),
            ecrecoverVerifier,
            webauthnVerifier,
            secretVerifier,
            socialVerifier
        );

        recoveryPlugin = RecoveryPluginNoir(
            factory.createRecoveryPluginNoir(
                address(safe),
                0 // salt
            )
        );

        vm.prank(pluginOwner);

        // register plugin
        registry.addModule(address(recoveryPlugin), uint8(1));

        // caller = safe
        vm.startPrank(address(safe));

        // enable Module
        safeInstance.enableModule(address(manager));

        bytes memory data = abi.encodeWithSelector(
            SafeProtocolManager.enablePlugin.selector,
            address(recoveryPlugin),
            2,
            address(safe) // as its safe tx, u need address at the tale of tx.
        );

        console.logBytes(data);
        safeInstance.execTransaction(address(manager), 0, data);

        // 3.4: set
        recoveryPlugin.addSecretRecover(45 days, secret_test);
        // should be rewritten: pedersen instead of keccak!

        recoveryPlugin.addWebAuthnRecover(
            45 days,
            publickey_x,
            publickey_y,
            "test"
        );

        recoveryPlugin.addEcrecoverRecover(45 days, hashedAddr);

        recoveryPlugin.addSocialRecover(45 days, 1, guardiansRoot);

        vm.stopPrank();

        bool isStaticProof = true;

        if (isStaticProof) {
            proof = readProof("secret", "secret");
        } else {
            proof = generateProofP256("circuits/proofs/p.proof", "p256");
        }
    }

    function test_invalid_add_secret_recover() public {
        vm.expectRevert("SENDER_NOT_SAFE");
        recoveryPlugin.addSecretRecover(45 days, secret_test);

        vm.startBroadcast(address(safe));

        vm.expectRevert("INVALID_HASH");
        recoveryPlugin.addSecretRecover(45 days, bytes32(0));

        // only in test
        // vm.expectRevert("DELAY_TOO_SHORT");
        // recoveryPlugin.addSecretRecover(15 days, secret_test);

        recoveryPlugin.removeSecretRecover();

        vm.expectRevert("NOT_ENABLED");
        recoveryPlugin.removeSecretRecover();

        vm.stopBroadcast();
    }

    function test_recovery_delay() public {
        vm.startBroadcast(newOwners[0]);

        address[] memory ownersReplaced = new address[](1);
        ownersReplaced[0] = owners[0];

        address[] memory newPendingOwners = new address[](1);
        newPendingOwners[0] = newOwners[0];

        recoveryPlugin.proposeSecretRecover(
            ownersReplaced,
            newPendingOwners,
            1, // 2 -> 1
            proof
        );

        // 0 days not enough
        vm.expectRevert("DELAY_NOT_EXPIRED");
        recoveryPlugin.execRecovery(1);

        // 30 days still not enough
        vm.warp(block.timestamp + 30 days);
        vm.expectRevert("DELAY_NOT_EXPIRED");
        recoveryPlugin.execRecovery(1);

        // 45 days + 1 seconds enough
        vm.warp(block.timestamp + 15 days);
        recoveryPlugin.execRecovery(1);
    }

    function test_recovery_rejected() public {
        address[] memory ownersReplaced = new address[](1);
        ownersReplaced[0] = owners[0];

        address[] memory newPendingOwners = new address[](1);
        newPendingOwners[0] = newOwners[0];

        vm.prank(newOwners[0]);
        recoveryPlugin.proposeSecretRecover(
            ownersReplaced,
            newPendingOwners,
            1, // 2 -> 1
            proof
        );

        vm.prank(address(safe));
        recoveryPlugin.rejectRecovery(1);

        vm.prank(address(safe));
        vm.expectRevert("ALREADY_REJECTED");
        recoveryPlugin.rejectRecovery(1);

        vm.warp(block.timestamp + 60 days);

        // 45 days + 1 seconds enough
        vm.prank(newOwners[0]);
        vm.expectRevert("PROPOSAL_REJECTED");
        recoveryPlugin.execRecovery(1);
    }

    function test_recovery_invalid_recoveryId() public {
        vm.startBroadcast(newOwners[0]);

        address[] memory ownersReplaced = new address[](1);
        ownersReplaced[0] = owners[0];

        address[] memory newPendingOwners = new address[](1);
        newPendingOwners[0] = newOwners[0];

        recoveryPlugin.proposeSecretRecover(
            ownersReplaced,
            newPendingOwners,
            1, // 2 -> 1
            proof
        );

        vm.warp(block.timestamp + 60 days);

        // 0 days not enough
        vm.expectRevert("INVALID_ID");
        recoveryPlugin.execRecovery(0);
    }

    function test_recovery_invalid_address() public {
        vm.startBroadcast(newOwners[0]);

        address[] memory ownersReplaced = new address[](2);
        ownersReplaced[0] = owners[0];

        address[] memory newPendingOwners = new address[](1);
        newPendingOwners[0] = newOwners[0];

        vm.expectRevert("UNEQUAL_LENGTH");
        recoveryPlugin.proposeSecretRecover(
            ownersReplaced,
            newPendingOwners,
            1, // 2 -> 1
            proof
        );

        address[] memory ownersReplaced1 = new address[](5);
        ownersReplaced1[0] = owners[0];
        ownersReplaced1[1] = owners[1];
        ownersReplaced1[2] = owners[2];
        ownersReplaced1[3] = owners[3];
        ownersReplaced1[4] = owners[0];

        address[] memory newPendingOwners1 = new address[](5);
        newPendingOwners1[0] = newOwners[0];
        newPendingOwners1[1] = newOwners[1];
        newPendingOwners1[2] = newOwners[2];
        newPendingOwners1[3] = newOwners[3];
        newPendingOwners1[4] = newOwners[0];

        vm.expectRevert("INVALID_LENGTH");
        recoveryPlugin.proposeSecretRecover(
            ownersReplaced1,
            newPendingOwners1,
            1, // 2 -> 1
            proof
        );

        address[] memory ownersReplaced2 = new address[](1);
        ownersReplaced2[0] = newOwners[0];

        vm.expectRevert("NOT_OWNER");
        recoveryPlugin.proposeSecretRecover(
            ownersReplaced2,
            newPendingOwners,
            1, // 2 -> 1
            proof
        );

        ownersReplaced2[0] = owners[0];
        newPendingOwners[0] = owners[0];

        vm.expectRevert("ALDREDY_OWNER");
        recoveryPlugin.proposeSecretRecover(
            ownersReplaced2,
            newPendingOwners,
            1, // 2 -> 1
            proof
        );

        ownersReplaced2[0] = owners[0];
        newPendingOwners[0] = address(0);

        vm.expectRevert("INVALID_ADDRESS");
        recoveryPlugin.proposeSecretRecover(
            ownersReplaced2,
            newPendingOwners,
            1, // 2 -> 1
            proof
        );

        ownersReplaced2[0] = owners[0];
        newPendingOwners[0] = address(0x1);

        vm.expectRevert("INVALID_ADDRESS");
        recoveryPlugin.proposeSecretRecover(
            ownersReplaced2,
            newPendingOwners,
            1, // 2 -> 1
            proof
        );

        ownersReplaced2[0] = owners[0];
        newPendingOwners[0] = newOwners[0];

        vm.expectRevert("INVALID_THRESHOLD");
        recoveryPlugin.proposeSecretRecover(
            ownersReplaced2,
            newPendingOwners,
            5, // invalid > owner length
            proof
        );
    }

    function test_recovery_single_swap() public {
        vm.startBroadcast(newOwners[0]);

        address[] memory ownersReplaced = new address[](1);
        ownersReplaced[0] = owners[2];

        address[] memory newPendingOwners = new address[](1);
        newPendingOwners[0] = newOwners[2];

        recoveryPlugin.proposeSecretRecover(
            ownersReplaced,
            newPendingOwners,
            1, // 2 -> 1
            proof
        );

        vm.warp(block.timestamp + 60 days);
        recoveryPlugin.execRecovery(1);

        address[] memory owners = safe.getOwners();
        assertEq(owners[2], newOwners[2]);

        uint newThreshold = safe.getThreshold();
        assertEq(newThreshold, 1);
    }

    function test_recovery_partial_swap() public {
        vm.startBroadcast(newOwners[0]);

        address[] memory ownersReplaced = new address[](2);
        ownersReplaced[0] = owners[1];
        ownersReplaced[1] = owners[3];

        address[] memory newPendingOwners = new address[](2);
        newPendingOwners[0] = newOwners[0];
        newPendingOwners[1] = newOwners[1];

        recoveryPlugin.proposeSecretRecover(
            ownersReplaced,
            newPendingOwners,
            1, // 2 -> 1
            proof
        );

        vm.warp(block.timestamp + 60 days);
        recoveryPlugin.execRecovery(1);

        address[] memory owners = safe.getOwners();
        assertEq(owners[1], newOwners[0]);
        assertEq(owners[3], newOwners[1]);

        uint newThreshold = safe.getThreshold();
        assertEq(newThreshold, 1);
    }

    function test_recovery_full_swap() public {
        vm.startBroadcast(newOwners[0]);

        address[] memory ownersReplaced = new address[](4);
        ownersReplaced[0] = owners[0];
        ownersReplaced[1] = owners[1];
        ownersReplaced[2] = owners[2];
        ownersReplaced[3] = owners[3];

        address[] memory newPendingOwners = new address[](4);
        newPendingOwners[0] = newOwners[0];
        newPendingOwners[1] = newOwners[1];
        newPendingOwners[2] = newOwners[2];
        newPendingOwners[3] = newOwners[3];

        recoveryPlugin.proposeSecretRecover(
            ownersReplaced,
            newPendingOwners,
            3, // 2 -> 1
            proof
        );

        // 60 days enough
        vm.warp(block.timestamp + 60 days);
        recoveryPlugin.execRecovery(1);

        address[] memory owners = safe.getOwners();
        assertEq(owners[0], newOwners[0]);
        assertEq(owners[1], newOwners[1]);
        assertEq(owners[2], newOwners[2]);
        assertEq(owners[3], newOwners[3]);

        uint newThreshold = safe.getThreshold();
        assertEq(newThreshold, 3);
    }

    // webatuhn
    function test_recovery_webauthn() public {
        vm.startBroadcast(newOwners[0]);

        address[] memory ownersReplaced = new address[](1);
        ownersReplaced[0] = owners[0];

        address[] memory newPendingOwners = new address[](1);
        newPendingOwners[0] = newOwners[0];

        bytes
            memory authenticatorData = hex"4fb20856f24a6ae7dafc2781090ac8477ae6e2bd072660236cc614c6fb7c2ea00500000000";
        string
            memory _clientData = "0x7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2236393765383535382d653138332d343931322d626633642d356262336162353335633565222c226f726967696e223a2268747470733a2f2f776562617574686e2e70617373776f72646c6573732e6964222c2263726f73734f726967696e223a66616c73657d";
        bytes memory clientData = vm.parseBytes(_clientData);
        bytes1 authenticatorDataFlagMask = bytes1(0x05);

        bytes memory webAuthnInputs = abi.encode(
            authenticatorData,
            authenticatorDataFlagMask,
            clientData,
            "697e8558-e183-4912-bf3d-5bb3ab535c5e",
            36
        );

        bytes
            memory signature = hex"879e8a6e942796074f8f4616e1c0e8d930ad39a55b4aef86f9f2dda25599435b6ff025a245eea7eaec68de376fec363a840973103c1cfde4702af8c19d07f6e9";

        vm.expectRevert(0x0711fcec); // PROOF_FAILURE in verifier
        recoveryPlugin.proposeWebAuthnRecover(
            ownersReplaced,
            newPendingOwners,
            1, // 2 -> 1
            proof,
            webAuthnInputs
        );

        bytes memory proof = readProof("p256", "p256");

        recoveryPlugin.proposeWebAuthnRecover(
            ownersReplaced,
            newPendingOwners,
            1, // 2 -> 1
            proof,
            webAuthnInputs
        );

        vm.warp(block.timestamp + 60 days);
        recoveryPlugin.execRecovery(1);

        address[] memory owners = safe.getOwners();
        assertEq(owners[0], newOwners[0]);

        uint newThreshold = safe.getThreshold();
        assertEq(newThreshold, 1);
    }

    // k256
    function test_recovery_k256() public {
        vm.startBroadcast(newOwners[0]);

        address[] memory ownersReplaced = new address[](1);
        ownersReplaced[0] = owners[0];

        address[] memory newPendingOwners = new address[](1);
        newPendingOwners[0] = newOwners[0];

        vm.expectRevert(0x0711fcec); // PROOF_FAILURE in verifier
        recoveryPlugin.proposeEcrecoverRecover(
            ownersReplaced,
            newPendingOwners,
            1, // 2 -> 1
            proof,
            convertUint8ToBytes32(hashed_message1)
        );

        bytes memory proof = readProof("k256", "k256");

        recoveryPlugin.proposeEcrecoverRecover(
            ownersReplaced,
            newPendingOwners,
            1, // 2 -> 1
            proof,
            convertUint8ToBytes32(hashed_message1)
        );

        vm.warp(block.timestamp + 60 days);
        recoveryPlugin.execRecovery(1);

        address[] memory owners = safe.getOwners();
        assertEq(owners[0], newOwners[0]);

        uint newThreshold = safe.getThreshold();
        assertEq(newThreshold, 1);
    }

    // - social
    function test_recovery_social_guardian_threshold_1() public {
        vm.startBroadcast(newOwners[0]);

        address[] memory ownersReplaced = new address[](1);
        ownersReplaced[0] = owners[0];

        address[] memory newPendingOwners = new address[](1);
        newPendingOwners[0] = newOwners[0];

        vm.expectRevert(0x0711fcec); // PROOF_FAILURE in verifier
        recoveryPlugin.proposeSocialRecover(
            ownersReplaced,
            newPendingOwners,
            1, // 2 -> 1
            proof,
            nullifierHash,
            convertUint8ToBytes32(hashed_message1)
        );

        bytes memory proof = readProof("social", "social1");

        (uint recoveryId, uint deadline) = recoveryPlugin.proposeSocialRecover(
            ownersReplaced,
            newPendingOwners,
            1, // 2 -> 1
            proof,
            nullifierHash,
            convertUint8ToBytes32(hashed_message1)
        );

        vm.warp(block.timestamp + 60 days);
        recoveryPlugin.execRecovery(recoveryId);

        address[] memory owners = safe.getOwners();
        assertEq(owners[0], newOwners[0]);

        uint newThreshold = safe.getThreshold();
        assertEq(newThreshold, 1);
    }

    // function test_recovery_social_guardian_threshold_2() public {
    //     vm.prank(address(safe));
    //     recoveryPlugin.addSocialRecover(45 days, 2, guardiansRoot1);

    //     vm.startBroadcast(newOwners[0]);

    //     address[] memory ownersReplaced = new address[](1);
    //     ownersReplaced[0] = owners[0];

    //     address[] memory newPendingOwners = new address[](1);
    //     newPendingOwners[0] = newOwners[0];

    //     bytes memory proof = readProof("social", "social1");
    //     (uint recoveryId, uint deadline) = recoveryPlugin.proposeSocialRecover(
    //         ownersReplaced,
    //         newPendingOwners,
    //         1, // 2 -> 1
    //         proof,
    //         nullifierHash,
    //         convertUint8ToBytes32(hashed_message1)
    //     );

    //     bytes memory proof2 = readProof("social", "social2");

    //     uint approvalCount = recoveryPlugin.approveSocialRecovery(
    //         recoveryId,
    //         proof2,
    //         nullifierHash2,
    //         convertUint8ToBytes32(hashed_message2)
    //     );

    //     vm.warp(block.timestamp + 60 days);
    //     recoveryPlugin.execRecovery(recoveryId);

    //     address[] memory owners = safe.getOwners();
    //     assertEq(owners[0], newOwners[0]);

    //     uint newThreshold = safe.getThreshold();
    //     assertEq(newThreshold, 1);
    // }
}
