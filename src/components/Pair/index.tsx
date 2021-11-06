import React, { useContext } from "react";

import { TabsContext } from "../../common/context";
import { Card } from "../Card";
import { TextInput } from "../TextInput";

export const Pair: React.FC = () => {
  const { state, setState } = useContext(TabsContext);

  const setAddressA = (address: string) => {
    setState({ ...state, addressA: address });
  };
  const setAddressB = (address: string) => {
    setState({ ...state, addressB: address });
  };

  return (
    <div className="flex justify-around">
      <Card header="Find pair">
        <div className="p-5">
          <div className="pt-0 mb-3">
            <TextInput
              placeholder="Address"
              onChange={(address) => setAddressA(address)}
              value={state.addressA || ""}
            />
          </div>
          <div className="pt-0 mb-3">
            <TextInput
              placeholder="Address"
              onChange={(address) => setAddressB(address)}
              value={state.addressB || ""}
            />
          </div>

          <button className="btn">Search</button>
        </div>
      </Card>
      <Card header="Result">
        <div className="p-5">placeholder</div>
      </Card>
    </div>
  );
};
