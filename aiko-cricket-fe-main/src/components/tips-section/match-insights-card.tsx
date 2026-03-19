"use client";

import React, { useState, useCallback, useMemo, useContext } from "react";
import { TenantContext } from "@/contexts/analytics-context";
import { Button } from "@/components/ui/button";
import { Loader2, Volume2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AudioPlayer from "@/components/audio-player";
import { useLanguage } from "@/contexts/language-context";
import { useEmbedContext, HEADING_SIZE_MAP, BODY_SIZE_MAP } from "@/contexts/embed-context";
import { useVisibilityImpression } from "@/hooks/use-visibility-impression";
import posthog from "posthog-js";
import { log } from "@/lib/debug-logger";

interface MatchTipsCardProps {
  matchId: string | number;
  summary: {
    tip_id: string;
    total_summary: string;
    analysis: Array<{
      tip_id?: string;
      type: string;
      details: string;
    }>;
  };
}

interface MatchInsightItem {
  tip_id?: string;
  type: string;
  details: string;
}

interface MatchInsightCardProps {
  item: MatchInsightItem;
  index: number;
  matchEventPayload: {
    tip_id: string;
    match_id: string;
    language: string;
    market_category: string;
    tenant_id: string;
  };
  disableAudio: boolean;
  ttsAudioMap: Record<number, string | null>;
  loadingTTSIndex: number | null;
  fetchTTS: (text: string, tip_id: string, index: number) => void;
  bodyClass: string;
}

const MatchInsightCard = React.memo(function MatchInsightCardComponent({
  item,
  index,
  matchEventPayload,
  disableAudio,
  ttsAudioMap,
  loadingTTSIndex,
  fetchTTS,
  bodyClass,
}: MatchInsightCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleCardVisible = useCallback(() => {
    const payload = { ...matchEventPayload, scenario: item.type };
    posthog.capture("tip_impression", payload);
    log({ event_name: "tip_impression", payload });
  }, [matchEventPayload, item.type]);

  const visibilityOptions = useMemo(() => ({ threshold: 0.7, duration: 3000 }), []);

  useVisibilityImpression(
    cardRef as React.RefObject<HTMLElement>,
    handleCardVisible,
    visibilityOptions
  );

  return (
    <div
      ref={cardRef}
      className="bg-muted/30 backdrop-blur-sm rounded-xl px-4 py-3 border border-border transition-all duration-300 hover:shadow-md"
    >
      <div className="flex items-start gap-2 mb-1">
        <div className="font-semibold text-sm leading-tight text-primary flex-1">
          {item.type}
        </div>

        {!disableAudio && (!ttsAudioMap[index] ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    posthog.capture("tip_audio_played", {
                      ...matchEventPayload,
                      scenario: item.type,
                    });
                    log({
                      event_name: "tip_audio_played",
                      payload: { ...matchEventPayload, scenario: item.type },
                    });
                    fetchTTS(item.details, item.tip_id || "", index);
                  }}
                  disabled={loadingTTSIndex === index}
                  className="h-6 w-6 p-0 text-primary hover:text-foreground shrink-0"
                  aria-label="Play audio for this tip"
                >
                  {loadingTTSIndex === index ? (
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
            audioBase64={ttsAudioMap[index]!}
            autoPlay
            key={`tip-audio-${index}`}
          />
        ))}
      </div>

      <p className={`${bodyClass} leading-relaxed text-muted-foreground`}>
        {item.details}
      </p>
    </div>
  );
});

export const MatchTipsCard = React.memo(
  function MatchTipsCardComponent({ matchId, summary }: MatchTipsCardProps) {
    const [ttsAudioMap, setTtsAudioMap] = useState<Record<number, string | null>>({});
    const [loadingTTSIndex, setLoadingTTSIndex] = useState<number | null>(null);
    const { language } = useLanguage();
    const tenantContext = useContext(TenantContext);
    const { subscriptionKey: embedSubscriptionKey, disableAudio, headingSize, bodySize } = useEmbedContext();
    const headingClass = HEADING_SIZE_MAP[headingSize ?? "md"];
    const bodyClass = BODY_SIZE_MAP[bodySize ?? "md"];
    const isAudioDisabled = Boolean(disableAudio);
    const analysisItems = summary.analysis.slice(0, 3);

    const matchEventPayload = useMemo(
      () => ({
        tip_id: summary.tip_id,
        match_id: String(matchId),
        language,
        market_category: "Match_Insights",
        tenant_id: tenantContext?.tenantId || "Unknown",
      }),
      [summary.tip_id, matchId, language, tenantContext?.tenantId]
    );

    const fetchTTS = useCallback(
      async (text: string, tip_id: string, index: number) => {
        setLoadingTTSIndex(index);
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
              tip_id,
              summary: text,
              language,
            }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch TTS");
          }
          const { audio } = await response.json();
          setTtsAudioMap((prev) => ({ ...prev, [index]: audio }));
        } catch (err) {
          console.error("Failed to fetch TTS audio:", err);
        } finally {
          setLoadingTTSIndex(null);
        }
      },
      [language, matchId, embedSubscriptionKey]
    );

    if (!summary || !analysisItems.length) return null;

    return (
      <section className="rounded-xl p-1 pt-0 space-y-2">
        <div className="flex items-center gap-2 px-2">
          <span className="text-lg">🏏</span>
          <h2 className={`${headingClass} font-semibold text-foreground`}>Match Insights</h2>
        </div>

        <div className="space-y-3">
          {analysisItems.map((item, index) => (
            <MatchInsightCard
              key={item.tip_id || `analysis-${index}`}
              item={item}
              index={index}
              matchEventPayload={matchEventPayload}
              disableAudio={isAudioDisabled}
              ttsAudioMap={ttsAudioMap}
              loadingTTSIndex={loadingTTSIndex}
              fetchTTS={fetchTTS}
              bodyClass={bodyClass}
            />
          ))}
        </div>
      </section>
    );
  }
);
