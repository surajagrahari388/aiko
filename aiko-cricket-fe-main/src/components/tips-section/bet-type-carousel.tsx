"use client";

import React, { useState, useContext } from "react";
import { TenantContext } from "@/contexts/analytics-context";
import {
  cn,
  formatDateWithTimezone,
  getBrowserGmtOffsetLabel,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

import { useMicrosoftSpeechSdk } from "@/hooks/use-microsoft-speech-sdk";
import { useMultiQuestionChat } from "@/hooks/use-multi-question-chat";
import { useTipNavigation } from "@/hooks/use-tip-navigation";
import { useVisibilityImpression } from "@/hooks/use-visibility-impression";
import { useMicState } from "@/contexts/mic-state-context";
import { useEmbedContext, HEADING_SIZE_MAP, BODY_SIZE_MAP } from "@/contexts/embed-context";
import AudioPlayer from "@/components/audio-player";
import { MemoizedReactMarkdown } from "@/components/ui/markdown";
import remarkGfm from "remark-gfm";
import { log } from "@/lib/debug-logger";
import remarkMath from "remark-math";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  Zap,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { TipSummary, QnaConfig } from "./tips-category-logic";
import posthog from "posthog-js";

/** Parse "inning=1 over=3 ball=2 score=25/1" into readable format */
function formatScoreContext(raw: string): string | null {
  if (!raw) return null;
  const parts: Record<string, string> = {};
  for (const segment of raw.split(/\s+/)) {
    const [key, val] = segment.split("=");
    if (key && val) parts[key] = val;
  }

  const inning = parts.inning;
  const over = parts.over;
  const ball = parts.ball;
  const score = parts.score;

  // All values are "na" — before innings start
  if (score === "na" && ball === "na") {
    return inning === "0" ? "Before innings" : `Inn ${inning} · Start`;
  }

  // Ball 6 means the over is complete — show next over number
  if (ball === "6") {
    return `${Number(over) + 1} ov`;
  }

  // Balls 1-5: show over.ball (e.g., 4.2 ov)
  const oversBall = ball && ball !== "na" && ball !== "0"
    ? `${over}.${ball}`
    : over;

  return `${oversBall} ov`;
}

type BetTypeCarouselProps = {
  betType: string;
  tips: TipSummary[];
  recentTipIds?: string[];
  matchId: number;
  isLiveView?: boolean;
  liveScoreDisplay?: string;
  getCategoryDisplayName: (categoryName: string) => string;
  prettifyCategoryName: (name: string) => string;
  replaceTeamNames: (text: string) => string;
  qnaConfig?: QnaConfig;
  user_id?: string;
  isQnaUnavailable?: boolean;
  ENABLE_TENANT?: boolean;
};

const BetTypeCarouselComponent: React.FC<BetTypeCarouselProps> = ({
  betType,
  tips,
  recentTipIds,
  matchId,
  isLiveView,
  getCategoryDisplayName,
  prettifyCategoryName,
  replaceTeamNames,
  qnaConfig,
  user_id,
  isQnaUnavailable,
  ENABLE_TENANT,
}) => {
  const totalTips = tips.length;
  const {
    currentTipIndex,
    navigateToTip,
    onKeyDown,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  } = useTipNavigation({ totalTips });
  const [isExpanded, setIsExpanded] = useState(false);
  const [ttsAudio, setTtsAudio] = useState<string | null>(null);
  const [loadingTTS, setLoadingTTS] = useState(false);
  const [currentAiResponse, setCurrentAiResponse] = useState<string | null>(
    null
  );
  const [isAiResponseLoading, setIsAiResponseLoading] = useState(false);
  const [highlightedTipId, setHighlightedTipId] = useState<string | null>(null);
  // Keep the highlight for at least 30 seconds (30_000 ms)
  const HIGHLIGHT_MIN_DURATION_MS = 30_000;
  const highlightTimeoutRef = React.useRef<number | null>(null);
  const highlightExpiresAtRef = React.useRef<number | null>(null);
  const { language } = useLanguage();
  const tenantContext = useContext(TenantContext);
  const { subscriptionKey: embedSubscriptionKey, disableAudio, headingSize, bodySize } = useEmbedContext();
  const headingClass = HEADING_SIZE_MAP[headingSize ?? "md"];
  const bodyClass = BODY_SIZE_MAP[bodySize ?? "md"];

  // Ref for the tip content element
  const contentRef = React.useRef<HTMLDivElement>(null);

  const { activeTipId, setActiveTipId, isActiveTip } = useMicState();
  const tipId = `${betType}-${currentTipIndex}`;
  const isMicActive = isActiveTip(tipId);
  const isAnotherTipActive = activeTipId !== null && !isMicActive;

  const { isListening, isLoading, sttl_no_translation } = useMicrosoftSpeechSdk(
    {
      tipId,
      onMicStart: (id) => setActiveTipId(id),
      onMicStop: () => setActiveTipId(null),
    }
  );
  const [toastedQuestions, setToastedQuestions] = useState<Set<string>>(
    new Set()
  );

  const qnaState = useMultiQuestionChat({
    api_url: qnaConfig?.api_url ?? "",
    apim_key: qnaConfig?.apim_key ?? "",
    user_id: qnaConfig?.user_id ?? user_id ?? "",
    stats: qnaConfig?.match_stats,
    squads: qnaConfig?.squads ?? [],
    caching_enabled: true,
    conversation_id: qnaConfig?.conversation_id ?? "",
  });

  // Optimize: Only process questions that changed status
  React.useEffect(() => {
    const newQuestions = qnaState.questions.filter(
      (q) => !toastedQuestions.has(q.id)
    );

    if (newQuestions.length === 0) return;

    for (const question of newQuestions) {
      if (question.status === "processing") {
        setIsAiResponseLoading(true);
      } else if (
        question.status === "completed" &&
        question.messages.length > 1
      ) {
        const assistantMessage = question.messages.find(
          (m) => m.role === "assistant"
        );
        if (assistantMessage?.content) {
          setCurrentAiResponse(assistantMessage.content);
          setIsAiResponseLoading(false);
          setToastedQuestions((prev) => new Set(prev).add(question.id));
        }
      } else if (question.status === "error") {
        setCurrentAiResponse(
          "Sorry, I couldn't process your question right now. Please try again."
        );
        setIsAiResponseLoading(false);
        setToastedQuestions((prev) => new Set(prev).add(question.id));
      }
    }
  }, [qnaState.questions, toastedQuestions]);

  const currentTip = tips[currentTipIndex];

  // Memoize payload for logging to keep callback reference stable
  // Only recreates when actual tip data changes
  const TipEventPayload = React.useMemo(
    () => {
      const baseData = {
        tip_id: currentTip?.tip_id,
        match_id: String(matchId),
        language: language,
        market_category: betType,
        scenario: currentTip?.original_scenario ?? currentTip?.scenario,
      };
      
      if (ENABLE_TENANT) {
        return {
          ...baseData,
          tenant_id: tenantContext?.tenantIdMapping || tenantContext?.tenantId || "Unknown",
          tenant_bet_type: currentTip?.tenant_bet_type,
        };
      }
      
      return baseData;
    },
    [
      currentTip?.tip_id,
      matchId,
      language,
      betType,
      currentTip?.original_scenario,
      currentTip?.scenario,
      ...(ENABLE_TENANT ? [
        currentTip?.tenant_bet_type,
        tenantContext?.tenantIdMapping,
        tenantContext?.tenantId,
      ] : []),
    ]
  );

  // Memoized callback to prevent IntersectionObserver re-attachment
  // The callback reference stays stable across renders (only changes when TipEventPayload changes)
  // This prevents the observer from re-attaching and restarting the visibility timer
  // when unrelated state changes occur (like audio loading, AI response, etc.)
  const handleVisibilityImpression = React.useCallback(() => {
    posthog.capture("tip_impression", TipEventPayload);
    log({
      event_name: "tip_impression",
      payload: TipEventPayload,
    });
  }, [TipEventPayload]);

  // Memoize visibility impression options to prevent effect re-runs
  // The options object must be stable so the hook's dependency array doesn't detect changes
  // If the options object is recreated every render, the IntersectionObserver disconnects/reconnects
  // unnecessarily, causing the visibility timer to restart
  const visibilityOptions = React.useMemo(
    () => ({ threshold: 0.7, duration: 3000 }),
    []
  );

  // Use visibility impression hook to log when tip is 70% visible for 3 seconds
  useVisibilityImpression(
    contentRef as React.RefObject<HTMLElement>,
    handleVisibilityImpression,
    visibilityOptions
  );

  const handleMicClick = async (recognizedText: string) => {
    setCurrentAiResponse(null);
    setIsAiResponseLoading(true);

    const questionId = qnaState.addQuestion(
      recognizedText,
      undefined,
      false,
      undefined,
      "voice"
    );

    if (!questionId) {
      setIsAiResponseLoading(false);
    }
  };

  React.useEffect(() => {
    // Only process recent tip highlighting in live view
    if (!isLiveView || !recentTipIds || recentTipIds.length === 0) return;

    const currentTip = tips[currentTipIndex];
    if (!currentTip) return;

    const isRecent = recentTipIds.includes(currentTip.tip_id);
    const now = Date.now();

    if (isRecent) {
      // If the current tip is new and/or not currently highlighted, set it
      if (highlightedTipId !== currentTip.tip_id) {
        setHighlightedTipId(currentTip.tip_id);
      }

      // If there's no active expire time or we've already passed it, (re)schedule one
      if (
        !highlightExpiresAtRef.current ||
        highlightExpiresAtRef.current <= now
      ) {
        // clear any existing timeout
        if (highlightTimeoutRef.current) {
          window.clearTimeout(highlightTimeoutRef.current);
          highlightTimeoutRef.current = null;
        }

        const expiresAt = now + HIGHLIGHT_MIN_DURATION_MS;
        highlightExpiresAtRef.current = expiresAt;
        // Schedule removal after the minimum duration
        highlightTimeoutRef.current = window.setTimeout(() => {
          setHighlightedTipId((prev) =>
            prev === currentTip.tip_id ? null : prev
          );
          highlightTimeoutRef.current = null;
          highlightExpiresAtRef.current = null;
        }, HIGHLIGHT_MIN_DURATION_MS);
      }
    }
    // No else block: we intentionally do not clear the highlight if the user navigates
    // away — the highlight should persist for the configured duration.

    // We intentionally avoid clearing the timeout here to preserve the minimum
    // highlight duration across renders. Use a separate effect below to clear
    // on component unmount.
    return;
  }, [isLiveView, recentTipIds, tips, currentTipIndex, highlightedTipId]);

  // Ensure any outstanding timers are cleared when the component unmounts.
  React.useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
      highlightExpiresAtRef.current = null;
    };
  }, []);

  const fetchTTS = async (text: string, tip_id: string) => {
    setLoadingTTS(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (embedSubscriptionKey) {
        headers["Ocp-Apim-Subscription-Key"] = embedSubscriptionKey;
      }
      const response = await fetch("/api/tts", {
        method: "POST",
        headers,
        body: JSON.stringify({
          match_id: matchId,
          tip_id: tip_id,
          summary: text,
          language: language,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch TTS");
      }
      const { audio } = await response.json();
      setTtsAudio(audio);
    } catch (err) {
      console.error("Failed to fetch TTS audio:", err);
    } finally {
      setLoadingTTS(false);
    }
  };

  const truncateText = (
    text: string,
    wordLimit: number = 50
  ): { truncated: string; isTruncated: boolean } => {
    const words = text.split(" ");
    if (words.length <= wordLimit) {
      return { truncated: text, isTruncated: false };
    }
    const truncated = words.slice(0, wordLimit).join(" ") + "...";
    return { truncated, isTruncated: true };
  };

  const { truncated: truncatedSummary, isTruncated } = truncateText(
    replaceTeamNames(currentTip.summary)
  );

  const gmtLabel = React.useMemo(() => getBrowserGmtOffsetLabel(), []);

  const formattedUpdatedAt = React.useMemo(() => {
    // For live/in-game tips: parse updated_at_score into readable format
    if (currentTip?.is_live || currentTip?.original_bet_type_live) {
      if (!currentTip?.updated_at_score) return null;
      return formatScoreContext(currentTip.updated_at_score);
    }
    if (!currentTip?.updated_at) return null;
    try {
      const timePart = formatDateWithTimezone(currentTip.updated_at, "utc", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `${timePart}`;
    } catch (err) {
      console.error("Error formatting date:", err);
      return currentTip.updated_at;
    }
  }, [currentTip?.updated_at, currentTip?.updated_at_score, currentTip?.is_live, currentTip?.original_bet_type_live]);

  const handleNavigateToTip = (nextIndex: number) => {
    navigateToTip(nextIndex);
    setIsExpanded(false);
    setTtsAudio(null);
    setCurrentAiResponse(null);
    setIsAiResponseLoading(false);
  };

  return (
    <section className="rounded-xl p-1 pt-0 space-y-2">
      <div className="flex flex-col gap-1.5 px-2">
        {/* First row: Title, Live/Updated badges (desktop), and Mic button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
            {isLiveView &&
            (currentTip?.is_live || currentTip?.original_bet_type_live) ? (
              <Zap className="w-4 h-4 text-green-500 fill-green-500 animate-pulse shrink-0" />
            ) : (
              <span className="text-lg shrink-0">🏏</span>
            )}
            <h2 className={`${headingClass} font-semibold text-foreground wrap-break-word md:whitespace-nowrap min-w-0 flex-1`}>
              {getCategoryDisplayName(
                ENABLE_TENANT
                  ? (currentTip?.tenant_bet_type || betType)
                  : (currentTip?.bet_type || betType)
              )}
            </h2>
            {/* Updated badge - inline with title */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Temporarily commented out live animation
              {isLiveView && highlightedTipId &&
                tips[currentTipIndex]?.tip_id === highlightedTipId && (
                  <Badge
                    className="relative bg-green-500/10 text-green-500 text-xs shrink-0 flex items-center gap-1.5 px-2.5 py-1 overflow-hidden border-0"
                    variant="secondary"
                  >
                    <div className="absolute inset-0 bg-green-500/5 animate-ping rounded-full"></div>

                    <div className="relative">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-2 h-2 bg-green-500/30 rounded-full animate-ping"></div>
                    </div>

                    <span className="relative font-medium">Live</span>
                  </Badge>
                )}
              */}
              {isLiveView &&
                (currentTip?.is_live || currentTip?.original_bet_type_live) &&
                formattedUpdatedAt && (
                  <Badge
                    variant="outline"
                    className="h-5 px-2 py-0 text-[10px] tracking-wide flex gap-1 items-center"
                  >
                    <span>Updated: {formattedUpdatedAt}</span>
                    {!currentTip?.updated_at_score && (
                      <span className="text-[7px] text-foreground/60">
                        ({gmtLabel})
                      </span>
                    )}
                  </Badge>
                )}
            </div>
          </div>

          {!isQnaUnavailable && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {isLoading ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="h-6 px-2 flex items-center gap-0.5 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 border border-primary/20 rounded-full transition-all duration-200 shrink-0"
                    >
                      <Loader2 className="w-3 h-3 animate-spin" />
                    </Button>
                  ) : isListening && isMicActive ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="h-6 px-2 flex items-center gap-0.5 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 border border-primary/20 rounded-full transition-all duration-200 shrink-0"
                    >
                      <MicOff className="w-3 h-3" />
                      <span className="hidden sm:inline">Listening...</span>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => sttl_no_translation(handleMicClick)}
                      disabled={isAnotherTipActive}
                      className="h-6 px-2 flex items-center gap-0.5 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 border border-primary/20 rounded-full transition-all duration-200 shrink-0"
                    >
                      <Mic className="w-3 h-3" />
                      <span className="hidden sm:inline">Ask</span>
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ask Aiko</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Second row: Badges - shown only on mobile */}
      </div>

      <div className="relative group">
        <div
          className="overflow-hidden outline-none"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className={cn(
              "bg-muted/30 backdrop-blur-sm rounded-xl px-4 py-3 border transition-all duration-300 relative overflow-hidden hover:shadow-md",
              "border-border",
              ""
            )}
          >
            <div className="relative z-10">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    {totalTips > 1 && currentTipIndex > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleNavigateToTip(currentTipIndex - 1)}
                        className="h-6 w-6 p-0 text-primary hover:text-foreground shrink-0"
                        aria-label="Previous tip"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    )}

                    <div className={`font-semibold ${headingClass} leading-tight text-foreground/70 flex-1`}>
                      {replaceTeamNames(
                        prettifyCategoryName(currentTip.scenario)
                      )}
                    </div>
                    {!disableAudio && (!ttsAudio ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                posthog.capture("tip_audio_played", TipEventPayload);
                                log({
                                  event_name: "tip_audio_played",
                                  payload: TipEventPayload,
                                });
                                fetchTTS(currentTip.summary, currentTip.tip_id);
                              }}
                              disabled={loadingTTS}
                              className="h-6 w-6 p-0 text-primary hover:text-foreground shrink-0"
                              aria-label="Play audio for this tip"
                            >
                              {loadingTTS ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Volume2 className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Audio for this tip</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <AudioPlayer
                        audioBase64={ttsAudio}
                        autoPlay
                        key={`tip-audio-${ttsAudio ? "loaded" : "empty"}`}
                      />
                    ))}

                    {totalTips > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          currentTipIndex < totalTips - 1
                            ? handleNavigateToTip(currentTipIndex + 1)
                            : handleNavigateToTip(0)
                        }
                        className="h-6 w-6 p-0 text-primary hover:text-foreground shrink-0"
                        aria-label="Next tip"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className={`${bodyClass} leading-relaxed text-muted-foreground`} ref={contentRef}>
                    <p className="relative">
                      {isExpanded
                        ? replaceTeamNames(currentTip.summary)
                        : truncatedSummary}
                      {isTruncated && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setIsExpanded((prev) => !prev)}
                          className="p-0 h-auto text-xs text-foreground hover:text-primary/80 ml-1 font-medium underline-offset-4 hover:underline"
                        >
                          {isExpanded ? "Read Less" : "Read More"}
                        </Button>
                      )}
                    </p>
                  </div>

                  {isAiResponseLoading && (
                    <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-primary font-medium">
                          Aiko is thinking...
                        </span>
                      </div>
                    </div>
                  )}

                  {currentAiResponse && (
                    <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <MemoizedReactMarkdown
                        className="text-sm text-foreground leading-relaxed wrap-break-word prose prose-sm max-w-none"
                        remarkPlugins={[remarkGfm, remarkMath]}
                        components={{
                          th: ({ children }) => (
                            <th className="px-2 py-1 text-left text-xs font-semibold sm:px-3 sm:py-2 sm:text-sm">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {currentAiResponse}
                      </MemoizedReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(
  BetTypeCarouselComponent,
  (prevProps, nextProps) => {
    // Return true if props are equal (don't re-render)
    // Return false if props are different (do re-render)
    return (
      prevProps.betType === nextProps.betType &&
      prevProps.tips === nextProps.tips &&
      prevProps.recentTipIds === nextProps.recentTipIds &&
      prevProps.matchId === nextProps.matchId &&
      prevProps.isLiveView === nextProps.isLiveView &&
      prevProps.liveScoreDisplay === nextProps.liveScoreDisplay &&
      prevProps.user_id === nextProps.user_id &&
      prevProps.isQnaUnavailable === nextProps.isQnaUnavailable &&
      prevProps.qnaConfig === nextProps.qnaConfig
      // Note: We intentionally exclude function props (getCategoryDisplayName, etc.)
      // because they're stable per render and shouldn't trigger re-renders
    );
  }
);
