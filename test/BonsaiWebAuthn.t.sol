// pragma solidity ^0.8.17;

// import {SafeProtocolRegistry, Enum as RegistryEnum} from "@safe-global/safe-core-protocol/contracts/SafeProtocolRegistry.sol";
// import {SafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/SafeProtocolManager.sol";
// import {SafeTestTools, DeployedSafe, SafeInstance, SafeTestLib} from "safe-tools/SafeTestTools.sol";
// import {BonsaiTest} from "bonsai-lib-sol/BonsaiTest.sol";
// import {IBonsaiRelay} from "bonsai-lib-sol/IBonsaiRelay.sol";
// import {BonsaiWebAuthnRecover, Enum} from "../src/webauthn/BonsaiWebAuthnRecover.sol";
// import {RecoveryModuleFactory} from "../src/RecoveryModuleFactory.sol";
// import "forge-std/console.sol";

// contract Recover is BonsaiTest, SafeTestTools {
//     using SafeTestLib for SafeInstance;

//     uint[] public PKs;
//     address public user = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
//     address public newOwner = 0xAB256C9d6aAE9ee6118A1531d43751996541799D;

//     function setUp() public withRelayMock {}

//     function testCall() public {
//         PKs.push(
//             0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
//         );

//         // 1: deploy Safe
//         SafeInstance memory safeInstance = _setupSafe(PKs, 1);
//         DeployedSafe safe = DeployedSafe(payable(address(safeInstance.safe)));

//         uint[2] memory pubkey = [
//             0x0873dcbc0494eccea0a842a731ac7f2804edff2786502dc64b78e2e119baa7a6,
//             0x30f46d04b51fc3fc97446d3ee8df91a0c0f4d64ce969fa416176b5ee95bc61e3
//         ];

//         // 2.0: deploy Safe Module Factory
//         bytes32 imageId = queryImageId("MAIN");
//         console.logBytes32(imageId);
//         RecoveryModuleFactory factory = new RecoveryModuleFactory(
//             address(MOCK_BONSAI_RELAY),
//             imageId
//         );

//         // 2.1: deploy Safe Module
//         BonsaiWebAuthnRecover bonsaiWebAuthn = BonsaiWebAuthnRecover(
//             factory.deployBonsaiWebAuthnRecovery(address(safe), pubkey, "")
//         );

//         console.logAddress(address(bonsaiWebAuthn));

//         vm.startBroadcast(address(safe));

//         // 2.2: deploy protocol-core from safe
//         SafeProtocolRegistry registry = new SafeProtocolRegistry(address(safe));
//         SafeProtocolManager manager = new SafeProtocolManager(
//             address(safe),
//             address(registry)
//         );

//         // 3.1: enable Module
//         //safeInstance.enableModule(address(bonsaiWebAuthn));
//         safeInstance.enableModule(address(manager));

//         // 3.2: register plugin
//         registry.addIntegration(
//             address(bonsaiWebAuthn),
//             RegistryEnum.IntegrationType.Plugin
//             // SafeProtocolRegistry.Enum.IntegrationType.Plugin
//         );

//         // 3.2: enable module on manager
//         manager.enablePlugin(address(bonsaiWebAuthn), true);

//         vm.stopBroadcast();

//         // 4: call bopnsai contract via bonsaiWebAuthn.sendTx
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

//         bytes memory _data = abi.encodeWithSelector(
//             safe.swapOwner.selector,
//             address(0x1),
//             user,
//             newOwner
//         );

//         // 4.2: call bonsai contract
//         vm.expectCall(
//             address(MOCK_BONSAI_RELAY),
//             abi.encodeWithSelector(IBonsaiRelay.requestCallback.selector)
//         );

//         bonsaiWebAuthn.sendTxToSafe(
//             address(safe),
//             0,
//             _data,
//             Enum.Operation.Call,
//             safe.nonce(),
//             address(manager),
//             webAuthnInputs,
//             signature
//         );

//         // Anticipate a callback invocation on the starter contract
//         vm.expectCall(
//             address(bonsaiWebAuthn),
//             abi.encodeWithSelector(bonsaiWebAuthn.addOwner.selector)
//         );

//         (bool success, ) = relayCallback();
//         require(success, "Callback failed");

//         address[] memory _newOwner = safeInstance.safe.getOwners();
//         assertEq(_newOwner[0], newOwner);
//     }
// }
