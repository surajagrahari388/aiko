"use client";

import React from "react";
import { useLanguage } from "@/contexts/language-context";
import { ChevronRight, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SportsMatches } from "@/lib/types";

const UI_TRANSLATIONS = {
  frequentlyAskedQuestions: {
    english: "Frequently Asked Questions",
    hindi: "Frequently Asked Questions",
    hinglish: "Frequently Asked Questions",
    haryanvi: "Frequently Asked Questions",
  },
  quickQuestions: {
    english: "Quick questions to get you started",
    hindi: "Quick questions to get you started",
    hinglish: "Quick questions to get you started",
    haryanvi: "Quick questions to get you started",
  },
  tapToAsk: {
    english: "Tap to ask",
    hindi: "Tap to ask",
    hinglish: "Tap to ask",
    haryanvi: "Tap to ask",
  },
  askPrefix: {
    english: "Ask:",
    hindi: "Ask:",
    hinglish: "Ask:",
    haryanvi: "Ask:",
  },
};
interface FAQSectionProps {
  oddsData?: SportsMatches;
  onAskQuestion: (question: string, faqId?: string) => void;
  isEmbedded?: boolean;
}

export const faqQuestions = [
  {
    id: "most-wickets-tournament",
    template: "Who took most wickets in this tournament?",
    translations: {
      english: "Who took most wickets in this tournament?",
      hindi: "Who took most wickets in this tournament?",
      hinglish: "Who took most wickets in this tournament?",
      haryanvi: "Who took most wickets in this tournament?",
    },
  },
  {
    id: "highest-runs-tournament",
    template: "Who scored the highest runs in this tournament?",
    translations: {
      english: "Who scored the highest runs in this tournament?",
      hindi: "Who scored the highest runs in this tournament?",
      hinglish: "Who scored the highest runs in this tournament?",
      haryanvi: "Who scored the highest runs in this tournament?",
    },
  },
  {
    id: "best-batsmen-teams",
    template: "Who is the best batsman in each of these teams?",
    translations: {
      english: "Who is the best batsman in each of these teams?",
      hindi: "Who is the best batsman in each of these teams?",
      hinglish: "Who is the best batsman in each of these teams?",
      haryanvi: "Who is the best batsman in each of these teams?",
    },
  },
  {
    id: "best-pacer-teams",
    template: "Who is the best pacer in each of these teams?",
    translations: {
      english: "Who is the best pacer in each of these teams?",
      hindi: "Who is the best pacer in each of these teams?",
      hinglish: "Who is the best pacer in each of these teams?",
      haryanvi: "Who is the best pacer in each of these teams?",
    },
  },
  {
    id: "best-spinner-teams",
    template: "Who is the best spinner in each of these teams?",
    translations: {
      english: "Who is the best spinner in each of these teams?",
      hindi: "Who is the best spinner in each of these teams?",
      hinglish: "Who is the best spinner in each of these teams?",
      haryanvi: "Who is the best spinner in each of these teams?",
    },
  },
  {
    id: "wickets-death-overs",
    template: "Which team took more wickets in death overs?",
    translations: {
      english: "Which team took more wickets in death overs?",
      hindi: "Which team took more wickets in death overs?",
      hinglish: "Which team took more wickets in death overs?",
      haryanvi: "Which team took more wickets in death overs?",
    },
  },
  {
    id: "runs-death-overs",
    template: "Which team scored the highest runs in death overs?",
    translations: {
      english: "Which team scored the highest runs in death overs?",
      hindi: "Which team scored the highest runs in death overs?",
      hinglish: "Which team scored the highest runs in death overs?",
      haryanvi: "Which team scored the highest runs in death overs?",
    },
  },
];

export default function FAQSection({
  oddsData,
  onAskQuestion,
  isEmbedded = false,
}: FAQSectionProps) {
  const { language } = useLanguage();

  // Helper function to get translated text
  const getTranslatedText = (key: string, lang?: string) => {
    const currentLang = lang || language;
    return (
      UI_TRANSLATIONS[key as keyof typeof UI_TRANSLATIONS]?.[
        currentLang as keyof typeof UI_TRANSLATIONS.frequentlyAskedQuestions
      ] ||
      UI_TRANSLATIONS[key as keyof typeof UI_TRANSLATIONS]?.english ||
      key
    );
  };

  // Helper: for some team-related FAQs append both team names when oddsData is provided
  const teamMentionFaqs = new Set([
    "best-batsmen-teams",
    "best-pacer-teams",
    "best-spinner-teams",
    "wickets-death-overs",
    "runs-death-overs",
  ]);

  function buildFinalQuestion(faq: (typeof faqQuestions)[number]) {
    const translatedQuestion =
      faq.translations[language as keyof typeof faq.translations] ||
      faq.translations.english;

    // If this FAQ should mention teams and we have oddsData, append team names
    if (oddsData && teamMentionFaqs.has(faq.id)) {
      const teamA = oddsData?.matches?.[0]?.teams?.[0]?.name;
      const teamB = oddsData?.matches?.[0]?.teams?.[1]?.name;
      if (teamA && teamB) {
        return `${translatedQuestion} (${teamA} vs ${teamB})`;
      }
    }

    return translatedQuestion;
  }

  if (isEmbedded) {
    // Embedded version without Card wrapper
    return (
      <>
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <HelpCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {getTranslatedText("frequentlyAskedQuestions", language)}
              </h3>
              <p className="text-xs text-muted-foreground">
                {getTranslatedText("quickQuestions", language)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block px-2 py-1 bg-muted rounded-md">
              {getTranslatedText("tapToAsk", language)}
            </p>
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
            {faqQuestions.map((faq) => {
              const finalQuestion = buildFinalQuestion(faq);

              return (
                <button
                  key={faq.id}
                  onClick={() => {
                    onAskQuestion(finalQuestion, faq.id);
                  }}
                  aria-label={`${getTranslatedText(
                    "askPrefix",
                    language
                  )} ${finalQuestion}`}
                  className="group flex items-center justify-between gap-3 p-3 bg-muted/30 hover:bg-muted/60 rounded-lg border border-transparent hover:border-border transition-all duration-200 text-left"
                >
                  <p className="text-sm leading-snug flex-1">{finalQuestion}</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  // Standalone version with Card wrapper
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <HelpCircle className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              {getTranslatedText("frequentlyAskedQuestions", language)}
            </h3>
            <p className="text-xs text-muted-foreground">
              {getTranslatedText("quickQuestions", language)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block px-2 py-1 bg-muted rounded-md">
            {getTranslatedText("tapToAsk", language)}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
          {faqQuestions.map((faq) => {
            const finalQuestion = buildFinalQuestion(faq);

            return (
              <button
                key={faq.id}
                onClick={() => {
                  onAskQuestion(finalQuestion, faq.id);
                }}
                aria-label={`${getTranslatedText(
                  "askPrefix",
                  language
                )} ${finalQuestion}`}
                className="group flex items-center justify-between gap-3 p-3 bg-muted/30 hover:bg-muted/60 rounded-lg border border-transparent hover:border-border transition-all duration-200 text-left"
              >
                <p className="text-sm leading-snug flex-1">{finalQuestion}</p>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
