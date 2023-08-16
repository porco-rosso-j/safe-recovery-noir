// pragma solidity ^0.8.17;

// import {SafeProtocolRegistry, Enum as RegistryEnum} from "@safe-global/safe-core-protocol/contracts/SafeProtocolRegistry.sol";
// import {SafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/SafeProtocolManager.sol";
// import {SafeTestTools, DeployedSafe, SafeInstance, SafeTestLib} from "safe-tools/SafeTestTools.sol";
// import {NoirWebAuthnRecover, Enum} from "../src/webauthn/NoirWebAuthnRecover.sol";
// import {RecoveryModuleFactory} from "../src/RecoveryModuleFactory.sol";
// import "forge-std/console.sol";
// import {UltraVerifier} from "../circuits/contract/plonk_vk.sol";
// import {NoirHelper} from "./utils/NoirHelper.sol";

// contract NoirWebAuthnRecoverTest is SafeTestTools, NoirHelper {
//     using SafeTestLib for SafeInstance;

//     uint[] public PKs = [
//         0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
//     ];
//     address public user = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
//     address public newOwner = 0xAB256C9d6aAE9ee6118A1531d43751996541799D;

//     function setUp() public {}

//     function testCall() public {
//         // 1: deploy Safe
//         SafeInstance memory safeInstance = _setupSafe(PKs, 1);
//         DeployedSafe safe = DeployedSafe(payable(address(safeInstance.safe)));

//         // 1: deploy Verifier
//         address verifier = address(new UltraVerifier());

//         // 2.0: deploy Safe Module Factory
//         RecoveryModuleFactory factory = new RecoveryModuleFactory(verifier);
//         // 2.1: deploy Safe Module
//         NoirWebAuthnRecover noirWebAuthn = NoirWebAuthnRecover(
//             factory.deployNoirWebAuthnRecovery(
//                 address(safe),
//                 concatBytes32Array(pubkey_x, pubkey_y),
//                 ""
//             )
//         );

//         console.logAddress(address(noirWebAuthn));

//         vm.startBroadcast(address(safe));

//         // 2.2: deploy protocol-core from safe
//         SafeProtocolRegistry registry = new SafeProtocolRegistry(address(safe));
//         SafeProtocolManager manager = new SafeProtocolManager(
//             address(safe),
//             address(registry)
//         );

//         // 3.1: enable Module
//         //safeInstance.enableModule(address(noirWebAuthn));
//         safeInstance.enableModule(address(manager));

//         // 3.2: register plugin
//         registry.addIntegration(
//             address(noirWebAuthn),
//             RegistryEnum.IntegrationType.Plugin
//             // SafeProtocolRegistry.Enum.IntegrationType.Plugin
//         );

//         // 3.2: enable module on manager
//         manager.enablePlugin(address(noirWebAuthn), true);

//         vm.stopBroadcast();

//         // 4: call bopnsai contract via noirWebAuthn.sendTx
//         // 4.1: set up webauthn inputs
//         bytes
//             memory authenticatorData = hex"4fb20856f24a6ae7dafc2781090ac8477ae6e2bd072660236cc614c6fb7c2ea00500000000";
//         string
//             memory _clientData = "0x7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2236393765383535382d653138332d343931322d626633642d356262336162353335633565222c226f726967696e223a2268747470733a2f2f776562617574686e2e70617373776f72646c6573732e6964222c2263726f73734f726967696e223a66616c73657d";
//         bytes memory clientData = vm.parseBytes(_clientData);
//         bytes1 authenticatorDataFlagMask = bytes1(0x05);

//         bytes memory webAuthnInputs = abi.encode(
//             authenticatorData,
//             authenticatorDataFlagMask,
//             clientData,
//             "697e8558-e183-4912-bf3d-5bb3ab535c5e",
//             36
//         );

//         bytes
//             memory signature = hex"879e8a6e942796074f8f4616e1c0e8d930ad39a55b4aef86f9f2dda25599435b6ff025a245eea7eaec68de376fec363a840973103c1cfde4702af8c19d07f6e9";

//         // // create/read proof here... ! // //

//         // bytes memory proof = generateProofP256(
//         //     "circuits/proofs/p.proof",
//         //     "p256"
//         // );

//         bytes memory proof = readProof("main");

//         bytes memory _data = abi.encodeWithSelector(
//             safe.swapOwner.selector,
//             address(0x1),
//             user,
//             newOwner
//         );

//         uint nonce = safe.nonce();

//         noirWebAuthn.swapOwnerToRecoverSafe(
//             _data,
//             nonce,
//             address(manager),
//             proof,
//             webAuthnInputs
//         );

//         address[] memory _newOwner = safe.getOwners();
//         assertEq(_newOwner[0], newOwner);
//     }
// }
