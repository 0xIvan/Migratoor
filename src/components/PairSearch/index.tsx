import React, { useContext, useEffect, useState } from "react";

import { TabsContext } from "../../common/context";
import { fromWeiFormatted, getTokenSymbol } from "../../common/helpers";
import { usePair } from "../../hooks/usePair";
import { useWeb3 } from "../../hooks/useWeb3";
import { Card } from "../Card";
import { TextInput } from "../TextInput";

export const PairSearch: React.FC = () => {
  const { state, updateState } = useContext(TabsContext);
  const { chainId, isConnected, connectWallet } = useWeb3();
  const {
    invalidPair,
    loading,
    token0AddressSorted,
    token1AddressSorted,
    pair,
    pairBalance,
    amount0,
    amount1,
    setExec,
  } = usePair(state.token0Address, state.token1Address);

  const token0Symbol = getTokenSymbol(token0AddressSorted, chainId);
  const token1Symbol = getTokenSymbol(token1AddressSorted, chainId);

  useEffect(() => {
    if (pair && pairBalance) {
      updateState({
        pair,
        pairBalance,
        amount0,
        amount1,
      });
    }
  }, []);

  const setToken0Address = (address: string) => {
    updateState({ token0Address: address });
  };
  const setToken1Address = (address: string) => {
    updateState({ token1Address: address });
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
            onClick={() => (isConnected ? setExec(true) : connectWallet())}
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
              <span>Total pool tokens</span>
              <span>{fromWeiFormatted(state.pairBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pooled {token0Symbol}</span>
              <span>{state.amount0?.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pooled {token1Symbol}</span>
              <span>{state.amount1?.toFixed(3)}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};