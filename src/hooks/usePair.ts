import { BigNumber, Contract, ethers } from "ethers";
import { useCallback, useEffect, useState } from "react";

import { FACTORY_ADDRESS, Pair, TokenAmount } from "@uniswap/sdk";
import IUniswapV2ERC20 from "@uniswap/v2-core/build/IUniswapV2ERC20.json";
import IUniswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import IUniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json";

import { fetchToken, getContract } from "../common/helpers";
import { useContract } from "./useContract";
import { useWeb3 } from "./useWeb3";

export const usePair = (token0Address: string, token1Address: string) => {
  const { provider, account, chainId } = useWeb3();
  const [invalidPair, setInvalidPair] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exec, setExec] = useState(false);

  const [token0AddressSorted, setToken0AddressSorted] = useState("");
  const [token1AddressSorted, setToken1AddressSorted] = useState("");
  const [pair, setPair] = useState<Pair>();
  const [pairBalance, setPairBalance] = useState<BigNumber>();
  const [amount0, setAmount0] = useState<TokenAmount>();
  const [amount1, setAmount1] = useState<TokenAmount>();
  const [totalSupply, setTotalSupply] = useState<TokenAmount>();

  const factory = useContract(FACTORY_ADDRESS, IUniswapV2Factory.abi);

  const getPairInstance = useCallback(
    (pairAddress: string): Contract =>
      getContract(pairAddress, IUniswapV2Pair.abi, provider),
    [provider]
  );

  const getPairErc20Instance = useCallback(
    (pairAddress: string): Contract =>
      getContract(pairAddress, IUniswapV2ERC20.abi, provider),
    [provider]
  );

  const getPairAddress = useCallback(async (): Promise<string | undefined> => {
    setInvalidPair(false);

    const pairAddress = await factory?.getPair(token0Address, token1Address);

    if (pairAddress === ethers.constants.AddressZero) {
      setInvalidPair(true);
      return;
    }

    return pairAddress;
  }, [factory, token0Address, token1Address]);

  const getPairBalance = useCallback(
    async (pairAddress: string): Promise<BigNumber> =>
      getPairErc20Instance(pairAddress).balanceOf(account),
    [account, getPairErc20Instance]
  );

  const getPoolTotalSupply = useCallback(
    async (pairAddress: string): Promise<BigNumber> =>
      getPairErc20Instance(pairAddress).totalSupply(),
    [getPairErc20Instance]
  );

  const getPair = useCallback(
    async (pairAddress: string): Promise<Pair | undefined> => {
      const token0Input = await fetchToken(token0Address, chainId);
      const token1Input = await fetchToken(token1Address, chainId);

      if (!token0Input || !token1Input) {
        setLoading(false);
        return;
      }

      const pairInstance = getPairInstance(pairAddress);
      const reserves = await pairInstance.getReserves();
      const [reserve0, reserve1] = reserves;

      const tokens = [token0Input, token1Input];

      const [token0, token1] = tokens[0].sortsBefore(tokens[1])
        ? tokens
        : [tokens[1], tokens[0]];

      setToken0AddressSorted(token0.address);
      setToken1AddressSorted(token1.address);

      const _pair = new Pair(
        new TokenAmount(token0, reserve0),
        new TokenAmount(token1, reserve1)
      );

      return _pair;
    },
    [chainId, getPairInstance, token0Address, token1Address]
  );

  const getProvidedLiquidity = useCallback(
    async (
      pair: Pair
    ): Promise<{
      amount0: TokenAmount;
      amount1: TokenAmount;
    }> => {
      const { token0, token1, liquidityToken } = pair;
      const pairAddress = liquidityToken.address;

      const poolTotalSupply = await getPoolTotalSupply(pairAddress);
      const _pairBalance = await getPairBalance(pairAddress);
      setPairBalance(_pairBalance);

      const liquidity = new TokenAmount(
        pair.liquidityToken,
        _pairBalance.toString()
      );
      const _totalSupply = new TokenAmount(
        pair.liquidityToken,
        poolTotalSupply.toString()
      );

      setTotalSupply(_totalSupply);

      const amount0 = pair.getLiquidityValue(token0, _totalSupply, liquidity);
      const amount1 = pair.getLiquidityValue(token1, _totalSupply, liquidity);

      return { amount0, amount1 };
    },
    [getPairBalance, getPoolTotalSupply]
  );

  useEffect(() => {
    const searchPair = async () => {
      try {
        setLoading(true);
        const pairAddress = await getPairAddress();
        if (!pairAddress) {
          setLoading(false);
          return;
        }

        const _pair = await getPair(pairAddress);

        if (_pair) {
          setPair(_pair);

          const { amount0, amount1 } = await getProvidedLiquidity(_pair);
          setAmount0(amount0);
          setAmount1(amount1);
        }

        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setLoading(false);
      }
    };

    if (exec) {
      searchPair();
      setExec(false);
    }
  }, [exec, getPair, getPairAddress, getProvidedLiquidity]);

  return {
    getPairBalance,
    totalSupply,
    invalidPair,
    loading,
    setExec,
    token0AddressSorted,
    token1AddressSorted,
    pair,
    pairBalance,
    amount0,
    amount1,
  };
};
