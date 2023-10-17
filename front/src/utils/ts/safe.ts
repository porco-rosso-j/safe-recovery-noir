import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import Safe, {SwapOwnerTxParams, ContractNetworksConfig} from "@safe-global/protocol-kit"
import { ethers} from 'ethers';
import addresses from '../addresses.json';
import RecoveryPlugin from "../../artifacts/RecoveryPluginNoir.json";
import RecoveryPluginFac from "../../artifacts/RecoveryPluginNoirFactory.json";
import SafeProtocolManager from "../../artifacts/SafeProtocolManager.json";
import { useEthers } from '@usedapp/core';

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")

export async function _enableModule(safeAddr: string, safeSDK: any, coordinates: any, credentialId:any):Promise<any> {

    // console.log("safeAddr: ", safeAddr)
    // console.log("coordinates: ", coordinates)
    // console.log("credentialId: ", credentialId)
    // const pluginAddr = await computeSafeModuleAddress(safeAddr, coordinates, credentialId);

    const enableModuletx = await safeSDK.createEnableModuleTx(addresses.safeProotcolManager)

    const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi)
    const addWebAuthnRecovTx = pluginIface.encodeFunctionData("addWebAuthnRecover", [
        5184000, // 60 days
        coordinates,
        credentialId
    ])

    const safeTransactionData: MetaTransactionData[] = [
        // enableModule(manager)
        {
            to: enableModuletx.data.to,
            data: enableModuletx.data.data,
            value: enableModuletx.data.value,
        },
        // addWebAuthnRecover
        {
            to: addresses.recoveryPlugin,
            data: addWebAuthnRecovTx,
            value: "0"
        }
    ]

    const safeTransaction = await safeSDK.createTransaction({ safeTransactionData })
    console.log("safeTransaction: ", safeTransaction)
    const txResponse = await safeSDK.executeTransaction(safeTransaction, {gasLimit:300000})
    console.log("txResponse: ", txResponse)
    const res = await txResponse.transactionResponse?.wait()
    console.log("res:", res)
    //return res;

    const managerIface = new ethers.utils.Interface(SafeProtocolManager.abi)
    const enablePluginTx = managerIface.encodeFunctionData("enablePlugin", [
        addresses.recoveryPlugin,
        2
    ])

    console.log("enablePluginTx: ", enablePluginTx)
    const _data = ethers.utils.solidityPack(["bytes", "address"], [enablePluginTx, safeAddr])
    console.log("data: ", _data)

    const paddedAddress = ethers.utils.hexZeroPad(`0x${(safeAddr.slice(2, 32)).toString()}`, 32)
    console.log("paddedAddress: ", paddedAddress)
    const data = _data.concat(paddedAddress)
    
    //const data = "0x1ea246160000000000000000000000007CeAF780866DF731dFaF11A4406882Fe0a94a9ed0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000786458FBFa964E34e417F305EDa3dbC02cA7a13D"

           // enablePlugin(plugin)
    const enablePluginTxData: MetaTransactionData = {
            // to: addresses.safeProotcolManager,
            to: "0x876cadAF5BEebf0BD4a48bdb5016Af7fE4a2dE28",
            // data: enablePluginTx,
            data: data,
            value: "0",
        }
    
    const safeTransaction1 = await safeSDK.createTransaction(enablePluginTxData)
    console.log("safeTransaction: ", safeTransaction1)
    const txResponse1 = await safeSDK.executeTransaction(safeTransaction1, {gasLimit:300000})
    console.log("txResponse: ", txResponse1)
    const res1 = await txResponse1.transactionResponse?.wait()
    console.log("res:", res1)
    return res1;
}

export async function _proposeRecoveryWebAuthn(
    pluginAddr: string,
    oldOwnerAddresses:string[], 
    newOwnerAddresses:string[], 
    newThreshold: number,
    webauthnInputs: any,
    ) {

    const recoveryPlugin = new ethers.Contract(pluginAddr, RecoveryPlugin.abi, provider);
    let proof;

    try {
        const tx = await(
            await recoveryPlugin.proposeWebAuthnRecovery(
                oldOwnerAddresses,
                newOwnerAddresses,
                newThreshold,
                proof,
                webauthnInputs,
            {
                gasLimit: 1000000
            }
        )).wait()
        console.log("txhash: ", tx.transactionHash)
    } catch(e) {
        console.log("e: ", e)
    
    }
}

export async function _executeRecover(
    pluginAddr: string,
    recoveryId: number,
    ) {
    const recoveryPlugin = new ethers.Contract(pluginAddr, RecoveryPlugin.abi, provider);

    try {
        const tx = await(
            await recoveryPlugin.proposeWebAuthnRecovery(
                recoveryId,
            {
                gasLimit: 1000000
            }
        )).wait()
        console.log("txhash: ", tx.transactionHash)
    } catch(e) {
        console.log("e: ", e)
    
    }
}

export async function getSafePluginAddress(safeAddr: any):Promise<string> {
    const pluginFac = new ethers.Contract(addresses.recoveryPluginFac, RecoveryPluginFac.abi, provider);
    return await pluginFac.getPluginAddr(safeAddr);
}

export async function isPluginEnabled(pluginAddr: any):Promise<boolean> {
    const plugin = new ethers.Contract(pluginAddr, RecoveryPlugin.abi, provider);
    console.log("wat: ", await plugin.isWebAuthnRecoverEnabled())
    return await plugin.isWebAuthnRecoverEnabled();
}


export async function getCredentialID(pluginAddr: any):Promise<string> {
    const plugin = new ethers.Contract(pluginAddr, RecoveryPlugin.abi, provider);
    return await plugin.credentialId();
}
