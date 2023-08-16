pragma solidity ^0.8.17;

import {SafeProtocolRegistry, Enum as RegistryEnum} from "@safe-global/safe-core-protocol/contracts/SafeProtocolRegistry.sol";
import {SafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/SafeProtocolManager.sol";
import {SafeTestTools, DeployedSafe, SafeInstance, SafeTestLib} from "safe-tools/SafeTestTools.sol";
import {RecoveryPluginNoir} from "../src/RecoveryPluginNoir.sol";
import {RecoveryPluginNoirFactory} from "../src/RecoveryPluginNoirFactory.sol";

import {UltraVerifier as SecretVerifier} from "../circuits/secret/contract/plonk_vk.sol";
import {UltraVerifier as WebAuthnVerifier} from "../circuits/p256/contract/plonk_vk.sol";
import {NoirHelper} from "./utils/NoirHelper.sol";
import "forge-std/console.sol";

contract RecoveryPluginNoirTest is SafeTestTools, NoirHelper {
    using SafeTestLib for SafeInstance;

    uint[] public PKs = [
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    ];
    address public user = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address public newOwner = 0xAB256C9d6aAE9ee6118A1531d43751996541799D;

    function setUp() public {}

    function testCall() public {
        // 1: deploy Safe
        SafeInstance memory safeInstance = _setupSafe(PKs, 1);
        DeployedSafe safe = DeployedSafe(payable(address(safeInstance.safe)));

        // 1: deploy Verifier
        address secretVerifier = address(new SecretVerifier());
        address webauthnVerifier = address(new WebAuthnVerifier());

        // 2.0: deploy Safe Module Factory
        RecoveryPluginNoirFactory factory = new RecoveryPluginNoirFactory();

        // 2.2: deploy protocol-core from safe
        SafeProtocolRegistry registry = new SafeProtocolRegistry(
            // address(safe)
            user
        );
        SafeProtocolManager manager = new SafeProtocolManager(
            // address(safe),
            user,
            address(registry)
        );

        // 2.1: deploy Safe Module
        RecoveryPluginNoir recoveryPlugin = RecoveryPluginNoir(
            factory.createRecoveryPluginNoir(
                address(safe),
                address(manager),
                webauthnVerifier,
                secretVerifier,
                0 // salt
            )
        );

        console.logAddress(address(recoveryPlugin));

        // caller = service provider(user)
        vm.startBroadcast(user);

        // 3.2: register plugin
        registry.addIntegration(
            address(recoveryPlugin),
            RegistryEnum.IntegrationType.Plugin
        );

        vm.stopBroadcast();

        // caller = safe
        vm.startBroadcast(address(safe));

        // 3.1: enable Module
        safeInstance.enableModule(address(manager));

        // 3.2: enable module on manager
        manager.enablePlugin(address(recoveryPlugin), true);

        // 3.4: set
        string memory secret = "nyanko1589";
        recoveryPlugin.addSecretRecover(keccak256(bytes(secret)));

        vm.stopBroadcast();

        // bytes memory proof = generateProofP256(
        //     "circuits/proofs/p.proof",
        //     "p256"
        // );

        bytes memory proof = readProof("secret", "secret");

        recoveryPlugin.execSecretRecover(user, newOwner, proof);

        address[] memory _newOwner = safe.getOwners();
        assertEq(_newOwner[0], newOwner);
    }
}
