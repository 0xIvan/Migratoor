import { BigNumber, ethers, Signer } from "ethers";
import { useCallback } from "react";

import { splitSignature } from "@ethersproject/bytes";
import { Pair, TokenAmount } from "@uniswap/sdk";
import IUniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json";

import sushiRollInterface from "../abi/sushiRoll.json";
import { getContract, toWei } from "../common/helpers";
import { useContract } from "./useContract";
import { useWeb3 } from "./useWeb3";

export const useSushiRoll = (
  token0Address: string,
  token1Address: string,
  totalSupply: TokenAmount
) => {
  const sushiRollAddress = "0xCaAbdD9Cf4b61813D4a52f980d6BC1B713FE66F5";
  const sushiRollInstance = useContract(sushiRollAddress, sushiRollInterface);
  const { provider, account, signer, chainId } = useWeb3();

  const ttl = Math.floor(new Date().getTime() / 1000) + 60 * 10;

  const getNonce = useCallback(
    async (tokenAddress: string) => {
      const pairInstance = getContract(
        tokenAddress,
        IUniswapV2Pair.abi,
        provider
      );
      const accountNonce = await pairInstance.nonces(account);
      return +accountNonce;
    },
    [account, provider]
  );

  const getMigrateArgs = useCallback(
    (pair: Pair, amount: string) => {
      const liquidity = new TokenAmount(pair.liquidityToken, amount);

      const amountAMin = pair.getLiquidityValue(
        pair.token0,
        totalSupply,
        liquidity
      );
      const amountBMin = pair.getLiquidityValue(
        pair.token1,
        totalSupply,
        liquidity
      );

      const args = [
        token0Address,
        token1Address,
        amount,
        amountAMin.raw.toString(),
        amountBMin.raw.toString(),
      ];

      return args;
    },
    [token0Address, token1Address, totalSupply]
  );

  const migrate = useCallback(
    async (pair: Pair, amount: string) => {
      try {
        const args = getMigrateArgs(pair, amount);

        const tx = await sushiRollInstance
          ?.connect(signer as Signer)
          .migrate(...args, ttl, {
            gasLimit: 1000000,
          });

        await tx.wait();
      } catch (err) {
        console.error(err);
      }
    },
    [getMigrateArgs, signer, sushiRollInstance, ttl]
  );

  const migrateWithPermit = useCallback(
    async (pair: Pair, amount: string) => {
      const nonce = await getNonce(pair.liquidityToken.address);

      const typedData = {
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "Permit",
        domain: {
          name: "Uniswap V2",
          version: "1",
          chainId,
          verifyingContract: pair?.liquidityToken.address,
        },
        message: {
          owner: account,
          spender: sushiRollAddress,
          value: amount,
          nonce,
          deadline: ttl,
        },
      };

      try {
        const args = getMigrateArgs(pair, amount);
        const data = JSON.stringify(typedData);
        const signature = await provider?.send("eth_signTypedData_v4", [
          account,
          data,
        ]);
        const { r, v, s } = splitSignature(signature);

        const tx = await sushiRollInstance
          ?.connect(signer as Signer)
          .migrateWithPermit(...args, typedData.message.deadline, v, r, s, {
            gasLimit: 1000000,
          });

        await tx.wait();
      } catch (err) {
        console.error(err);
      }
    },
    [
      account,
      chainId,
      getMigrateArgs,
      getNonce,
      provider,
      signer,
      sushiRollInstance,
      ttl,
    ]
  );

  return {
    migrate,
    migrateWithPermit,
  };
};
