# safe-recovery-noir

<img width="150" alt="Screenshot 2023-06-11 at 9 53 19" src="https://github.com/porco-rosso-j/safe-recovery-noir/assets/88586592/b8e4854e-2e02-4801-aa18-0118d494553c">

## Introduction

A safe plugin that allows Safe owners to recover the ownership of the account in the case where they lose access to their Safe. All the recovery methods leverage Noir, a DSL for writing zero-knowledge proof circuits to help owners recover their account ownership in a secure and private manner.

#### Recovery Mechanism

Available recovery methods with zero-knowledge proofs of...

- TouchID: correct verification of the p256 ECDSA signature with a fingerprint (via WebAuthn).
- Shielded Backup Address: correct verification of the k256 ECDSA signature. Public keys are hidden(hashed).
- Social Recovery: correct verification of the k256 ECDSA signatures from private guardians.
- Secret Word: knowledge of a particular secret word to regain account ownership.
- (methods To be added: 2FA, email, and other biometrics)

This recovery app is built on top of [safe-core-protocol](https://github.com/5afe/safe-core-protocol), a modular smart account protocol so that Safe and other wallet apps can easily integrate to enhance the security of user funds. The recovery plugin performs a batched call that executes `swapOwner` and `changeThreshold` simultaneously to flexibly transfer the account authorities and change the multi-signature set-up.

## Test

Noir circuits  
```shell
cd circuits/{CIRCUIT_NAMME}
nargo test --show-output
nargo prove
nargo verify
```

Smart contracts  
```shell
forge build
forge test --match-contract RecoveryPluginNoirTest -vvv
```

## References

#### Past Projects

- [AnonAA](https://github.com/porco-rosso-j/zk-ecdsAA)
- [noir-browser-p255](https://github.com/porco-rosso-j/noir-browser-p256)
- [zksync-account-webauthn](https://github.com/porco-rosso-j/zksync-account-webauthn)

#### Others

- [Noir](https://noir-lang.org/)
- [Safe {Core} Protocol](https://docs.safe.global/safe-core-protocol/safe-core-protocol)
- [safe-core-protocol](https://github.com/5afe/safe-core-protocol)
