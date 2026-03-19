"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";
import { SupportedLanguage } from "@/lib/language";
import { languageAdapter } from "@/lib/language-adapter";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
interface LanguageToggleProps {
  showAllLanguages?: boolean;
  compact?: boolean;
}

const LANGUAGE_ABBR: Record<string, string> = {
  english: "EN",
  hindi: "HI",
  hinglish: "HG",
  haryanvi: "HR",
  punjabi_hindi: "PA",
  punjabi_script: "PA",
  telugu: "TE",
  telugu_english: "TE",
  tamil: "TA",
  tamil_english: "TA",
  british_eng_m: "EN",
  british_eng_f: "EN",
};

const RESET_DELAY_MS = 1000;

const LanguageToggle = ({ showAllLanguages, compact }: LanguageToggleProps) => {
  const pathname = usePathname();
  const { language, setLanguage, isLoading } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  // Get available languages using adapter
  const availableLanguages = useMemo(() => {
    return languageAdapter.getLanguagesForEnvironment(showAllLanguages);
  }, [showAllLanguages]);

  const updateLanguage = useCallback(
    (newLanguage: string) => {
      if (isChanging) return;

      setIsChanging(true);
      try {
        const nextLanguage = newLanguage as SupportedLanguage;
        setLanguage(nextLanguage);
        const languageLabel = languageAdapter.getLanguageLabel(nextLanguage);
        toast.success(`Changing language to ${languageLabel}`);
      } catch {
        toast.error("Failed to change language");
      } finally {
        setTimeout(() => setIsChanging(false), RESET_DELAY_MS);
      }
    },
    [setLanguage, isChanging]
  );

  if (pathname.startsWith("/cricket/competition"))
    return null;

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="default"
        className="hover:bg-gray-700/50 text-white"
        disabled
      >
        Loading...
        <span className="sr-only">Loading language</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "sm" : "default"}
          className={compact ? "flex items-center gap-0.5 px-2 text-sm font-medium" : "flex items-center gap-1"}
        >
          <span>{compact ? (LANGUAGE_ABBR[language] || language.slice(0, 2).toUpperCase()) : languageAdapter.getLanguageLabel(language)}</span>
          <ChevronDown className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => updateLanguage(lang.value)}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
