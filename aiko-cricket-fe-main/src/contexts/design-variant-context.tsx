"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  DesignVariantState,
  DESIGN_VARIANT_REGISTRY,
  getDefaultVariantState,
  getVariantsFromStorage,
  setVariantsInStorage,
} from "@/lib/design-variants";

interface DesignVariantContextValue {
  /** Whether the Design Lab system is active (panel visible, localStorage used) */
  enabled: boolean;
  /** Current variant selections keyed by component-area id */
  variants: DesignVariantState;
  /** Set a single component-area variant */
  setVariant: (id: string, variant: string) => void;
  /** Reset all to defaults */
  resetAll: () => void;
}

const DesignVariantContext = createContext<DesignVariantContextValue>({
  enabled: false,
  variants: getDefaultVariantState(),
  setVariant: () => {},
  resetAll: () => {},
});

export function DesignVariantProvider({
  enabled = false,
  children,
}: {
  enabled?: boolean;
  children: React.ReactNode;
}) {
  const [variants, setVariants] = useState<DesignVariantState>(
    getDefaultVariantState
  );

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    if (!enabled) return;
    const stored = getVariantsFromStorage();
    if (stored) {
      // Merge stored values with defaults so new registry entries get their default
      setVariants((prev) => ({ ...prev, ...stored }));
    }
  }, [enabled]);

  const setVariant = (id: string, variant: string) => {
    // Validate against registry
    const config = DESIGN_VARIANT_REGISTRY.find((c) => c.id === id);
    if (!config || !config.variants.includes(variant)) return;

    setVariants((prev) => {
      const next = { ...prev, [id]: variant };
      if (enabled) setVariantsInStorage(next);
      return next;
    });
  };

  const resetAll = () => {
    const defaults = getDefaultVariantState();
    setVariants(defaults);
    if (enabled) setVariantsInStorage(defaults);
  };

  return (
    <DesignVariantContext.Provider
      value={{ enabled, variants, setVariant, resetAll }}
    >
      {children}
    </DesignVariantContext.Provider>
  );
}

export function useDesignVariants() {
  return useContext(DesignVariantContext);
}
