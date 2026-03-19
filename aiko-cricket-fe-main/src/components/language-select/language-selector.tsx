"use client";

import { useLanguage } from "@/contexts/language-context";
import { SupportedLanguage } from "@/lib/language";
import { languageAdapter } from "@/lib/language-adapter";
import { useMemo, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectorProps {
  showDebug?: boolean;
}

export function LanguageSelector({ showDebug = false }: LanguageSelectorProps) {
  const { language, setLanguage, isLoading } = useLanguage();

  // Get language options using adapter
  const languageOptions = useMemo(() => {
    return languageAdapter.getLanguagesForEnvironment(showDebug);
  }, [showDebug]);

  const handleValueChange = useCallback(
    (value: string) => setLanguage(value as SupportedLanguage),
    [setLanguage]
  );

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={language} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languageOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
