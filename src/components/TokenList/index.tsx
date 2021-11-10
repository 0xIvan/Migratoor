import copy from "copy-to-clipboard";
import Image from "next/image";
import React, { useState } from "react";

import { WETH } from "@uniswap/sdk";

import { useWeb3 } from "../../hooks/useWeb3";
import checkMarkIcon from "../../icons/checkmark.svg";
import copyIcon from "../../icons/copy.svg";
import { tokenList } from "./tokenList";

export const TokenList = () => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [copiedAddress, setCopiedAddress] = useState<string>("");
  const { chainId } = useWeb3();

  const copyAddress = (text: string) => {
    const copied = copy(text);
    setIsCopied(copied);
    setCopiedAddress(text);
  };

  const tokenListWithWeth = [
    ...tokenList,
    WETH[chainId as 1 | 3 | 4 | 5 | 42],
  ].sort((a, b) => (String(a.symbol) < String(b.symbol) ? -1 : 1));

  return (
    <div className="flex justify-center">
      <table className="p-4 rounded shadow-lg">
        <thead className="border-b-2 bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-sm font-medium text-left text-gray-500 uppercase w-52"
            >
              Name
            </th>
            <th className="w-24 py-3 text-sm font-medium text-left text-gray-500 uppercase">
              Symbol
            </th>
            <th className="py-3 text-sm font-medium text-left text-gray-500 uppercase">
              Address
            </th>
            <th className="w-12" />
          </tr>
        </thead>
        <tbody>
          {tokenListWithWeth.map((token) => (
            <tr key={token.address} className="h-8">
              <td className="px-4">{token.name}</td>
              <td>{token.symbol}</td>
              <td>{token.address}</td>
              <td>
                <button
                  className="flex items-center justify-center"
                  onClick={() => copyAddress(token.address)}
                >
                  {isCopied && copiedAddress === token.address ? (
                    <Image
                      src={checkMarkIcon}
                      width={20}
                      height={20}
                      alt="checkmark"
                    />
                  ) : (
                    <Image src={copyIcon} width={20} height={20} alt="copy" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
