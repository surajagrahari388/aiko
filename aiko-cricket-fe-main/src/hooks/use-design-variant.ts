"use client";

import { useMemo } from "react";
import { useDesignVariants } from "@/contexts/design-variant-context";
import { DESIGN_VARIANT_REGISTRY } from "@/lib/design-variants";

/**
 * Convenience hook for a single component area.
 *
 * Usage:
 * ```ts
 * const { variant, setVariant, availableVariants } = useDesignVariant("match-navbar");
 * // variant === "A" | "B" | "C"
 * ```
 */
export function useDesignVariant(id: string) {
  const { variants, setVariant: setGlobal } = useDesignVariants();

  const config = useMemo(
    () => DESIGN_VARIANT_REGISTRY.find((c) => c.id === id),
    [id]
  );

  return {
    variant: variants[id] ?? config?.defaultVariant ?? "A",
    setVariant: (v: string) => setGlobal(id, v),
    availableVariants: config?.variants ?? ["A"],
  };
}
