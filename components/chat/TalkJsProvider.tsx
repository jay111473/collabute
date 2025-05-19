"use client";

import { createContext, useContext, ReactNode } from "react";
import { User } from "@/types/dashboard";
import { useTalkSession } from "./hooks/useTalkSession";
import TalkJsTheme from "./TalkJsTheme";

type TalkJsContextType = {
  ready: boolean;
};

const TalkJsContext = createContext<TalkJsContextType>({ ready: false });

export const useTalkJs = () => useContext(TalkJsContext);

type TalkJsProviderProps = {
  children: ReactNode;
  currentUser: User;
};

export const TalkJsProvider = ({ children, currentUser }: TalkJsProviderProps) => {
  const { ready } = useTalkSession(currentUser);

  return (
    <TalkJsContext.Provider value={{ ready }}>
      <TalkJsTheme />
      {children}
    </TalkJsContext.Provider>
  );
};

export default TalkJsProvider; 