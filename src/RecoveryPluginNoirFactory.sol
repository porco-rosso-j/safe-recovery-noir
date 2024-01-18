// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {RecoveryPluginNoir} from "./RecoveryPluginNoir.sol";

contract RecoveryPluginNoirFactory is Ownable {
    RecoveryPluginNoir public immutable recoveryPluginNoirImp;

    address public safeProtocolManager;
    address public webAuthnVerifier;
    address public secretVerifier;
    address public ecrecoverVerifier;
    address public socialRecoverVerifier;

    mapping(address => address) public safeToPlugins; // safe address => plugin address

    constructor(
        address _safeProtocolManager,
        address _ecrecoverVerifier,
        address _webAuthnVerifier, // stored and passed by factory
        address _secretVerifier,
        address _socialRecoverVerifier
    ) {
        recoveryPluginNoirImp = new RecoveryPluginNoir();
        safeProtocolManager = _safeProtocolManager;
        ecrecoverVerifier = _ecrecoverVerifier;
        webAuthnVerifier = _webAuthnVerifier;
        secretVerifier = _secretVerifier;
        socialRecoverVerifier = _socialRecoverVerifier;
    }

    function setSafeProtocolManagerAddr(address _manager) public onlyOwner {
        require(_manager != address(0), "ZERO_ADDRESS");
        safeProtocolManager = _manager;
    }

    function setVerifier(
        uint _recoveryType,
        address _verifier
    ) public onlyOwner {
        require(_verifier != address(0), "ZERO_ADDRESS");
        if (_recoveryType == 0) {
            ecrecoverVerifier = _verifier;
        } else if (_recoveryType == 1) {
            webAuthnVerifier = _verifier;
        } else if (_recoveryType == 2) {
            secretVerifier = _verifier;
        } else if (_recoveryType == 3) {
            socialRecoverVerifier = _verifier;
        } else {
            revert("INVALID_TYPE");
        }
    }

    function createRecoveryPluginNoir(
        address _safe,
        uint256 _salt
    ) public returns (RecoveryPluginNoir proxy) {
        address addr = getAddress(_safe, _salt);
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
                            safeProtocolManager,
                            ecrecoverVerifier,
                            webAuthnVerifier,
                            secretVerifier,
                            socialRecoverVerifier
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
                                    safeProtocolManager,
                                    ecrecoverVerifier,
                                    webAuthnVerifier,
                                    secretVerifier,
                                    socialRecoverVerifier
                                )
                            )
                        )
                    )
                )
            );
    }

    function getPluginAddr(address _safe) public view returns (address) {
        return safeToPlugins[_safe];
        // safeToPlugins[_safe] == address(0) ? address(0) : afeToPlugins[_safe];
    }
}
