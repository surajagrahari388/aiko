"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SportsMatches } from "@/lib/types";
import { useLanguage } from "@/contexts/language-context";
import QnAMaintenance from "./qna-maintenance";

interface Props {
  oddsData?: SportsMatches;
  children: React.ReactNode;
  SHOW_QNA_MAINTENANCE?: boolean;
}

export default function QnAAvailabilityGuard({
  oddsData,
  children,
  SHOW_QNA_MAINTENANCE,
}: Props) {
  const { language } = useLanguage();

  if (SHOW_QNA_MAINTENANCE) {
    return <QnAMaintenance />;
  }

  const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
    english: {
      featureUnavailable: "This feature isn’t available for this match",
      unavailableDescription:
        "You can ask questions only in ICC recognized matches. Open an ICC competition match to use this feature.",
      browseMatches: "See other matches",
    },
    hindi: {
      featureUnavailable: "This feature isn’t available for this match",
      unavailableDescription:
        "You can ask questions only in ICC recognized matches. Open an ICC competition match to use this feature.",
      browseMatches: "See other matches",
    },
    hinglish: {
      featureUnavailable: "This feature isn’t available for this match",
      unavailableDescription:
        "You can ask questions only in ICC recognized matches. Open an ICC competition match to use this feature.",
      browseMatches: "See other matches",
    },
    haryanvi: {
      featureUnavailable: "This feature isn’t available for this match",
      unavailableDescription:
        "You can ask questions only in ICC recognized matches. Open an ICC competition match to use this feature.",
      browseMatches: "See other matches",
    }
  };

  const getTranslatedText = (key: string, lang?: string) => {
    if (!lang) return UI_TRANSLATIONS.english[key] || key;
    const langKey = lang.toLowerCase();
    return (
      UI_TRANSLATIONS[langKey]?.[key] || UI_TRANSLATIONS.english[key] || key
    );
  };

  const isUnavailable = Boolean(
    oddsData &&
      oddsData.matches?.[0]?.competitions?.category !== "international" &&
      oddsData.matches?.[0]?.competitions?.title?.toLocaleLowerCase() !==
        "indian premier league"
  );

  if (isUnavailable) {
    return (
      <div className="py-8 text-center">
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="bg-card text-card-foreground flex flex-col rounded-xl border py-3 shadow-sm">
            <div className="px-6 py-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(59,130,246,0.08)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[var(--primary)]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3a1 1 0 00.293.707l2 2a1 1 0 001.414-1.414L11 9.586V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-semibold">
                    {getTranslatedText("featureUnavailable", language)}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getTranslatedText("unavailableDescription", language)}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-3">
              <Link href={"/"}>
                <Button>{getTranslatedText("browseMatches", language)}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
