import { ethers } from "ethers";
import { useEffect, useState } from "react";

export type EthChainId = 1 | 3 | 4 | 5 | 42;

export const useWeb3 = () => {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState<EthChainId>(1);
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();

  const connectWallet = async () => {
    await window.ethereum.request({
      method: "eth_requestAccounts",
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        await connectWallet();
        const _provider = new ethers.providers.Web3Provider(window.ethereum);
        const _signer = _provider.getSigner();
        const _isConnected = window.ethereum.isConnected();
        const _account = await _signer.getAddress();
        const _chainId = await _signer.getChainId();

        setProvider(_provider);
        setSigner(_signer);
        setIsConnected(_isConnected);
        setAccount(_account);
        setChainId(_chainId as EthChainId);
      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, []);

  return {
    provider,
    signer,
    account,
    chainId,
    isConnected,
    connectWallet,
  };
};
