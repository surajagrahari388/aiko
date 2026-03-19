"use client";

import { useEffect } from "react";
import { useEmbedContext, BORDER_RADIUS_MAP } from "@/contexts/embed-context";
import { loadGoogleFont } from "@/lib/embed-font-loader";

function hexToHsl(hex: string): string {
  const raw = hex.replace("#", "");
  const r = parseInt(raw.substring(0, 2), 16) / 255;
  const g = parseInt(raw.substring(2, 4), 16) / 255;
  const b = parseInt(raw.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function computeForeground(hex: string): string {
  const raw = hex.replace("#", "");
  const r = parseInt(raw.substring(0, 2), 16);
  const g = parseInt(raw.substring(2, 4), 16);
  const b = parseInt(raw.substring(4, 6), 16);
  // Relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "0 0% 0%" : "0 0% 100%";
}

export default function EmbedStyleOverrides() {
  const { accentColor, fontFamily, borderRadius } = useEmbedContext();

  useEffect(() => {
    const root = document.documentElement;
    const cleanups: (() => void)[] = [];

    if (accentColor) {
      const hsl = hexToHsl(accentColor);
      const fg = computeForeground(accentColor);
      root.style.setProperty("--primary", hsl);
      root.style.setProperty("--primary-foreground", fg);
      cleanups.push(() => {
        root.style.removeProperty("--primary");
        root.style.removeProperty("--primary-foreground");
      });
    }

    if (fontFamily) {
      loadGoogleFont(fontFamily);
      root.style.setProperty("--font-sans", `"${fontFamily}", sans-serif`);
      cleanups.push(() => {
        root.style.removeProperty("--font-sans");
      });
    }

    if (borderRadius) {
      root.style.setProperty("--radius", BORDER_RADIUS_MAP[borderRadius]);
      cleanups.push(() => {
        root.style.removeProperty("--radius");
      });
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [accentColor, fontFamily, borderRadius]);

  return null;
}
