# safe-recovery-noir

<img width="150" alt="Screenshot 2023-06-11 at 9 53 19" src="https://github.com/porco-rosso-j/safe-recovery-noir/assets/88586592/b8e4854e-2e02-4801-aa18-0118d494553c">

## Introduction

A safe plugin that allows Safe owners to recover account ownership in the case where they lose access to their Safe. All the recovery methods leverage Noir, a DSL for writing zero-knowledge proof circuits, to help owners recover their account in a secure and private manner.

This product is developed as a grantee of the Safe Grant Program Wave I. Here is [the proposal on Safe Grant website](https://app.charmverse.io/safe-grants-program/page-43692424934796636) and [Announcement](https://t.co/Pdc4Pxvg3s).

#### Recovery Mechanisms

Available recovery methods:

- Private Backup Address Recovery:
  This method allows backup signer, whose eth address is hashed and stored in smart contract, to recover account by proving that the the hashed hidden address matches the the hash of an eth address that is ec-recovered with provided public keys, signature, and message in k256 circuit.

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

- Noir version: `0.19.2+47f0130c0d154f1b70eb23f376783beb3f23ad72`

- To install

```shell
noirup -v 0.19.2
```

- Nargo commands

```shell
cd circuits/{CIRCUIT_NAME}
nargo compile
nargo test --show-output
nargo prove
nargo verify
```

Smart contracts

```shell
forge build
forge test --match-contract RecoveryPluginNoirTest -vvv
```

## Deploy

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

### Deployment

[https://safe-recover-noir.netlify.app/](https://safe-recover-noir.netlify.app/)

#### Goerli

- SafeProtocolRegistry: `0xDF2D7534b67d5a5130F998c1368D980c82FdD99f`
- SafeProtocolManager: `0xC5C5aeF4A4E0fB216e64BA63D5A1C3022ac4CDB8`
- SafeRecoverFactory: `0xfA98364994203058cd994E87BE2Af9ee92A407fD`

## References

#### Past Projects

- [AnonAA](https://github.com/porco-rosso-j/zk-ecdsAA)
- [noir-browser-p256](https://github.com/porco-rosso-j/noir-browser-p256)
- [zksync-account-webauthn](https://github.com/porco-rosso-j/zksync-account-webauthn)

#### Others

- [Noir](https://noir-lang.org/)
- [Safe {Core} Protocol](https://docs.safe.global/safe-core-protocol/safe-core-protocol)
- [safe-core-protocol](https://github.com/5afe/safe-core-protocol)
