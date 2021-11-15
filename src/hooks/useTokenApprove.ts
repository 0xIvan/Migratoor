import { Signer } from "ethers";
import { useEffect, useState } from "react";

import { BigNumber } from "@ethersproject/bignumber";
import IUniswapV2ERC20 from "@uniswap/v2-core/build/IUniswapV2ERC20.json";

import { useContract } from "./useContract";
import { useWeb3 } from "./useWeb3";

export const useTokenApprove = (
  tokenAddress: string,
  spender: string,
  amount: string
) => {
  const { account, signer } = useWeb3();
  const [isApproved, setIsApproved] = useState(false);
  const tokenContract = useContract(tokenAddress, IUniswapV2ERC20.abi);

  useEffect(() => {
    const checkAllowance = async () => {
      try {
        const allowance = await tokenContract?.allowance(account, spender);

        if (allowance.gte(BigNumber.from(amount))) setIsApproved(true);
      } catch (err) {
        console.error(err);
      }
    };

    tokenContract && +amount && checkAllowance();
  }, [account, amount, spender, tokenContract]);

  const approve = async () => {
    try {
      const tx = await tokenContract
        ?.connect(signer as Signer)
        .approve(spender, amount);

      await tx.wait();

      setIsApproved(true);
    } catch (err) {
      console.error(err);
    }
  };

  return { isApproved, approve };
};
