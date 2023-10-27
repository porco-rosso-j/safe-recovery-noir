import { useState } from "react"
import {Signer} from "ethers"
import Safe from '@safe-global/protocol-kit'

const useUserCredential = () => {
  const [safeAddress, setSafeAddress] = useState<string | null>('');
  const [safeSDK, setSafeSDK] = useState<any | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);

  const saveSafeAddress = (_safeAddress: string) => {
    setSafeAddress(_safeAddress);
  };

  const saveSafeSDK = (_safeSDK: any) => {
    setSafeSDK(_safeSDK);
  };

  const saveSigner = (_signer: Signer) => {
    setSigner(_signer);
  };

  const logout = () => {
    saveSafeAddress(null);
    saveSafeSDK(null);
    saveSigner(null);
  };


  return {
    safeAddress,
    safeSDK,
    signer,
    saveSafeAddress,
    saveSafeSDK,
    saveSigner,
    logout
  };
};

export default useUserCredential;