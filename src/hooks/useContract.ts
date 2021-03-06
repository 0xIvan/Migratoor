import { ethers } from "ethers";

import { getContract } from "../common/helpers";
import { useWeb3 } from "./useWeb3";

export const useContract = (
  contractAddress: string,
  abi: ethers.ContractInterface,
  altProvider?: ethers.providers.Provider
): ethers.Contract | null => {
  const { provider } = useWeb3();
  if (!contractAddress) return null;

  return getContract(contractAddress, abi, altProvider ?? provider);
};
