"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";
import { SupportedLanguage } from "@/lib/language";
import { languageAdapter } from "@/lib/language-adapter";
import { usePathname } from "next/navigation";

interface LanguageSelectProps {
  showAllLanguages?: boolean;
}

const RESET_DELAY_MS = 1000;

const LanguageSelect = ({ showAllLanguages }: LanguageSelectProps) => {
  const pathName = usePathname();
  const { language, setLanguage, isLoading } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  // Get available languages using adapter
  const availableLanguages = useMemo(() => {
    return languageAdapter.getLanguagesForEnvironment(showAllLanguages);
  }, [showAllLanguages]);

  const updateLanguage = useCallback(
    (value: string) => {
      if (isChanging) return;

      setIsChanging(true);
      try {
        const nextLanguage = value as SupportedLanguage;
        setLanguage(nextLanguage);
        const languageLabel = languageAdapter.getLanguageLabel(nextLanguage);
        toast.success(`Changing language to ${languageLabel}`);
      } catch (error) {
        console.error("Error changing language:", error);
        toast.error("Failed to change language");
      } finally {
        setTimeout(() => setIsChanging(false), RESET_DELAY_MS);
      }
    },
    [setLanguage, isChanging]
  );
  if (pathName === "/cricket") return null;

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={language} onValueChange={updateLanguage}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {availableLanguages.map((lang) => (
          <SelectItem value={lang.value} key={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelect;
