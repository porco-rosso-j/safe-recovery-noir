# safe-recovery-noir

## Introduction
A safe plugin that allows Safe owners to recover the ownership of the account in the case where they lose access to their Safe. All the recovery methods leverage Noir, a DSL for writing zero knowledge proof circuits to help owners recover their account ownership in a secure and private manner.  

Available recovery methods with zero-knowledge proofs of...
- Secret Word: knowledge of a particular secret word to regain account ownership.  
- TouchID: correct verification of the p256 ECDSA signature with a fingerprint (via WebAuthn).  
- Shielded Backup Address: correct verification of the k256 ECDSA signature. Public keys are hidden(hashed).
- Social Recovery: correct verification of the k256 ECDSA signatures from private guardians.
- (methods To be added: 2FA, email, and other biometrics)

This recovery app is built on top of [safe-core-protocol](https://github.com/5afe/safe-core-protocol) so that Safe apps and other wallet apps can easily integrate to increase the security of user funds. The recovery plugin can call `swapOwner` and `changeThreshold` functions in the Safe contract to flexibly transfer the ownership and multi-signature set-up.  



## References

- [AnonAA](https://github.com/porco-rosso-j/zk-ecdsAA)
- [Noir](https://noir-lang.org/)
- [Safe {Core} Protocol](https://docs.safe.global/safe-core-protocol/safe-core-protocol)
