import { ethers } from "ethers";
import { useEffect, useState } from "react";

export const useWeb3 = () => {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(1);
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
        setChainId(_chainId);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    init();
  }, []);

  return {
    provider,
    signer,
    loading,
    account,
    chainId,
    isConnected,
    connectWallet,
  };
};
