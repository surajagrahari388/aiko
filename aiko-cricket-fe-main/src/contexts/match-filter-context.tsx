"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type MatchStatus = "all" | "live" | "today" | "tomorrow";

interface MatchFilterContextType {
  selectedStatus: MatchStatus;
  setSelectedStatus: (status: MatchStatus) => void;
}

const MatchFilterContext = createContext<MatchFilterContextType | undefined>(
  undefined
);

export function MatchFilterProvider({ children }: { children: ReactNode }) {
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus>("all");

  return (
    <MatchFilterContext.Provider value={{ selectedStatus, setSelectedStatus }}>
      {children}
    </MatchFilterContext.Provider>
  );
}

export function useMatchFilter(): MatchFilterContextType | undefined {
  const context = useContext(MatchFilterContext);
  return context;
}
