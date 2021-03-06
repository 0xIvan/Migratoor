import type { NextPage } from "next";
import Head from "next/head";
import React, { useState } from "react";

import { Migrate } from "../components/Migrate";
import { PairSearch } from "../components/PairSearch";
import { Tabs } from "../components/Tabs";
import { TokenList } from "../components/TokenList";
import { Tab } from "../types";

const Home: NextPage = () => {
  const tabs: Tab[] = [
    { label: "Token list", component: <TokenList /> },
    { label: "Pair", component: <PairSearch /> },
    { label: "Migrate", component: <Migrate /> },
  ];

  const [selectedTab, setSelectedTab] = useState<number>(0);

  return (
    <div className="px-8">
      <Head>
        <title>Sushi web3 trial</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center min-h-screen py-16">
        <div className="mb-4">
          <h1 className="text-3xl">
            Web3 Trial: Contract interaction with ethers.js
          </h1>
        </div>
        <Tabs
          selectedTab={selectedTab}
          tabs={tabs}
          setSelectedTab={setSelectedTab}
        />
      </main>

      <footer className="flex items-center justify-center py-8 border-t border-black">
        <a
          className="cursor-pointer"
          href="https://github.com/0xIvan"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made by 0xIvan
        </a>
      </footer>
    </div>
  );
};

export default Home;
