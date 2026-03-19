/**
 * Design Variant Registry & localStorage helpers.
 *
 * To add a new A/B/C component area, add one entry to DESIGN_VARIANT_REGISTRY.
 * The Design Lab panel auto-discovers it — no panel code changes needed.
 */

export interface DesignVariantConfig {
  /** Unique key used in code, e.g. "match-navbar" */
  id: string;
  /** Human-readable label shown in the Design Lab panel */
  label: string;
  /** Available variant names, e.g. ["A", "B", "C"] */
  variants: string[];
  /** Which variant to use by default */
  defaultVariant: string;
}

/** Map of component-area id → chosen variant string */
export type DesignVariantState = Record<string, string>;

// ---------------------------------------------------------------------------
// Registry — single source of truth
// ---------------------------------------------------------------------------

export const DESIGN_VARIANT_REGISTRY: DesignVariantConfig[] = [
  {
    id: "match-navbar",
    label: "Match Navbar",
    variants: ["A", "B", "C"],
    defaultVariant: "B",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = "aiko-design-variants";

/** Build default state from the registry */
export function getDefaultVariantState(): DesignVariantState {
  const state: DesignVariantState = {};
  for (const entry of DESIGN_VARIANT_REGISTRY) {
    state[entry.id] = entry.defaultVariant;
  }
  return state;
}

/** Read persisted state from localStorage (SSR-safe) */
export function getVariantsFromStorage(): DesignVariantState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DesignVariantState;
  } catch {
    return null;
  }
}

/** Persist state to localStorage (SSR-safe) */
export function setVariantsInStorage(state: DesignVariantState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or private mode — silently ignore
  }
}
