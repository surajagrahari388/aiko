"use client";

import type React from "react";
import { useMemo, memo, useCallback, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  MessageSquare,
  History,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useConversationHistory } from "@/hooks/use-conversation-history";
import type { SportsMatches } from "@/lib/types";
import type { Message } from "@/lib/schemas/qna";
import AnswerDisplay from "@/components/QnA/answer-display";
import Feedback from "@/components/QnA/feedback";
import { useLanguage } from "@/contexts/language-context";
import { formatUtcToLocal } from "@/lib/utils";

interface ConversationHistoryProps {
  user_id: string;
  match_id: string;
  apim_key: string;
  base_conversation_url: string;
  stats?: SportsMatches;
  apim_url: string;
  SHOW_FAVOURITE_TIPS?: boolean;
}

const FALLBACK_STATS: SportsMatches = {
  sports: "cricket",
  matches: [{
    match_id: "unknown",
    title: "Unknown Match",
    short_title: "Unknown Match",
    subtitle: "Unknown Subtitle",
    date_start: new Date().toISOString(),
    date_end: new Date().toISOString(),
    date_start_ist: new Date().toISOString(),
    date_end_ist: new Date().toISOString(),
    format_str: "Unknown Format",
    status_str: "Unknown",
    status_note: null,
    game_state_str: "Unknown",
    result: null,
    weather: "Unknown",
    weather_desc: "Unknown",
    wind_speed: 0,
    clouds: 0,
    toss_winner: "Unknown",
    pitch_type: "Unknown",
    pitch_batting: "Unknown",
    pitch_bowling_pace: "Unknown",
    pitch_bowling_spin: "Unknown",
    updated_at: new Date().toISOString(),
    is_lineup_out: false,
    umpires: "Unknown",
    referee: "Unknown",
    competitions: {
      status: "unknown",
      type: "unknown",
      cid: "unknown",
      title: "Unknown Tournament",
      abbr: "UNK",
      category: "unknown",
      match_format: "unknown",
      season: "unknown",
      date_start: new Date().toISOString(),
      date_end: new Date().toISOString(),
      country: "unknown",
      total_matches: 0,
      total_rounds: 0,
      total_teams: 0,
      player_of_the_series: null,
      updated_at: new Date().toISOString(),
    },
    teams: [],
    venues: {
      venue_id: "unknown",
      name: "Unknown Venue",
      location: "Unknown",
      country: "Unknown",
      timezone: "UTC",
    },
    contests: [],
  }],
};

// Grid question card component matching the exact layout of question queue
const HistoryQuestionCard: React.FC<{
  question: string;
  index: number;
  timestamp?: string;
  onViewAnswer: (index: number) => void;
  getTranslatedText: (key: string, lang?: string) => string;
  language?: string;
}> = memo(
  ({
    question,
    index,
    timestamp,
    onViewAnswer,
    getTranslatedText,
    language,
  }) => {
    const formattedDate = useMemo(() => {
      return timestamp
        ? formatUtcToLocal(timestamp, { year: "numeric", month: "short", day: "numeric" })
        : null;
    }, [timestamp]);

    return (
      <div className="rounded-lg border p-4 transition-all duration-300 hover:shadow-lg">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Q{index + 1}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              <CheckCircle className="h-3 w-3" />
              {getTranslatedText("completed", language)}
            </span>
          </div>
          {formattedDate && (
            <span className="text-xs text-muted-foreground">
              {formattedDate}
            </span>
          )}
        </div>
        <p className="mb-3 line-clamp-3 text-sm text-foreground">{question}</p>
        <button
          onClick={() => onViewAnswer(index)}
          className="inline-flex w-full items-center justify-center gap-1 rounded-md border bg-card px-3 py-2 text-xs font-medium text-card-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Eye className="h-3 w-3" />
          {getTranslatedText("viewAnswer", language)}
        </button>
      </div>
    );
  }
);

HistoryQuestionCard.displayName = "HistoryQuestionCard";

// Answer dialog component
const AnswerDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionAnswerPairs: Array<{
    questionMsg: Message;
    answerMsg: Message;
    timestamp?: string;
    conversationId: string;
  }>;
  activeIndex: number | null;
  onNavigate: (direction: "prev" | "next") => void;
  user_id: string;
  stats?: SportsMatches;
  SHOW_FAVOURITE_TIPS?: boolean;
  getTranslatedText: (key: string, lang?: string) => string;
  language?: string;
}> = memo(
  ({
    open,
    onOpenChange,
    questionAnswerPairs,
    activeIndex,
    onNavigate,
    user_id,
    stats,
    SHOW_FAVOURITE_TIPS,
    getTranslatedText,
    language,
  }) => {
    const activePair = useMemo(() => {
      return activeIndex !== null ? questionAnswerPairs[activeIndex] : null;
    }, [questionAnswerPairs, activeIndex]);

    const conversationId = activePair?.conversationId || "";

    const navigationState = useMemo(() => {
      const showNavigation =
        questionAnswerPairs.length > 1 && activeIndex !== null;
      const currentPosition = activeIndex !== null ? activeIndex + 1 : 0;
      return {
        showNavigation,
        currentPosition,
        total: questionAnswerPairs.length,
      };
    }, [questionAnswerPairs.length, activeIndex]);

    const messages = useMemo((): Message[] => {
      return activePair ? [activePair.questionMsg, activePair.answerMsg] : [];
    }, [activePair]);

    const effectiveStats = stats || FALLBACK_STATS;

    if (!activePair) return null;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="mx-2 flex h-[85vh] max-h-[85vh] max-w-4xl flex-col overflow-hidden p-0 sm:mx-4 lg:h-[90vh] lg:max-h-[90vh]">
          <DialogHeader className="shrink-0 border-b p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-semibold sm:text-lg">
                    Q{navigationState.currentPosition}:{" "}
                    {getTranslatedText("answer", language)}
                  </DialogTitle>
                  {navigationState.showNavigation && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate("prev")}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {navigationState.currentPosition}{" "}
                        {getTranslatedText("of", language)}{" "}
                        {navigationState.total}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate("next")}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {activePair.questionMsg.content}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-4 sm:p-6">
              <AnswerDisplay messages={messages} isLoading={false} />
            </div>
          </div>

          <div className="shrink-0 border-t p-4 sm:p-6">
            <div className="flex w-full justify-center">
              <Feedback
                key={`feedback-${
                  messages[messages.length - 1]?.id
                }-${conversationId}`}
                className="ml-0"
                messages={messages}
                index={messages.length - 1}
                conversation_id={conversationId}
                user_id={user_id}
                stats={effectiveStats}
                SHOW_FAVOURITE_TIPS={SHOW_FAVOURITE_TIPS}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

AnswerDialog.displayName = "AnswerDialog";

// Loading skeleton component
const LoadingSkeleton: React.FC = memo(() => (
  <Card className="w-full bg-card/60 backdrop-blur-sm border-border/30 shadow-sm">
    <CardHeader className="pb-4">
      <div className="flex items-center space-x-3">
        <div className="w-5 h-5 rounded bg-muted/40 animate-pulse"></div>
        <Skeleton className="h-5 w-48" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-8 h-8 border-3 border-muted rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </CardContent>
  </Card>
));

LoadingSkeleton.displayName = "LoadingSkeleton";

// Error state component
const ErrorState: React.FC<{ error: string; onRetry: () => void }> = memo(
  ({ error, onRetry }) => (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <CardTitle className="text-lg">Recently Asked Questions</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-8 bg-transparent"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Failed to load recent questions
          </p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </CardContent>
    </Card>
  )
);

ErrorState.displayName = "ErrorState";

// Empty state component
const EmptyState: React.FC<{ onRefresh: () => void }> = memo(
  ({ onRefresh }) => (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <CardTitle className="text-lg">Recently Asked Questions</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onRefresh} className="h-8">
            <RefreshCw className="h-4 w-4 mr-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No recent questions found for this match
          </p>
        </div>
      </CardContent>
    </Card>
  )
);

EmptyState.displayName = "EmptyState";

export const ConversationHistory: React.FC<ConversationHistoryProps> = memo(
  ({
    user_id,
    match_id,
    apim_key,
    base_conversation_url,
    stats,
    apim_url,
    SHOW_FAVOURITE_TIPS,
  }) => {
    const { language } = useLanguage();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeAnswerIndex, setActiveAnswerIndex] = useState<number | null>(
      null
    );
    const [showAll, setShowAll] = useState(false);
    const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
      english: {
        completed: "Completed",
        viewAnswer: "View Answer",
        answer: "Answer",
        of: "of",
        recentlyAsked: "Recently Asked Questions",
        conversationHistory: "Your conversation history will appear here",
        loadingQuestions: "Loading recent questions...",
        failedToLoad: "Failed to load recent questions",
        retry: "Retry",
        noRecentQuestions: "No recent questions found for this match",
        showMore: "Show more",
        showLess: "Show less",
        lastUpdated: "Last updated:",
      },
      hindi: {
        completed: "Completed",
        viewAnswer: "View Answer",
        answer: "Answer",
        of: "of",
        recentlyAsked: "Recently Asked Questions",
        conversationHistory: "Your conversation history will appear here",
        loadingQuestions: "Loading recent questions...",
        failedToLoad: "Failed to load recent questions",
        retry: "Retry",
        noRecentQuestions: "No recent questions found for this match",
        showMore: "Show more",
        showLess: "Show less",
        lastUpdated: "Last updated:",
      },
      hinglish: {
        completed: "Completed",
        viewAnswer: "View Answer",
        answer: "Answer",
        of: "of",
        recentlyAsked: "Recently Asked Questions",
        conversationHistory: "Your conversation history will appear here",
        loadingQuestions: "Loading recent questions...",
        failedToLoad: "Failed to load recent questions",
        retry: "Retry",
        noRecentQuestions: "No recent questions found for this match",
        showMore: "Show more",
        showLess: "Show less",
        lastUpdated: "Last updated:",
      },
      haryanvi: {
        completed: "Completed",
        viewAnswer: "View Answer",
        answer: "Answer",
        of: "of",
        recentlyAsked: "Recently Asked Questions",
        conversationHistory: "Your conversation history will appear here",
        loadingQuestions: "Loading recent questions...",
        failedToLoad: "Failed to load recent questions",
        retry: "Retry",
        noRecentQuestions: "No recent questions found for this match",
        showMore: "Show more",
        showLess: "Show less",
        lastUpdated: "Last updated:",
      },
    };

    const getTranslatedText = (key: string, lang?: string) => {
      if (!lang) return UI_TRANSLATIONS.english[key] || key;
      const langKey = lang.toLowerCase();
      return (
        UI_TRANSLATIONS[langKey]?.[key] || UI_TRANSLATIONS.english[key] || key
      );
    };

    const config = useMemo(
      () => ({
        base_conversation_url,
        apim_url,
        apim_key,
        user_id,
        match_id,
      }),
      [base_conversation_url, apim_url, apim_key, user_id, match_id]
    );

    const { conversationHistory, isLoading, error, refetch } =
      useConversationHistory(config);

    const questionAnswerPairs = useMemo(() => {
      if (!conversationHistory?.messages?.length) return [];

      const pairs: Array<{
        questionMsg: Message;
        answerMsg: Message;
        timestamp?: string;
        conversationId: string;
      }> = [];
      const messages = conversationHistory.messages;

      // Sort messages by creation time to ensure proper order
      const sortedMessages = [...messages].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Separate user and assistant messages
      const userMessages = sortedMessages.filter(msg => msg.role === "user" && msg.content?.trim());
      const assistantMessages = sortedMessages.filter(msg => msg.role === "assistant" && msg.content?.trim());

      // First pass: Match by queryId
      const usedAssistantIds = new Set<string>();
      const usedUserIds = new Set<string>();

      for (const userMsg of userMessages) {
        if (!userMsg.queryId) continue;

        const matchingAssistant = assistantMessages.find(assistantMsg => 
          !usedAssistantIds.has(assistantMsg.id) && 
          assistantMsg.queryId === userMsg.queryId
        );

        if (matchingAssistant) {
          pairs.push({
            questionMsg: userMsg,
            answerMsg: matchingAssistant,
            timestamp: userMsg.createdAt,
            conversationId: userMsg.conversationId || "",
          });
          usedAssistantIds.add(matchingAssistant.id);
          usedUserIds.add(userMsg.id);
        }
      }

      // Second pass: Match remaining messages by conversation and timing
      const remainingUserMsgs = userMessages.filter(msg => !usedUserIds.has(msg.id));
      const remainingAssistantMsgs = assistantMessages.filter(msg => !usedAssistantIds.has(msg.id));

      for (const userMsg of remainingUserMsgs) {
        // Find the closest assistant message after this user message in the same conversation
        const candidateAssistants = remainingAssistantMsgs.filter(assistantMsg => 
          !usedAssistantIds.has(assistantMsg.id) &&
          assistantMsg.conversationId === userMsg.conversationId &&
          new Date(assistantMsg.createdAt).getTime() >= new Date(userMsg.createdAt).getTime()
        );

        // Sort by creation time and take the earliest
        candidateAssistants.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        const matchingAssistant = candidateAssistants[0];
        if (matchingAssistant) {
          pairs.push({
            questionMsg: userMsg,
            answerMsg: matchingAssistant,
            timestamp: userMsg.createdAt,
            conversationId: userMsg.conversationId || "",
          });
          usedAssistantIds.add(matchingAssistant.id);
          usedUserIds.add(userMsg.id);
        }
      }

      // Sort pairs by timestamp (newest first)
      return pairs.sort((a, b) => 
        new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
      );
    }, [conversationHistory?.messages]);

    const handleNavigateAnswer = useCallback(
      (direction: "prev" | "next") => {
        if (activeAnswerIndex === null || questionAnswerPairs.length === 0)
          return;

        const totalQuestions = questionAnswerPairs.length;
        setActiveAnswerIndex((prevIndex) => {
          if (prevIndex === null) return null;

          if (direction === "prev") {
            return (prevIndex - 1 + totalQuestions) % totalQuestions;
          } else {
            return (prevIndex + 1) % totalQuestions;
          }
        });
      },
      [questionAnswerPairs.length, activeAnswerIndex]
    );

    const handleViewAnswer = useCallback((index: number) => {
      setActiveAnswerIndex(index);
      setIsDialogOpen(true);
    }, []);

    const handleRefresh = useCallback(() => {
      refetch();
    }, [refetch]);

    const handleDialogOpenChange = useCallback((open: boolean) => {
      setIsDialogOpen(open);
    }, []);

    const lastUpdated = useMemo(() => {
      const timestamp =
        conversationHistory?.updated_at || conversationHistory?.created_at;
      return timestamp
        ? formatUtcToLocal(timestamp, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
    }, [conversationHistory?.updated_at, conversationHistory?.created_at]);

    const questionCount = questionAnswerPairs.length;

    // Show only top 3 by default; allow toggling to show the rest
    const displayedPairs = showAll ? questionAnswerPairs : questionAnswerPairs.slice(0, 3);

    useEffect(() => {
      if (questionCount <= 2 && showAll) {
        setShowAll(false);
      }
    }, [questionCount, showAll]);

    // Early return if conversation is empty and not loading/error
    if (!isLoading && !error && !conversationHistory?.messages?.length) {
      return null;
    }

    if (!match_id?.trim()) return null;
    return (
      <>
        <section className="relative flex flex-col justify-center gap-4 overflow-hidden border-y bg-background px-3 py-3 md:py-6">
          <div className="absolute left-0 top-3.5 h-6 w-1 rounded-full bg-primary md:top-7" />
          <div className="flex items-center space-x-4">
            <div className="grow">
              <h4 className="text-lg font-bold text-foreground md:text-xl 2xl:text-2xl">
                {getTranslatedText("recentlyAsked", language)}
                {isLoading || error || questionCount === 0
                  ? ""
                  : ` (${questionCount})`}
              </h4>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8"
              disabled={isLoading}
            >
              <RefreshCw
                className={`text-primary h-4 w-4 mr-1 ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
            </Button>
          </div>

          {/* Content area */}
          <div>
            {isLoading ? (
              <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-6" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="mb-3 space-y-1.5">
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3.5 w-2/3" />
                    </div>
                    <Skeleton className="h-8 w-full rounded-md" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-sm text-muted-foreground mb-2">
                  {getTranslatedText("failedToLoad", language)}
                </p>
                <p className="text-xs text-muted-foreground mb-3">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="h-8 bg-transparent"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {getTranslatedText("retry", language)}
                </Button>
              </div>
            ) : !conversationHistory?.messages?.length ||
              questionAnswerPairs.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  {getTranslatedText("noRecentQuestions", language)}
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {displayedPairs.map((pair, displayIndex) => {
                    return (
                      <HistoryQuestionCard
                        key={`${pair.questionMsg.id}-${pair.answerMsg.id}`}
                        question={pair.questionMsg.content}
                        index={displayIndex}
                        timestamp={pair.timestamp}
                        onViewAnswer={handleViewAnswer}
                        getTranslatedText={getTranslatedText}
                        language={language}
                      />
                    );
                  })}
                </div>

                {questionCount > 2 && (
                  <div className="flex justify-center mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAll((prev) => !prev)}
                    >
                      {showAll ? getTranslatedText("showLess", language) : getTranslatedText("showMore", language)}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {lastUpdated && !isLoading && !error && questionCount > 0 && (
            <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
              {getTranslatedText("lastUpdated", language)} {lastUpdated}
            </div>
          )}
        </section>

        <AnswerDialog
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          questionAnswerPairs={questionAnswerPairs}
          activeIndex={activeAnswerIndex}
          onNavigate={handleNavigateAnswer}
          user_id={user_id}
          stats={stats}
          SHOW_FAVOURITE_TIPS={SHOW_FAVOURITE_TIPS}
          getTranslatedText={getTranslatedText}
          language={language}
        />
      </>
    );
  }
);

ConversationHistory.displayName = "ConversationHistory";
