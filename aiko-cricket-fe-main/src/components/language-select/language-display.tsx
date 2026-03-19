"use client";

import { useLanguage } from "@/contexts/language-context";
import { languageAdapter } from "@/lib/language-adapter";
import { useMemo } from "react";

export function LanguageDisplay() {
  const { language, isLoading } = useLanguage();

  const displayLabel = useMemo(
    () => languageAdapter.getLanguageLabel(language),
    [language]
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin shrink-0"></div>
        <span className="text-sm text-muted-foreground">
          Loading language...
        </span>
      </div>
    );
  }

  return (
    <div className="text-sm text-muted-foreground">
      Current language: <span className="font-medium">{displayLabel}</span>
    </div>
  );
}
