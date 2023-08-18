# safe-recovery-noir

## Introduction
A safe plugin that allows Safe owners to recover the ownership of the account in the case where they lose access to their Safe. All the recovery methods leverage Noir, a DSL for writing zero knowledge proof circuits to help owners recover their account ownership in a secure and private manner.  

#### Recovery Mechanism
Available recovery methods with zero-knowledge proofs of...
- Secret Word: knowledge of a particular secret word to regain account ownership.  
- TouchID: correct verification of the p256 ECDSA signature with a fingerprint (via WebAuthn).  
- Shielded Backup Address: correct verification of the k256 ECDSA signature. Public keys are hidden(hashed).
- Social Recovery: correct verification of the k256 ECDSA signatures from private guardians.
- (methods To be added: 2FA, email, and other biometrics)

This recovery app is built on top of [safe-core-protocol](https://github.com/5afe/safe-core-protocol) so that Safe apps and other wallet apps can easily integrate to increase the security of user funds. The recovery plugin carries out a batched call that executes `swapOwner` and `changeThreshold` functions simultaneously in the Safe contract to flexibly transfer the ownerships and multi-signature set-up.  

## Test

```shell
forge build
forge test --match-contract RecoveryPluginNoirTest -vvv 
```

## References

- [AnonAA](https://github.com/porco-rosso-j/zk-ecdsAA)
- [Noir](https://noir-lang.org/)
- [Safe {Core} Protocol](https://docs.safe.global/safe-core-protocol/safe-core-protocol)
