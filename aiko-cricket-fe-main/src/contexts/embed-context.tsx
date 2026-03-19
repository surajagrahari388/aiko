"use client";

import { createContext, useContext, useEffect } from "react";
import posthog from "posthog-js";

export const BORDER_RADIUS_MAP = {
  none: "0",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
} as const;

export const HEADING_SIZE_MAP = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
} as const;

export const BODY_SIZE_MAP = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
} as const;

interface EmbedContextValue {
  subscriptionKey?: string;
  channel?: string;
  disableAudio?: boolean;
  accentColor?: string;
  fontFamily?: string;
  borderRadius?: keyof typeof BORDER_RADIUS_MAP;
  headingSize?: keyof typeof HEADING_SIZE_MAP;
  bodySize?: keyof typeof BODY_SIZE_MAP;
}

const EmbedContext = createContext<EmbedContextValue>({});

export function EmbedProvider({
  subscriptionKey,
  channel,
  disableAudio,
  accentColor,
  fontFamily,
  borderRadius,
  headingSize,
  bodySize,
  children,
}: EmbedContextValue & { children: React.ReactNode }) {
  useEffect(() => {
    if (channel) {
      posthog.register({ channel });
      return () => {
        posthog.unregister("channel");
      };
    }
  }, [channel]);

  return (
    <EmbedContext.Provider
      value={{
        subscriptionKey,
        channel,
        disableAudio,
        accentColor,
        fontFamily,
        borderRadius,
        headingSize,
        bodySize,
      }}
    >
      {children}
    </EmbedContext.Provider>
  );
}

export function useEmbedContext(): EmbedContextValue {
  return useContext(EmbedContext);
}

export function useEmbedHeadingClass(): string {
  const { headingSize } = useContext(EmbedContext);
  return HEADING_SIZE_MAP[headingSize ?? "md"];
}

export function useEmbedBodyClass(): string {
  const { bodySize } = useContext(EmbedContext);
  return BODY_SIZE_MAP[bodySize ?? "md"];
}
