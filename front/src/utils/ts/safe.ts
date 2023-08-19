import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import Safe, {SwapOwnerTxParams, ContractNetworksConfig} from "@safe-global/protocol-kit"
import { ethers} from 'ethers';
import addresses from '../addresses.json';
import RecoveryPlugin from "../../artifacts/RecoveryPluginNoir.json";
import RecoveryPluginFac from "../../artifacts/RecoveryPluginNoirFactory.json";
import SafeProtocolManager from "../../artifacts/SafeProtocolManager.json";
import { useEthers } from '@usedapp/core';

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")

export async function _enableModule(safeAddr: any, safeSDK: any, coordinates: any, credentialId:any):Promise<any> {
    // console.log("safeAddr: ", safeAddr)
    // console.log("coordinates: ", coordinates)
    // console.log("credentialId: ", credentialId)
    // const pluginAddr = await computeSafeModuleAddress(safeAddr, coordinates, credentialId);

    const enableModuletx = await safeSDK.createEnableModuleTx(addresses.safeProotcolManager)

    const managerIface = new ethers.utils.Interface(SafeProtocolManager.abi)
    const enablePluginTx = managerIface.encodeFunctionData("enablePlugin", [
        addresses.recoveryPlugin,
        true
    ])

    const pluginIface = new ethers.utils.Interface(RecoveryPlugin.abi)
    const addWebAuthnRecovTx = pluginIface.encodeFunctionData("addWebAuthnRecover", [
        5184000, // 60 days
        coordinates,
        credentialId
    ])

    const safeTransactionData: MetaTransactionData[] = [
        // 
        // enableModule(manager)
        {
            to: enableModuletx.data.to,
            data: enableModuletx.data.data,
            value: enableModuletx.data.value,
        },
        // enablePlugin(plugin)
        {
            to: addresses.safeProotcolManager,
            data: enablePluginTx,
            value: "0",
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
    const txResponse = await safeSDK.executeTransaction(safeTransaction)
    console.log("txResponse: ", txResponse)
    const res = await txResponse.transactionResponse?.wait()
    console.log("res:", res)
    return res;
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
