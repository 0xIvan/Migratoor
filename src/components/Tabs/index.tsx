import clsx from "clsx";
import Image from "next/image";
import React, { useState } from "react";

import { TabsContext } from "../../common/context";
import arrowLeftIcon from "../../icons/arrowLeft.svg";
import arrowRightIcon from "../../icons/arrowRight.svg";
import { Tab } from "../../types";
import styles from "./Tabs.module.css";

interface Props {
  selectedTab: number;
  tabs: Tab[];
  setSelectedTab: (tab: number) => void;
}

export const Tabs: React.FC<Props> = (props) => {
  const { selectedTab, tabs, setSelectedTab } = props;

  const activeTab = tabs[selectedTab] ?? tabs[0];
  const [state, setState] = useState<Record<string, any>>({});
  const updateState = (updatedValues: Record<string, any>) => {
    setState((prevState) => {
      return { ...prevState, ...updatedValues };
    });
  };

  return (
    <div className="flex flex-col items-center w-4/5">
      <div className="flex mb-4">
        {selectedTab ? (
          <button
            className="flex items-center"
            onClick={() => setSelectedTab(selectedTab - 1)}
          >
            <Image
              src={arrowLeftIcon}
              width={20}
              height={20}
              alt="previous tab"
            />
          </button>
        ) : (
          <div className="w-5" />
        )}
        <div className="flex p-2 mx-2 bg-gray-300 w-max rounded-xl">
          {tabs.map((t, i) => (
            <button
              key={i}
              className={clsx(
                "px-4 py-2",
                selectedTab === i && "text-white bg-gray-600 rounded-xl"
              )}
              onClick={() => setSelectedTab(i)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {selectedTab === tabs.length - 1 ? (
          <div className="w-5" />
        ) : (
          <button
            className="flex items-center"
            onClick={() => setSelectedTab(selectedTab + 1)}
          >
            <Image src={arrowRightIcon} width={20} height={20} alt="next tab" />
          </button>
        )}
      </div>

      <div className="w-full">
        <TabsContext.Provider value={{ state, updateState }}>
          {activeTab.component}
        </TabsContext.Provider>
      </div>
    </div>
  );
};
