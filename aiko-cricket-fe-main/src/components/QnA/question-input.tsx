import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Mic, MicOff, Plus, MessageSquare, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { QuestionInputProps } from "@/components/components.props.types";
import STTFeedbackDialog from "./stt-feedback-dialog";
import { useLanguage } from "@/contexts/language-context";
import { faqQuestions } from "./faq-section";
import { useDebounce } from "@/hooks/use-debounce";

// Local types for FAQs and suggestion items
interface FAQ {
  id: string;
  translations: Record<string, string>;
  template?: string;
  keywords?: string[]; // optional because `faqQuestions` may omit keywords
  // allow other fields but keep type-safe access to known ones
  [k: string]: unknown;
}

type Suggestion = FAQ & { score?: number; finalQuestion?: string };

// Fuzzy search function with enhanced scoring
const fuzzyMatch = (
  pattern: string,
  str: string
): { score: number; matches: boolean } => {
  pattern = pattern.toLowerCase().trim();
  str = str.toLowerCase();

  if (!pattern) return { score: 0, matches: false };

  // Exact match gets highest score
  if (str === pattern) return { score: 100, matches: true };

  // Substring match gets high score
  if (str.includes(pattern)) {
    const score = (pattern.length / str.length) * 80;
    return { score, matches: true };
  }

  // Fuzzy character matching
  let patternIdx = 0;
  let score = 0;
  let consecutiveMatches = 0;
  let wordBoundaryMatches = 0;

  // Split into words for better matching
  const words = str.split(/\s+/);
  const patternWords = pattern.split(/\s+/);

  // Check for word-level matches
  for (const patternWord of patternWords) {
    for (const word of words) {
      if (word.startsWith(patternWord)) {
        wordBoundaryMatches += patternWord.length * 2; // Bonus for word start matches
      } else if (word.includes(patternWord)) {
        wordBoundaryMatches += patternWord.length;
      }
    }
  }

  // Character-level fuzzy matching
  for (
    let strIdx = 0;
    strIdx < str.length && patternIdx < pattern.length;
    strIdx++
  ) {
    if (pattern[patternIdx] === str[strIdx]) {
      score += 1 + consecutiveMatches * 0.5;
      consecutiveMatches++;
      patternIdx++;
    } else {
      consecutiveMatches = 0;
    }
  }

  const matches = patternIdx === pattern.length;
  if (matches) {
    score += wordBoundaryMatches;
    // Normalize score
    score = Math.min((score / pattern.length) * 10, 100);
  }

  return { score: matches ? score : 0, matches };
};

// Enhanced fuzzy search with typo tolerance
const searchFAQs = (
  searchTerm: string,
  faqs: FAQ[],
  replacePlaceholders: (template: string) => string,
  language: string
): Array<{
  faq: FAQ;
  score: number;
  matches: boolean;
  finalQuestion: string;
}> => {
  if (searchTerm.length < 2) return [];

  const results = faqs
    .map((faq) => {
      const translatedQuestion =
        faq.translations[language as keyof typeof faq.translations] ||
        faq.translations.english;
      const finalQuestion = replacePlaceholders(translatedQuestion);

      // Search in question text
      const questionMatch = fuzzyMatch(searchTerm, finalQuestion);

      // Search in keywords with higher weight
      let keywordScore = 0;
      let keywordMatches = false;

      for (const keyword of faq.keywords || []) {
        const keywordMatch = fuzzyMatch(searchTerm, keyword);
        if (keywordMatch.matches) {
          keywordMatches = true;
          keywordScore = Math.max(keywordScore, keywordMatch.score * 1.5); // Keywords get bonus
        }

        // Also check if search term starts with keyword or vice versa
        if (
          keyword.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
          searchTerm.toLowerCase().startsWith(keyword.toLowerCase())
        ) {
          keywordMatches = true;
          keywordScore = Math.max(keywordScore, 60);
        }
      }

      // Combined scoring with weights
      let totalScore = 0;
      let hasMatch = false;

      if (questionMatch.matches) {
        totalScore += questionMatch.score * 2; // Question matches are most important
        hasMatch = true;
      }

      if (keywordMatches) {
        totalScore += keywordScore;
        hasMatch = true;
      }

      // Boost score for shorter questions (more relevant)
      if (hasMatch && finalQuestion.length < 100) {
        totalScore += 5;
      }

      return {
        faq,
        score: Math.round(totalScore),
        matches: hasMatch,
        finalQuestion,
      };
    })
    .filter((result) => result.matches && result.score > 5) // Filter out low-quality matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // Limit to top 5 results

  return results;
};

// --- SuggestionsDropdown extracted to module scope ---
interface SuggestionsDropdownProps {
  showSuggestions: boolean;
  filteredSuggestions: Suggestion[];
  suggestionsRef: React.RefObject<HTMLDivElement | null>;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  handleSuggestionClick: (faq: Suggestion) => void;
  highlightMatches: (text: string, searchTerm: string) => React.ReactNode;
  debouncedText: string;
  getTranslatedText: (key: string, lang?: string) => string;
  language: string;
  replacePlaceholders: (template: string) => string;
}

const SuggestionsDropdown = React.memo<SuggestionsDropdownProps>(
  ({
    showSuggestions,
    filteredSuggestions,
    suggestionsRef,
    highlightedIndex,
    setHighlightedIndex,
    handleSuggestionClick,
    highlightMatches,
    debouncedText,
    getTranslatedText,
    language,
    replacePlaceholders,
  }) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return null;

    return (
      <div
        ref={suggestionsRef}
        className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
      >
        <div className="p-2">
          <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground border-b mb-2">
            <div className="flex items-center gap-2">
              <Search className="h-3 w-3" />
              <span>{getTranslatedText("faqSuggestions", language)}</span>
            </div>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
              {filteredSuggestions.length}{" "}
              {getTranslatedText("found", language)}
            </span>
          </div>
          {filteredSuggestions.map((faq: Suggestion, index: number) => {
            const finalQuestion =
              faq.finalQuestion ||
              replacePlaceholders(
                (faq.translations[
                  language as keyof typeof faq.translations
                ] as string) || (faq.translations.english as string)
              );

            return (
              <button
                key={faq.id}
                onClick={() => handleSuggestionClick(faq)}
                className={`w-full text-left p-3 rounded-md text-sm hover:bg-muted/80 transition-colors border-l-2 relative ${
                  index === highlightedIndex
                    ? "bg-muted border-l-primary"
                    : "border-l-transparent hover:border-l-muted-foreground/30"
                }`}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm leading-relaxed">
                      {highlightMatches(finalQuestion, debouncedText)}
                    </div>
                    {faq.score && (
                      <div className="flex items-center gap-1 mt-1">
                        {(faq.keywords || [])
                          .slice(0, 3)
                          .map((keyword: string, kwIndex: number) => (
                            <span
                              key={`${faq.id}-kw-${kwIndex}`}
                              className="inline-block px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-sm"
                            >
                              {keyword}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                  {faq.score && (
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs text-muted-foreground font-mono">
                        {Math.round(faq.score)}%
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

SuggestionsDropdown.displayName = "SuggestionsDropdown";

const QuestionInput: React.FC<QuestionInputProps> = ({
  text,
  setText,
  isListening,
  isLoading,
  onMicClick,
  onAddQuestion,
  onClearAllQuestions,
  questionsLength,
  sendSTTFeedback,
  apim_url,
  apim_key,
  user_id,
  lastRecognizedText,
  SHOW_FEEDBACK,
  textFromSpeech,
  isEmbedded = false,
  oddsData,
  onAskFAQQuestion,
  showFAQ = true,
}) => {
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>(
    []
  );
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
    english: {
      listening: "Listening...",
      tapMicOrType: "Tap the mic or type your question",
      typePlaceholder: "Type your question to add it to the queue...",
      addQuestion: "Add Question",
      speechServiceFeedback: "Speech Service Feedback",
      clearAllQuestions: "Clear All",
      faqSuggestions: "FAQ Suggestions",
      found: "found",
    },
    hindi: {
      listening: "Listening...",
      tapMicOrType: "Tap the mic or type your question",
      typePlaceholder: "Type your question to add it to the queue...",
      addQuestion: "Add Question",
      speechServiceFeedback: "Speech Service Feedback",
      clearAllQuestions: "Clear All",
      faqSuggestions: "FAQ Suggestions",
      found: "found",
    },
    hinglish: {
      listening: "Listening...",
      tapMicOrType: "Tap the mic or type your question",
      typePlaceholder: "Type your question to add it to the queue...",
      addQuestion: "Add Question",
      speechServiceFeedback: "Speech Service Feedback",
      clearAllQuestions: "Clear All",
      faqSuggestions: "FAQ Suggestions",
      found: "found",
    },
    haryanvi: {
      listening: "Listening...",
      tapMicOrType: "Tap the mic or type your question",
      typePlaceholder: "Type your question to add it to the queue...",
      addQuestion: "Add Question",
      speechServiceFeedback: "Speech Service Feedback",
      clearAllQuestions: "Clear All",
      faqSuggestions: "FAQ Suggestions",
      found: "found",
    }
  };

  const getTranslatedText = (key: string, lang?: string) => {
    if (!lang) return UI_TRANSLATIONS.english[key] || key;
    const langKey = lang.toLowerCase();
    return (
      UI_TRANSLATIONS[langKey]?.[key] || UI_TRANSLATIONS.english[key] || key
    );
  };

  const debouncedText = useDebounce(text, 300);

  // Function to replace placeholders in FAQ questions (memoized)
  const replacePlaceholders = useCallback(
    (template: string) => {
      if (!oddsData?.matches?.[0]) return template;

      const matchInfo = oddsData.matches[0] as {
        competitions?: { title?: string; season?: string };
        teams?: Array<{ name?: string }>;
      };

      return template
        .replace(/\[tournament_title\]/g, matchInfo.competitions?.title || "")
        .replace(/\[tournament_season\]/g, matchInfo.competitions?.season || "")
        .replace(/\[team1_full_name\]/g, matchInfo.teams?.[0]?.name || "")
        .replace(/\[team2_full_name\]/g, matchInfo.teams?.[1]?.name || "");
    },
    [oddsData]
  );

  // Filter FAQ questions based on user input with fuzzy search
  useEffect(() => {
    if (!showFAQ) {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
      return;
    }

    if (debouncedText.trim().length < 2) {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
      return;
    }

    const searchResults = searchFAQs(
      debouncedText,
      faqQuestions as FAQ[],
      replacePlaceholders,
      language
    );
    const filtered: Suggestion[] = searchResults.map((result) => ({
      ...result.faq,
      score: result.score,
      finalQuestion: result.finalQuestion,
    }));

    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setHighlightedIndex(-1);
  }, [debouncedText, language, oddsData, replacePlaceholders, showFAQ]);

  const handleSendSTTFeedback = async (userFeedback: string) => {
    if (!sendSTTFeedback || !apim_url || !apim_key || !user_id) return;

    setIsSendingFeedback(true);
    try {
      await sendSTTFeedback(apim_url, apim_key, user_id, userFeedback);
    } finally {
      setIsSendingFeedback(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = useCallback((faq: Suggestion) => {
    const finalQuestion =
      faq.finalQuestion ||
      replacePlaceholders(
        (faq.translations[
          language as keyof typeof faq.translations
        ] as string) || (faq.translations.english as string)
      );

    if (onAskFAQQuestion) {
      onAskFAQQuestion(finalQuestion, faq.id);
    } else {
      setText(finalQuestion);
    }
    setShowSuggestions(false);
    textareaRef.current?.focus();
  }, [language, onAskFAQQuestion, replacePlaceholders]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case "Enter":
        if (highlightedIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // Handle focus/blur for suggestions
  const handleTextareaFocus = () => {
    if (filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleTextareaBlur = () => {
    // Delay hiding suggestions to allow clicks on suggestions
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 150);
  };

  // Function to highlight matching text
  const highlightMatches = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const suggestionsDropdownProps = {
    showSuggestions,
    filteredSuggestions,
    suggestionsRef,
    highlightedIndex,
    setHighlightedIndex,
    handleSuggestionClick,
    highlightMatches,
    debouncedText,
    getTranslatedText,
    language,
    replacePlaceholders,
  };

  if (isEmbedded) {
    // Embedded version without Card wrapper
    return (
      <>
        <div className="flex flex-col items-center space-y-4 p-6">
          <div>
            {isLoading ? (
              <span className="loader"></span>
            ) : (
              <>
                {isListening ? (
                  <Button
                    variant="outline"
                    className="rounded-full"
                    type="button"
                    size={"xl"}
                  >
                    <MicOff className="text-muted-foreground" size={24} />
                  </Button>
                ) : (
                  <Button
                    onClick={onMicClick}
                    variant="outline"
                    className="rounded-full"
                    type="button"
                    size={"xl"}
                  >
                    <Mic className="text-muted-foreground" size={80} />
                  </Button>
                )}
              </>
            )}
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {isListening
              ? getTranslatedText("listening", language)
              : getTranslatedText("tapMicOrType", language)}
          </p>
          <div className="relative w-full">
            <Textarea
              ref={textareaRef}
              className="max-h-[calc(75dvh)] flex-1 overflow-hidden rounded-xl rounded-l-md bg-muted px-4 py-2 text-base w-full"
              placeholder={getTranslatedText("typePlaceholder", language)}
              rows={3}
              onKeyDown={(event) => {
                handleKeyDown(event);
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !showSuggestions
                ) {
                  event.preventDefault();
                  onAddQuestion();
                }
              }}
              value={text}
              onChange={handleTextChange}
              onFocus={handleTextareaFocus}
              onBlur={handleTextareaBlur}
            />
            <SuggestionsDropdown {...suggestionsDropdownProps} />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center px-6 pb-6">
          <Button
            onClick={() => onAddQuestion()}
            className="flex w-full transform items-center gap-2 transition-all duration-200 ease-in-out active:scale-90 sm:w-auto"
            disabled={isListening || !text.trim()}
            aria-disabled={isListening || !text.trim()}
            variant={"default"}
          >
            <Plus className="h-4 w-4" />
            {isListening
              ? getTranslatedText("listening", language)
              : getTranslatedText("addQuestion", language)}
          </Button>
          {SHOW_FEEDBACK && textFromSpeech && (
            <Button
              onClick={() => setIsFeedbackDialogOpen(true)}
              variant="outline"
              className="flex w-full items-center gap-2 sm:w-auto"
              disabled={isListening}
            >
              <MessageSquare className="h-4 w-4" />
              {getTranslatedText("speechServiceFeedback", language)}
            </Button>
          )}
          {questionsLength > 0 && (
            <Button
              variant="destructive"
              type="button"
              onClick={onClearAllQuestions}
              className="w-full sm:w-auto"
            >
              {getTranslatedText("clearAllQuestions", language)}
            </Button>
          )}
        </div>

        <STTFeedbackDialog
          open={isFeedbackDialogOpen}
          onOpenChange={setIsFeedbackDialogOpen}
          recognizedText={lastRecognizedText || ""}
          onSendFeedback={handleSendSTTFeedback}
          isLoading={isSendingFeedback}
        />
      </>
    );
  }

  // Standalone version with Card wrapper
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center space-y-4 mt-4">
        <div>
          {isLoading ? (
            <span className="loader"></span>
          ) : (
            <>
              {isListening ? (
                <Button
                  variant="outline"
                  className="rounded-full"
                  type="button"
                  size={"xl"}
                >
                  <MicOff className="text-muted-foreground" size={24} />
                </Button>
              ) : (
                <Button
                  onClick={onMicClick}
                  variant="outline"
                  className="rounded-full"
                  type="button"
                  size={"xl"}
                >
                  <Mic className="text-muted-foreground" size={80} />
                </Button>
              )}
            </>
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {isListening
            ? getTranslatedText("listening", language)
            : getTranslatedText("tapMicOrType", language)}
        </p>
        <div className="relative w-full">
          <Textarea
            ref={textareaRef}
            className="max-h-[calc(75dvh)] flex-1 overflow-hidden rounded-xl rounded-l-md bg-muted px-4 py-2 text-base"
            placeholder={getTranslatedText("typePlaceholder", language)}
            rows={3}
            onKeyDown={(event) => {
              handleKeyDown(event);
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !showSuggestions
              ) {
                event.preventDefault();
                onAddQuestion();
              }
            }}
            value={text}
            onChange={handleTextChange}
            onFocus={handleTextareaFocus}
            onBlur={handleTextareaBlur}
          />
          <SuggestionsDropdown {...suggestionsDropdownProps} />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center py-4">
        <Button
          onClick={() => onAddQuestion()}
          className="flex w-full transform items-center gap-2 transition-all duration-200 ease-in-out active:scale-90 sm:w-auto"
          disabled={isListening || !text.trim()}
          aria-disabled={isListening || !text.trim()}
          variant={"default"}
        >
          <Plus className="h-4 w-4" />
          {isListening
            ? getTranslatedText("listening", language)
            : getTranslatedText("addQuestion", language)}
        </Button>{" "}
        {SHOW_FEEDBACK && textFromSpeech && (
          <Button
            onClick={() => setIsFeedbackDialogOpen(true)}
            variant="outline"
            className="flex w-full items-center gap-2 sm:w-auto"
            disabled={isListening}
          >
            <MessageSquare className="h-4 w-4" />
            {getTranslatedText("speechServiceFeedback", language)}
          </Button>
        )}
        {questionsLength > 0 && (
          <Button
            variant="destructive"
            type="button"
            onClick={onClearAllQuestions}
            className="w-full sm:w-auto"
          >
            {getTranslatedText("clearAllQuestions", language)}
          </Button>
        )}
      </CardFooter>

      <STTFeedbackDialog
        open={isFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
        recognizedText={lastRecognizedText || ""}
        onSendFeedback={handleSendSTTFeedback}
        isLoading={isSendingFeedback}
      />
    </Card>
  );
};

export default QuestionInput;
