import * as utils from './helper'
/**
 * Returns whether the device itself can be used as authenticator.
 */
export async function isLocalAuthenticator() {
    //return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    return true
}


async function getAuthAttachment(authType) {
    if(authType === "local")
        return "platform";
    if(authType === "roaming" || authType === "extern")
        return "cross-platform";
    if(authType === "both")
        return undefined // The webauthn protocol considers `null` as invalid but `undefined` as "both"!

    // the default case: "auto", depending on device capabilities
    try {
        if(await isLocalAuthenticator())
            return "platform"
        else
            return "cross-platform"
    } catch(e) {
        // might happen due to some security policies
        // see https://w3c.github.io/webauthn/#sctn-isUserVerifyingPlatformAuthenticatorAvailable
        return undefined // The webauthn protocol considers `null` as invalid but `undefined` as "both"!
    }
}



function getAlgoName(num) {
    switch(num) {
        case -7: return "ES256"
        // case -8 ignored to to its rarity
        case -257: return "RS256"
        default: throw new Error(`Unknown algorithm code: ${num}`)
    }
}


export async function register(username, challenge, options)  {
    options = options ?? {}

    if(!utils.isBase64url(challenge))
        throw new Error('Provided challenge is not properly encoded in Base64url')

    const creationOptions = {
        challenge: utils.parseBase64url(challenge),
        rp: {
            id: window.location.hostname,
            name: window.location.hostname
        },
        user: {
            id: await utils.sha256(new TextEncoder().encode(username)), // ID should not be directly "identifiable" for privacy concerns
            name: username,
            displayName: username,
        },
        pubKeyCredParams: [
            {alg: -7, type: "public-key"},   // ES256 (Webauthn's default algorithm)
            {alg: -257, type: "public-key"}, // RS256 (for Windows Hello and others)
        ],
        timeout: options.timeout ?? 60000,
        authenticatorSelection: {
            userVerification: options.userVerification ?? "required", // Webauthn default is "preferred"
            authenticatorAttachment: await getAuthAttachment(options.authenticatorType ?? "auto"),
        },
        attestation: "direct" // options.attestation ? "direct" : "none"
    }

    if(options.debug)
        console.debug(creationOptions)

    const credential = await navigator.credentials.create({publicKey: creationOptions}) //PublicKeyCredential
    
    if(options.debug)
        console.debug(credential)
   
    const response = credential.response // AuthenticatorAttestationResponse
    
    let registration = {
        username: username,
        credential: {
            id: credential.id,
            publicKey: utils.toBase64url(response.getPublicKey()),
            algorithm: getAlgoName(credential.response.getPublicKeyAlgorithm())
        },
        authenticatorData: utils.toBase64url(response.getAuthenticatorData()),
        clientData: utils.toBase64url(response.clientDataJSON),
    }

    if(options.attestation) {
        registration.attestationData = utils.toBase64url(response.attestationObject)
    }

    return registration
}


async function getTransports(authType) {
    const local  = ['internal']

    // 'hybrid' was added mid-2022 in the specs and currently not yet available in the official dom types
    // @ts-ignore
    const roaming = ['hybrid', 'usb', 'ble', 'nfc']
    
    if(authType === "local")
        return local
    if(authType == "roaming" || authType === "extern")
        return roaming
    if(authType === "both")
        return [...local, ...roaming]

    // the default case: "auto", depending on device capabilities
    try {
        if(await isLocalAuthenticator())
            return local
        else
            return roaming
    } catch(e) {
        return [...local, ...roaming]
    }
}

export async function authenticate(credentialIds, challenge, options) {
    options = options ?? {}

    if(!utils.isBase64url(challenge))
        throw new Error('Provided challenge is not properly encoded in Base64url')

    const transports = await getTransports(options.authenticatorType ?? "auto");

    let authOptions = {
        challenge: utils.parseBase64url(challenge),
        rpId: window.location.hostname,
        allowCredentials: credentialIds.map(id => { return {
            id: utils.parseBase64url(id),
            type: 'public-key',
            transports: transports,
        }}),
        userVerification: options.userVerification ?? "required",
        timeout: options.timeout ?? 60000,
    }

    if(options.debug)
        console.debug(authOptions)

    let auth = await navigator.credentials.get({publicKey: authOptions})
    
    if(options.debug)
        console.debug(auth)

    const response = auth.response 
    
    const authentication = {
        credentialId: auth.id,
        //userHash: utils.toBase64url(response.userHandle), // unreliable, optional for authenticators
        authenticatorData: utils.toBase64url(response.authenticatorData),
        clientData: utils.toBase64url(response.clientDataJSON),
        signature: utils.toBase64url(response.signature),
    }

    return authentication
}

