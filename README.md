# safe-recovery-noir

<img width="150" alt="Screenshot 2023-06-11 at 9 53 19" src="https://github.com/porco-rosso-j/safe-recovery-noir/assets/88586592/b8e4854e-2e02-4801-aa18-0118d494553c">

## Introduction

A safe plugin that allows Safe owners to recover account ownership in the case where they lose access to their Safe. All the recovery methods leverage Noir, a DSL for writing zero-knowledge proof circuits, to help owners recover their account in a secure and private manner.

#### Recovery Mechanisms

Available recovery methods:

- Private Backup Address Recovery:
  This method allows backup signer, whose eth address is hashed and stored in smart contract, to recover account by proving that the the hashed hidden address matches the the hash of an eth address that is ec-recovered with provided public keys, signature, and message in `k256` circuit.

- TouchID Recovery:
  This method allows for account recovery via the correct verification of ECDSA with p256 curve for a provided fingerprint signature generated through WebAuthn on user device.

- Secret Word Recovery:
  This method lets a user recover account by privately proving the knowledge of a particular secret word.

- Social Recovery:
  This method allows private guardians, whose eth addresses are included in a merkle root stored on smart contract, to recover account ownership by proving their membership in the merkle root. Recovery can successfully be executed if the suffcient number of guardians approve a proposed recovery.

- Other zk-powered methods to be explored:

1. 2FA,
2. email
3. other biometrics

This recovery app is built on top of [safe-core-protocol](https://github.com/5afe/safe-core-protocol), a modular smart account protocol so that Safe and other wallet apps can easily integrate to enhance the security of user funds. The recovery plugin performs a batched call that executes `swapOwner` and `changeThreshold` simultaneously to flexibly rearrange the account authority: replace `owners` and change `threshold`.

## Test

Noir circuits

```shell
cd circuits/recoveries/{CIRCUIT_NAME}
nargo test --show-output
nargo prove
nargo verify
```

Smart contracts

```shell
forge build
forge test --match-contract RecoveryPluginNoirTest -vvv
```

## Development

run forked goerli chain

```shell
anvil --fork-url goerli
forge script script/Deploy.s.sol:Deploy --rpc-url localhost --broadcast
```

start frontend

```shell
cd front
yarn
yarn start
```

## References

#### Past Projects

- [AnonAA](https://github.com/porco-rosso-j/zk-ecdsAA)
- [noir-browser-p256](https://github.com/porco-rosso-j/noir-browser-p256)
- [zksync-account-webauthn](https://github.com/porco-rosso-j/zksync-account-webauthn)

#### Others

- [Noir](https://noir-lang.org/)
- [Safe {Core} Protocol](https://docs.safe.global/safe-core-protocol/safe-core-protocol)
- [safe-core-protocol](https://github.com/5afe/safe-core-protocol)

## TODO

#### Milestone1: contract development

- done: update deps, `safe-core-protocol` and `nargo` to the latest
- done: implement social recovery
- done: tests

#### Milestone2: frontend development

- has all the basic methods
- activation of multiple recovery methods

#### Milestone3: testnet launch (Jan, 2024)

- invite users to the demo app
- add improvements based on the feedback
