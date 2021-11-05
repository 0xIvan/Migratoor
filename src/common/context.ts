import { createContext } from "react";

import { TabContext } from "../types";

export const TabsContext = createContext<TabContext>({} as TabContext);
