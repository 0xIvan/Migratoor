import { BigNumber } from "ethers";
import React, { useContext, useState } from "react";

import { TabsContext } from "../../common/context";
import { fromWeiFormatted, toWei } from "../../common/helpers";
import { usePair } from "../../hooks/usePair";
import { useSushiRoll } from "../../hooks/useSushiRoll";
import { useTokenApprove } from "../../hooks/useTokenApprove";
import { Card } from "../Card";
import { TextInput } from "../TextInput";

export const Migrate = () => {
  const { state, updateState } = useContext(TabsContext);
  const { pair, token0Address, token1Address, totalSupply, pairBalance } =
    state;
  const sushiRollAddress = "0xCaAbdD9Cf4b61813D4a52f980d6BC1B713FE66F5";
  const [migrateAmount, setMigrateAmount] = useState<string>("0");
  const { approve, isApproved } = useTokenApprove(
    pair?.liquidityToken.address,
    sushiRollAddress,
    toWei(migrateAmount).toString()
  );
  const { migrate, migrateWithPermit } = useSushiRoll(
    token0Address,
    token1Address,
    totalSupply
  );
  const { getPairBalance } = usePair(token0Address, token1Address);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    try {
      setLoading(true);
      await approve();
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleMigrate = async (withPermit: boolean) => {
    const migrateFn = withPermit ? migrateWithPermit : migrate;

    try {
      setLoading(true);
      await migrateFn(pair, toWei(migrateAmount).toString());
      const newBalance = await getPairBalance(pair.liquidityToken.address);
      updateState({ pairBalance: newBalance });
      setMigrateAmount("0");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Card header="Migrate liquidity">
        <div className="flex flex-col justify-between p-5">
          {!pair ? (
            <div>Select a pair in the previous tab</div>
          ) : (
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm">Amount to migrate</span>
                <span
                  className="text-xs cursor-pointer hover:underline"
                  onClick={() =>
                    setMigrateAmount(fromWeiFormatted(pairBalance, 0))
                  }
                >
                  max: {fromWeiFormatted(pairBalance)}
                </span>
              </div>
              <div className="pt-0 mb-3">
                <TextInput
                  alignRight
                  placeholder="Amount"
                  onChange={(amount) => setMigrateAmount(amount || "0")}
                  value={migrateAmount}
                />
              </div>
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 border-b-2 border-gray-400 rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <button
                    className="self-center w-3/5 m-2 btn"
                    onClick={() =>
                      !isApproved ? handleApprove() : handleMigrate(false)
                    }
                    disabled={BigNumber.from(migrateAmount).eq(0)}
                  >
                    {!isApproved ? "Approve" : "Migrate"}
                  </button>
                  <button
                    className="self-center w-3/5 btn"
                    onClick={() => handleMigrate(true)}
                    disabled={BigNumber.from(migrateAmount).eq(0)}
                  >
                    Migrate with signature
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
