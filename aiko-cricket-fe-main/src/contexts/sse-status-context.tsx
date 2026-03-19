"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SSEStatus = "disconnected" | "connecting" | "connected" | "error";

interface SSEStatusContextValue {
  sseStatus: SSEStatus;
  setSseStatus: (status: SSEStatus) => void;
}

const SSEStatusContext = createContext<SSEStatusContextValue>({
  sseStatus: "disconnected",
  setSseStatus: () => {},
});

export function SSEStatusProvider({ children }: { children: ReactNode }) {
  const [sseStatus, setSseStatus] = useState<SSEStatus>("disconnected");
  return (
    <SSEStatusContext.Provider value={{ sseStatus, setSseStatus }}>
      {children}
    </SSEStatusContext.Provider>
  );
}

export function useSSEStatus() {
  return useContext(SSEStatusContext);
}
