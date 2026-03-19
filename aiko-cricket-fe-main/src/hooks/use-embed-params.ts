"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/language-context";
import { languageAdapter } from "@/lib/language-adapter";

export function useEmbedParams(themeParam?: string, languageParam?: string) {
  const { setTheme } = useTheme();
  const { setLanguage } = useLanguage();

  useEffect(() => {
    if (themeParam === "dark" || themeParam === "light") {
      setTheme(themeParam);
    }
  }, [themeParam, setTheme]);

  useEffect(() => {
    if (languageParam && languageAdapter.isValidLanguage(languageParam)) {
      setLanguage(languageParam);
    }
  }, [languageParam, setLanguage]);
}
