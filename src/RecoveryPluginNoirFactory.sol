// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {RecoveryPluginNoir} from "./RecoveryPluginNoir.sol";

contract RecoveryPluginNoirFactory {
    RecoveryPluginNoir public immutable recoveryPluginNoirImp;

    mapping(address => address) public safeToPlugins; // safe address => plugin address

    constructor() {
        recoveryPluginNoirImp = new RecoveryPluginNoir();
    }

    function createRecoveryPluginNoir(
        address _safe,
        address _safeProtocolManager,
        address _webAuthnVerifier,
        address _secretVerifier,
        address _ecrecoverVerifier,
        uint256 _salt
    ) public returns (RecoveryPluginNoir proxy) {
        address addr = getAddress(
            _safe,
            _safeProtocolManager,
            _webAuthnVerifier,
            _secretVerifier,
            _ecrecoverVerifier,
            _salt
        );
        uint codeSize = addr.code.length;
        if (codeSize > 0) {
            return RecoveryPluginNoir(payable(addr));
        }
        proxy = RecoveryPluginNoir(
            payable(
                new ERC1967Proxy{salt: bytes32(_salt)}(
                    address(recoveryPluginNoirImp),
                    abi.encodeCall(
                        RecoveryPluginNoir.initialize,
                        (
                            _safe,
                            _safeProtocolManager,
                            _webAuthnVerifier,
                            _secretVerifier,
                            _ecrecoverVerifier
                        )
                    )
                )
            )
        );

        safeToPlugins[_safe] = address(proxy);
    }

    /**
     * calculate the counterfactual address of this account as it would be returned by createAccount()
     */
    function getAddress(
        address _safe,
        address _safeProtocolManager,
        address _webAuthnVerifier,
        address _secretVerifier,
        address _ecrecoverVerifier,
        uint256 _salt
    ) public view returns (address) {
        return
            Create2.computeAddress(
                bytes32(_salt),
                keccak256(
                    abi.encodePacked(
                        type(ERC1967Proxy).creationCode,
                        abi.encode(
                            address(recoveryPluginNoirImp),
                            abi.encodeCall(
                                RecoveryPluginNoir.initialize,
                                (
                                    _safe,
                                    _safeProtocolManager,
                                    _webAuthnVerifier,
                                    _secretVerifier,
                                    _ecrecoverVerifier
                                )
                            )
                        )
                    )
                )
            );
    }

    function getPluginAddr(address _safe) public view returns (address) {
        return safeToPlugins[_safe];
    }
}
