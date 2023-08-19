// import { utils } from "@passwordless-id/webauthn";
import * as ethers from "ethers"

export function randomChallenge() {
    return crypto.randomUUID()
}

export function isBase64url(txt) {
    return txt.match(/^[a-zA-Z0-9\-_]+=*$/) !== null
}

export function toBase64url(buffer) {
    const txt = btoa(parseBuffer(buffer)) // base64
    return txt.replaceAll('+', '-').replaceAll('/', '_')
}

export function parseBase64url(txt) {
    txt = txt.replaceAll('-', '+').replaceAll('_', '/') // base64url -> base64
    return toBuffer(atob(txt))
}

export function parseBuffer(buffer) {
    return String.fromCharCode(...new Uint8Array(buffer))
}

export function toBuffer(txt) {
    return Uint8Array.from(txt, c => c.charCodeAt(0)).buffer
}


export async function sha256(buffer) {
    return await crypto.subtle.digest('SHA-256', buffer)
}

export const data = {
    challenge: randomChallenge(),
    registerOptions: {
        authenticatorType: 'auto',
        userVerification: 'required',
        timeout: 0,
        attestation: false,
    },
    authOptions: {
        authenticatorType: 'auto',
        userVerification: 'required',
        timeout: 0,
    },
    algorithm: "ES256"
}

export async function derToRS(der) {
    var offset = 3;
    var dataOffset;

    if (der[offset] == 0x21) {
      dataOffset = offset + 2;
    }
    else {
      dataOffset = offset + 1;
    }
    const r = der.slice(dataOffset, dataOffset + 32);
    offset = offset + der[offset] + 1 + 1
    if (der[offset] == 0x21) {
      dataOffset = offset + 2;
    }
    else {
      dataOffset = offset + 1;
    }
    const s = der.slice(dataOffset, dataOffset + 32);
    return [ r, s ]
  }

export function bufferFromBase64(value) {
    return Buffer.from(value, "base64")
}

export function bufferToHex (buffer) {
    return ("0x").concat([...new Uint8Array (buffer)]
      .map (b => b.toString (16).padStart (2, "0"))
      .join (""));
}

export async function getKey(pubkey) {
    const algoParams = {
        name: 'ECDSA',
        namedCurve: 'P-256',
        hash: 'SHA-256',
      };
  return await crypto.subtle.importKey('spki', pubkey, algoParams, true, ['verify'])
}

export async function getCordinates(pubkey) {
    const pubKeyBuffer = bufferFromBase64(pubkey);
    const rawPubkey = await crypto.subtle.exportKey("jwk", await getKey(pubKeyBuffer))
    const { x, y } = rawPubkey;

    //return new Uint8Array(Buffer.concat([bufferFromBase64(x), bufferFromBase64(y)]))

    return [ 
    ethers.BigNumber.from(bufferToHex(bufferFromBase64(x))),
    ethers.BigNumber.from(bufferToHex(bufferFromBase64(y)))
    ]

}

export async function getSignature(_signature) {
    const signatureParsed = await derToRS(bufferFromBase64(_signature));

    console.log("bufferToHex(signatureParsed[0]): ", bufferToHex(signatureParsed[0]))
    console.log("bufferToHex(signatureParsed[1]): ", bufferToHex(signatureParsed[1]))
    console.log("bufferToHex(signatureParsed[1]): ", bufferToHex(signatureParsed[1]).slice(2))

    const signature = ethers.BigNumber.from(
        bufferToHex(signatureParsed[0]) 
        + bufferToHex(signatureParsed[1])
        .slice(2)
        )

    return signature;
}