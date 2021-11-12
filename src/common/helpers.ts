import { ethers } from "ethers";

import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Fetcher, Token, WETH } from "@uniswap/sdk";

import { tokenList } from "../components/TokenList/tokenList";
import { EthChainId } from "../hooks/useWeb3";

export const fromWeiFormatted = (wei: BigNumberish, decimals = 3): string => {
  if (wei === undefined || wei === null) return "";
  const weiBn = BigNumber.from(wei);
  const ether = +ethers.utils.formatEther(weiBn);
  return ether.toFixed(decimals);
};

export const toWei = (ether: string): BigNumberish =>
  ethers.utils.parseEther(ether);

export const fetchToken = async (
  tokenAddress: string,
  chainId: number
): Promise<Token | undefined> => {
  try {
    return Fetcher.fetchTokenData(chainId, tokenAddress);
  } catch (err) {
    console.error(err);
  }
};

export const getContract = (
  contractAddress: string,
  abi: ethers.ContractInterface,
  provider?: ethers.providers.Provider
): ethers.Contract => {
  return new ethers.Contract(contractAddress, abi, provider);
};

export const getTokenSymbol = (tokenAddress: string, chainId: EthChainId) => {
  const token =
    tokenAddress === WETH[chainId].address
      ? WETH[chainId]
      : tokenList.find(
          (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
        );

  if (!token) return "N/A";
  return token.symbol;
};
