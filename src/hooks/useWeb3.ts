import { ethers } from "ethers";
import { useEffect, useState } from "react";

export const useWeb3 = () => {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const connectWallet = async () => {
    await window.ethereum.request({
      method: "eth_requestAccounts",
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        await connectWallet();

        const _isConnected = window.ethereum.isConnected();
        const _account = await signer.getAddress();
        const _chainId = await signer.getChainId();
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
  }, [signer]);

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
