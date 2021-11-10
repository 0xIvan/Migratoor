import { ethers } from "ethers";

import { BigNumberish } from "@ethersproject/bignumber";

export const fromWeiFormatted = (wei: BigNumberish, decimals = 3): string => {
  const ether = +ethers.utils.formatEther(wei);
  return ether.toFixed(decimals);
};

export const toWei = (ether: string): BigNumberish =>
  ethers.utils.parseEther(ether);
