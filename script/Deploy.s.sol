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

import "forge-std/Script.sol";

contract Deploy is Script {
    address deployerAddress = vm.envAddress("ADDRESS");
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    SafeProtocolRegistry public registry;
    SafeProtocolManager public manager;
    RecoveryPluginNoir public recoveryPlugin;
    RecoveryPluginNoirFactory public factory;
    DeployedSafe public safe;

    address public safeAddr = 0x786458FBFa964E34e417F305EDa3dbC02cA7a13D;

    function run() external {
        vm.startBroadcast(deployerPrivateKey);

        address secretVerifier = address(new SecretVerifier());
        address webauthnVerifier = address(new WebAuthnVerifier());
        address ecrecoverVerifier = address(new EcrecoverVerifier());
        address socialVerifier = address(new SocialVerifier());

        registry = new SafeProtocolRegistry(deployerAddress);
        manager = new SafeProtocolManager(deployerAddress, address(registry));
        factory = new RecoveryPluginNoirFactory(
            address(manager),
            ecrecoverVerifier,
            webauthnVerifier,
            secretVerifier,
            socialVerifier
        );

        recoveryPlugin = RecoveryPluginNoir(
            factory.createRecoveryPluginNoir(
                safeAddr,
                0 // salt
            )
        );

        registry.addModule(address(recoveryPlugin), 1);

        console.logString("recoveryPlugin");
        console.logAddress(address(recoveryPlugin));
        console.logString("factory");
        console.logAddress(address(factory));
        console.logString("manager");
        console.logAddress(address(manager));

        string memory path = "./front/src/scripts/constants/addresses.json";
        string memory valueKey = "contracts";

        address[] memory addrs = new address[](3);
        addrs[0] = (address(recoveryPlugin));
        addrs[1] = (address(factory));
        addrs[2] = (address(manager));

        string memory ss = vm.serializeAddress("", valueKey, addrs);
        vm.writeJson(ss, path);
    }
}
