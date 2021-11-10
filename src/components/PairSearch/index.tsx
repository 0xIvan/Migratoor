import { BigNumberish, ethers } from "ethers";
import React, { useContext, useState } from "react";

import {
  FACTORY_ADDRESS,
  Fetcher,
  Pair,
  Token,
  TokenAmount,
  WETH,
} from "@uniswap/sdk";
import IUniswapV2ERC20 from "@uniswap/v2-core/build/IUniswapV2ERC20.json";
import IUniswapV2Factory from "@uniswap/v2-core/build/IUniswapV2Factory.json";
import IUniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json";

import { TabsContext } from "../../common/context";
import { fromWeiFormatted } from "../../common/helpers";
import { useWeb3 } from "../../hooks/useWeb3";
import { Card } from "../Card";
import { TextInput } from "../TextInput";
import { tokenList } from "../TokenList/tokenList";

export const PairSearch: React.FC = () => {
  const { state, updateState } = useContext(TabsContext);
  const { chainId, provider, isConnected, connectWallet, account } = useWeb3();
  const [invalidPair, setInvalidPair] = useState(false);
  const [loading, setLoading] = useState(false);

  const getTokenSymbol = (tokenAddress: string) => {
    const token =
      tokenAddress === WETH[chainId].address
        ? WETH[chainId]
        : tokenList.find((t) => t.address === tokenAddress);

    if (!token) return "N/A";
    return token.symbol;
  };

  const token0Symbol = getTokenSymbol(state.token0Address);
  const token1Symbol = getTokenSymbol(state.token1Address);

  const setToken0Address = (address: string) => {
    updateState({ token0Address: address });
  };
  const setToken1Address = (address: string) => {
    updateState({ token1Address: address });
  };

  const fetchPairAddress = async (): Promise<string> => {
    try {
      setInvalidPair(false);

      const factory = new ethers.Contract(
        FACTORY_ADDRESS,
        IUniswapV2Factory.abi,
        provider
      );

      const _pairAddress = await factory.getPair(
        state.token0Address,
        state.token1Address
      );

      if (_pairAddress === ethers.constants.AddressZero) {
        setInvalidPair(true);
        return "";
      }
      return _pairAddress;
    } catch (err) {
      console.error("err", err);
      return "";
    }
  };

  const fetchToken = async (
    tokenAddress: string
  ): Promise<Token | undefined> => {
    try {
      return Fetcher.fetchTokenData(chainId, tokenAddress);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPairBalance = async (pairAddress: string): Promise<void> => {
    try {
      const pairErc20Instance = new ethers.Contract(
        pairAddress,
        IUniswapV2ERC20.abi,
        provider
      );

      const pairBalance = await pairErc20Instance.balanceOf(account);

      updateState({ pairBalance });
    } catch (err) {
      console.error(err);
    }
  };

  const searchPair = async () => {
    setLoading(true);
    const pairAddress = await fetchPairAddress();
    if (!pairAddress) return;

    await fetchPairBalance(pairAddress);

    const token0Input = await fetchToken(state.token0Address);
    const token1Input = await fetchToken(state.token1Address);

    if (!token0Input || !token1Input) return;

    try {
      const pairInstance = new ethers.Contract(
        pairAddress,
        IUniswapV2Pair.abi,
        provider
      );

      const reserves = await pairInstance.getReserves();
      const [reserve0, reserve1] = reserves;

      const tokens = [token0Input, token1Input];

      if (tokens[1].sortsBefore(tokens[0])) {
        updateState({
          token0Address: state.token1Address,
          token1Address: state.token0Address,
        });
      }

      const [token0, token1] = tokens[0].sortsBefore(tokens[1])
        ? tokens
        : [tokens[1], tokens[0]];

      const pair = new Pair(
        new TokenAmount(token0, reserve0),
        new TokenAmount(token1, reserve1)
      );

      updateState({ pair });

      setLoading(false);
    } catch (err) {
      console.error("err", err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Card header="Find pair" className="mb-12">
        <div className="flex flex-col justify-between p-5">
          <div className="pt-0 mb-3">
            <TextInput
              placeholder="Address"
              onChange={(address) => setToken0Address(address)}
              value={state.token0Address || ""}
            />
          </div>
          <div className="pt-0 mb-3">
            <TextInput
              placeholder="Address"
              onChange={(address) => setToken1Address(address)}
              value={state.token1Address || ""}
            />
          </div>

          <button
            className="self-center btn"
            onClick={() => (isConnected ? searchPair() : connectWallet())}
            disabled={!state.token0Address || !state.token1Address}
          >
            {!isConnected ? "Connect wallet" : "Search"}
          </button>
        </div>
      </Card>

      <Card header="Result">
        {loading ? (
          <div
            className="flex items-center justify-center"
            style={{ height: 156 }}
          >
            <div className="w-16 h-16 border-b-2 border-gray-400 rounded-full animate-spin"></div>
          </div>
        ) : invalidPair ? (
          <div className="p-5">Pair does not exist</div>
        ) : !state.pair ? (
          <div className="p-5">Search for a pair</div>
        ) : (
          <div className="flex flex-col p-5">
            <span className="self-start text-lg font-bold">{`${token0Symbol}/${token1Symbol}`}</span>
            <div className="flex justify-between">
              <span>Pooled tokens</span>
              <span>{fromWeiFormatted(state.pairBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pooled {token0Symbol}</span>
              <span>{state.pair.reserve0.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pooled {token1Symbol}</span>
              <span>{state.pair.reserve1.toFixed(3)}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
