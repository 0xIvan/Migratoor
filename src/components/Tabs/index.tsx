import clsx from "clsx";
import React from "react";

import { Tab } from "../../types";
import styles from "./Tabs.module.css";

interface Props {
  value: any;
  tabs: Tab[];
  handleChangeTab: (tab: string) => void;
}

export const Tabs: React.FC<Props> = (props) => {
  const { value, tabs, handleChangeTab } = props;

  const activeTab = tabs.find((t) => t.value === value) || tabs[0];

  return (
    <div className="flex flex-col items-center w-4/5">
      <div className={styles.tabsContainer}>
        {tabs.map((t) => (
          <button
            key={t.value}
            className={clsx(styles.tab, t.value === value && styles.activeTab)}
            onClick={() => handleChangeTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="w-full">{activeTab.component}</div>
    </div>
  );
};
