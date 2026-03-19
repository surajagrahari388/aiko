"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback, useContext } from "react";
import posthog from "posthog-js";
import { TipSummary } from "@/components/tips-section/tips-category-logic";
import { useLanguage } from "@/contexts/language-context";
import { useEmbedContext, HEADING_SIZE_MAP, BODY_SIZE_MAP } from "@/contexts/embed-context";
import { TenantContext } from "@/contexts/analytics-context";
import { useVisibilityImpression } from "@/hooks/use-visibility-impression";
import { log } from "@/lib/debug-logger";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2, Plus, Minus, ChevronRight } from "lucide-react";
import AudioPlayer from "@/components/audio-player";
import { HotInsightsSkeleton } from "@/components/match-details/hot-insights-skeleton";

interface MatchSummaryData {
  tip_id: string;
  total_summary: string;
  analysis: Array<{
    tip_id?: string;
    type: string;
    details: string;
  }>;
}

interface HotInsightsSectionProps {
  tips: TipSummary[];
  matchId: number;
  matchSummary?: MatchSummaryData | null;
  isMatchSummaryLoading?: boolean;
  replaceTeamNames: (text: string) => string;
  getCategoryDisplayName: (name: string) => string;
  ENABLE_TENANT?: boolean;
}

type CardItem = {
  id: string;
  text: string;
  scenario: string;
};

function PulseCardContent({ card, expanded, onToggle, bodyClass }: { card: CardItem; expanded: boolean; onToggle: () => void; bodyClass: string }) {
  const words = card.text.split(" ");
  const needsTruncation = words.length > 15;
  const truncatedText = needsTruncation
    ? words.slice(0, 15).join(" ") + "..."
    : card.text;

  return (
    <p className={`${bodyClass} leading-relaxed text-muted-foreground`}>
      {expanded ? card.text : truncatedText}
      {needsTruncation && (
        <button
          onClick={onToggle}
          className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors align-middle"
        >
          {expanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </button>
      )}
    </p>
  );
}

export default function HotInsightsSection({
  tips,
  matchId,
  matchSummary,
  isMatchSummaryLoading,
  replaceTeamNames,
  getCategoryDisplayName,
  ENABLE_TENANT,
}: HotInsightsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [ttsAudio, setTtsAudio] = useState<string | null>(null);
  const [loadingTTS, setLoadingTTS] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const { language } = useLanguage();
  const { subscriptionKey, disableAudio, headingSize, bodySize } = useEmbedContext();
  const headingClass = HEADING_SIZE_MAP[headingSize ?? "md"];
  const bodyClass = BODY_SIZE_MAP[bodySize ?? "md"];
  const tenantContext = useContext(TenantContext);
  const containerRef = useRef<HTMLDivElement>(null);

  // Match Pulse list — SSE match_pulse tips replace match insights when available
  const cards: CardItem[] = useMemo(() => {
    // When SSE match_pulse tips arrive, they replace match insights entirely
    if (tips.length > 0) {
      return tips.map((tip) => ({
        id: tip.tip_id,
        text: replaceTeamNames(tip.summary),
        scenario: tip.scenario,
      }));
    }

    // Default: show match insights from the summary API
    if (matchSummary?.analysis?.length) {
      return matchSummary.analysis.map((item, i) => ({
        id: item.tip_id || `ms-${i}`,
        text: replaceTeamNames(item.details),
        scenario: item.type,
      }));
    }

    return [];
  }, [tips, matchSummary, replaceTeamNames]);

  // Flash green border for 5s when SSE match_pulse tips arrive
  const prevTipsCountRef = useRef<number>(0);
  useEffect(() => {
    if (tips.length > 0 && tips.length !== prevTipsCountRef.current) {
      // SSE match_pulse tips arrived or updated — flash green for 5s
      prevTipsCountRef.current = tips.length;
      setPulseActive(true);
      const timer = setTimeout(() => setPulseActive(false), 5000);
      return () => clearTimeout(timer);
    }
    prevTipsCountRef.current = tips.length;
  }, [tips.length]);

  const totalItems = cards.length;
  const currentCard = cards[currentIndex];

  // PostHog impression tracking
  const eventPayload = useMemo(() => {
    const baseData = {
      tip_id: currentCard?.id,
      match_id: String(matchId),
      language,
      market_category: "Match_Pulse",
      scenario: currentCard?.scenario,
    };

    if (ENABLE_TENANT) {
      return {
        ...baseData,
        tenant_id: tenantContext?.tenantIdMapping || tenantContext?.tenantId || "Unknown",
      };
    }

    return baseData;
  }, [
    currentCard?.id,
    matchId,
    language,
    currentCard?.scenario,
    ...(ENABLE_TENANT ? [tenantContext?.tenantIdMapping, tenantContext?.tenantId] : []),
  ]);

  const handleImpression = useCallback(() => {
    posthog.capture("tip_impression", eventPayload);
    log({ event_name: "tip_impression", payload: eventPayload });
  }, [eventPayload]);

  const visibilityOptions = useMemo(
    () => ({ threshold: 0.7, duration: 3000 }),
    []
  );

  useVisibilityImpression(
    containerRef as React.RefObject<HTMLElement>,
    handleImpression,
    visibilityOptions,
  );

  const navigateToItem = (index: number) => {
    setCurrentIndex(index);
    setTtsAudio(null);
  };

  // Touch swipe support
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && currentIndex < totalItems - 1) {
      navigateToItem(currentIndex + 1);
    }
    if (distance < -minSwipeDistance && currentIndex > 0) {
      navigateToItem(currentIndex - 1);
    }
  };

  // Reset TTS when active card changes
  useEffect(() => {
    setTtsAudio(null);
  }, [currentIndex]);

  const fetchTTS = async () => {
    if (!currentCard) return;
    posthog.capture("tip_audio_played", eventPayload);
    log({ event_name: "tip_audio_played", payload: eventPayload });
    setLoadingTTS(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (subscriptionKey) {
        headers["Ocp-Apim-Subscription-Key"] = subscriptionKey;
      }
      const response = await fetch("/api/tts", {
        method: "POST",
        headers,
        body: JSON.stringify({
          match_id: matchId,
          tip_id: currentCard.id,
          summary: currentCard.text,
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

  if (tips.length === 0 && !matchSummary && !isMatchSummaryLoading) return null;

  return (
    <>
      {isMatchSummaryLoading && cards.length === 0 ? (
        <HotInsightsSkeleton />
      ) : cards.length > 0 ? (
        <div
          ref={containerRef}
          className={`bg-muted/30 backdrop-blur-sm rounded-xl px-4 py-3 border border-border transition-all duration-500 hover:shadow-md ${pulseActive ? "border-l-[3px] border-l-green-500 animate-pulse-subtle" : ""}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Header row: Match Pulse title + Audio + Navigation */}
          <div className="flex items-center gap-2 mb-1">
            <span className="shrink-0 w-4 h-4 sm:w-5 sm:h-5 animate-flame">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <path d="M12 2C12 2 6 9 6 14a6 6 0 0 0 12 0c0-5-6-12-6-12Z" fill="url(#flame-outer-pulse)" />
                <path d="M12 10c0 0-3 3.5-3 6a3 3 0 0 0 6 0c0-2.5-3-6-3-6Z" fill="url(#flame-inner-pulse)" />
                <defs>
                  <linearGradient id="flame-outer-pulse" x1="12" y1="2" x2="12" y2="20" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                  <linearGradient id="flame-inner-pulse" x1="12" y1="10" x2="12" y2="16" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span className={`flex-1 font-semibold ${headingClass} leading-tight text-foreground/70`}>Match Pulse</span>

              {!disableAudio && (!ttsAudio ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchTTS}
                  disabled={loadingTTS}
                  className="h-6 w-6 p-0 text-primary hover:text-foreground shrink-0"
                  aria-label="Play audio for this insight"
                >
                  {loadingTTS ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              ) : (
                <AudioPlayer
                  audioBase64={ttsAudio}
                  autoPlay
                  key={`hot-audio-${currentCard?.id}`}
                />
              ))}

              {totalItems > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    currentIndex < totalItems - 1
                      ? navigateToItem(currentIndex + 1)
                      : navigateToItem(0)
                  }
                  className="h-6 w-6 p-0 text-primary hover:text-foreground shrink-0"
                  aria-label="Next insight"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Card content */}
            <PulseCardContent key={currentCard.id} card={currentCard} expanded={expanded} onToggle={() => setExpanded((prev) => !prev)} bodyClass={bodyClass} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-1">
            No insights available
          </p>
        )}
    </>
  );
}
