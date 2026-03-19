"use client";

import React, { createContext, useContext, useState } from "react";

type MicStateContextType = {
  activeTipId: string | null;
  setActiveTipId: (tipId: string | null) => void;
  isActiveTip: (tipId: string) => boolean;
};

const MicStateContext = createContext<MicStateContextType | undefined>(undefined);

export const useMicState = () => {
  const context = useContext(MicStateContext);
  if (context === undefined) {
    throw new Error("useMicState must be used within a MicStateProvider");
  }
  return context;
};

export const MicStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeTipId, setActiveTipId] = useState<string | null>(null);

  const isActiveTip = (tipId: string) => {
    return activeTipId === tipId;
  };

  return (
    <MicStateContext.Provider value={{ activeTipId, setActiveTipId, isActiveTip }}>
      {children}
    </MicStateContext.Provider>
  );
};
