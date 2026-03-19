"use client";

import React, { useMemo, useState } from "react";
import useGlobalTips from "@/hooks/use-global-tips";
import BetTypeCarousel from "./bet-type-carousel";
import { MyTipsSection } from "./my-tips-section";
import {
  filterTipsByCategory,
  groupTips,
  hasLiveTips,
} from "./tips-category-logic";
import {
  getCategoryDisplayName,
  prettifyCategoryName,
  replaceTeamPlaceholders,
} from "./tips-string-utils";
import { SportsMatches } from "@/lib/types";
import { DataPlayer } from "@/lib/schemas/qna";
import TipsLoadingSkeleton, { MatchTipsCardSkeleton } from "./tips-loading-skeleton";
import TipsErrorCard from "./tips-error-card";
import TipsGeneratingState from "./tips-generating-state";
import { useEmbedContext, HEADING_SIZE_MAP, BODY_SIZE_MAP } from "@/contexts/embed-context";
import { useFavouriteTips } from "@/hooks/use-favourite-tips";
import { useMatchSummary } from "@/hooks/use-match-summary";
import { MatchTipsCard } from "@/components/tips-section/match-insights-card";
import AskQuestion from "@/components/QnA/ask-question";
import { useMultiQuestionChat } from "@/hooks/use-multi-question-chat";

type TipsListProps = {
  matchId: number | string;
  matchStats: SportsMatches;
  team1?: string;
  team2?: string;
  SHOW_FAVOURITE_TIPS?: boolean;
  SHOW_FRIENDLY_BET_MAPPING?: boolean;
  ENABLE_TENANT?: boolean;
  user_id?: string;
  isQnaUnavailable?: boolean;
  apim_url?: string;
  tips_broadcast?: string;
  enableSSE?: boolean;
  qnaConfig?: {
    api_url: string;
    apim_key: string;
    user_id: string;
    match_stats: SportsMatches;
    squads: {
      player_id: string;
      full_name: string;
      playing_role: string;
      team_name: string;
    }[];
    conversation_id: string;
    players?: DataPlayer | null;
    playersLoading?: boolean;
    playersError?: string | null;
    base_conversation_url?: string;
    SHOW_FEEDBACK?: boolean;
    SHOW_FAVOURITE_TIPS?: boolean;
  };
};

const TipsList: React.FC<TipsListProps> = ({
  matchId,
  matchStats,
  team1,
  team2,
  SHOW_FAVOURITE_TIPS,
  SHOW_FRIENDLY_BET_MAPPING,
  ENABLE_TENANT,
  user_id,
  isQnaUnavailable,
  apim_url,
  tips_broadcast,
  enableSSE = true,
  qnaConfig,
}) => {
  const { headingSize, bodySize } = useEmbedContext();
  const headingClass = HEADING_SIZE_MAP[headingSize ?? "md"];
  const bodyClass = BODY_SIZE_MAP[bodySize ?? "md"];
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Initialize QnA state at top level (must be unconditional)
  const qnaState = useMultiQuestionChat({
    api_url: qnaConfig?.api_url || "",
    apim_key: qnaConfig?.apim_key || "",
    user_id: qnaConfig?.user_id || user_id || "",
    stats: matchStats,
    squads: qnaConfig?.squads || [],
    caching_enabled: true,
    conversation_id: qnaConfig?.conversation_id || "",
  });

  const { favouriteTips, isLoading: isFavouriteTipsLoading } = useFavouriteTips(
    SHOW_FAVOURITE_TIPS ? user_id ?? undefined : undefined
  );

  const parsedMatchId = Number(matchId);

  const { summary: matchSummary, isLoading: isMatchSummaryLoading } = useMatchSummary({
    match_id: parsedMatchId,
    user_id: user_id ?? "user_123",
  });

  const { tips, isLoading, error, refetch, teamNames, recentTipIds, tipsGenerating } =
    useGlobalTips({
      matchData: matchStats,
      user_id,
      apim_url,
      tips_broadcast,
      enableSSE,
      enableTenant: ENABLE_TENANT,
    });
  const teamA = teamNames?.team1 || team1 || "Team A";
  const teamB = teamNames?.team2 || team2 || "Team B";

  const liveScoreDisplay = useMemo(() => {
    const match = matchStats?.matches?.[0];
    const teams = match?.teams || [];
    const formatScore = (team?: {
      short_name?: string;
      name?: string;
      scores_full?: string;
    }) => {
      if (!team?.scores_full) return null;
      const teamLabel = team.short_name || team.name || "";
      return `${teamLabel} ${team.scores_full}`.trim();
    };
    const parts = [formatScore(teams[0]), formatScore(teams[1])].filter(
      Boolean
    );
    return parts.join(" | ");
  }, [matchStats]);

  const summary = tips;
  const isMatchLive = useMemo(() => {
    const match = matchStats?.matches?.[0];
    if (!match) return false;
    return (
      (match.status_str || "").toLowerCase().includes("live") ||
      (match.status_note || "").toLowerCase().includes("live")
    );
  }, [matchStats]);

  const liveTipsAvailable = useMemo(
    () => isMatchLive && hasLiveTips(summary),
    [isMatchLive, summary]
  );

  const effectiveCategory = useMemo(
    () => (!liveTipsAvailable && selectedCategory === "live" ? "all" : selectedCategory),
    [liveTipsAvailable, selectedCategory]
  );
  const filteredTips = useMemo(
    () => filterTipsByCategory(summary, effectiveCategory),
    [summary, effectiveCategory]
  );
  const grouped = useMemo(
    () => groupTips(filteredTips, SHOW_FRIENDLY_BET_MAPPING),
    [filteredTips, SHOW_FRIENDLY_BET_MAPPING]
  );

  const getDisplayName = (categoryName: string) =>
    getCategoryDisplayName(categoryName, teamA, teamB);
  const replaceTeamNames = (text: string) =>
    replaceTeamPlaceholders(text, teamA, teamB);

  if (isLoading) {
    return <TipsLoadingSkeleton />;
  }

  if (error) {
    return <TipsErrorCard isFetching={false} onRetry={refetch} />;
  }

  if (tipsGenerating) {
    return <TipsGeneratingState />;
  }

  if (!summary || summary.length === 0) {
    return (
      <div className="text-center">
        <p className={`${headingClass} font-medium`}>Insights will be available soon</p>
        <p className={`${bodyClass} mt-2`}>Check back later for Cricket insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 mt-2">
        {effectiveCategory === "ask-aiko" ? (
          !isQnaUnavailable && qnaConfig ? (
            <AskQuestion
              user_id={qnaConfig.user_id}
              oddsData={matchStats}
              players={qnaConfig.players}
              playersLoading={!!qnaConfig.playersLoading}
              playersError={qnaConfig.playersError}
              qnaState={qnaState}
              apim_key={qnaConfig.apim_key}
              apim_url={qnaConfig.api_url}
              base_conversation_url={qnaConfig.base_conversation_url ?? ""}
              conversation_id={qnaConfig.conversation_id}
              SHOW_FEEDBACK={qnaConfig.SHOW_FEEDBACK}
              SHOW_FAVOURITE_TIPS={qnaConfig.SHOW_FAVOURITE_TIPS}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">Ask Aiko feature is currently unavailable</p>
            </div>
          )
        ) : effectiveCategory === "match-tips" ? (
          isMatchSummaryLoading ? (
            <MatchTipsCardSkeleton />
          ) : matchSummary ? (
            <MatchTipsCard
              matchId={matchId}
              summary={matchSummary}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">No match insights available</p>
            </div>
          )
        ) : effectiveCategory === "my-tips" ? (
          <MyTipsSection
            myTips={favouriteTips?.data ?? []}
            isLoading={isFavouriteTipsLoading}
            user_id={user_id ?? ""}
            oddsData={matchStats}
            players={qnaConfig?.squads ?? []}
            apim_key={qnaConfig?.apim_key ?? ""}
            apim_url={qnaConfig?.api_url ?? ""}
            conversation_id={qnaConfig?.conversation_id ?? ""}
          />
        ) : effectiveCategory === "all" ? (
          /* Regular Tips Categories Only */
          Object.keys(grouped).length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No insights available</p>
            </div>
          ) : (
            Object.keys(grouped).map((betType) => {
              const tips = grouped[betType];
              return (
                <BetTypeCarousel
                  key={betType}
                  betType={betType}
                  tips={tips}
                  recentTipIds={recentTipIds}
                  isLiveView={false}
                  liveScoreDisplay={liveScoreDisplay}
                  matchId={parsedMatchId}
                  getCategoryDisplayName={getDisplayName}
                  prettifyCategoryName={prettifyCategoryName}
                  replaceTeamNames={replaceTeamNames}
                  qnaConfig={qnaConfig}
                  user_id={user_id}
                  isQnaUnavailable={isQnaUnavailable}
                  ENABLE_TENANT={ENABLE_TENANT}
                />
              );
            })
          )
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No insights available for this filter</p>
          </div>
        ) : (
          Object.keys(grouped).map((betType) => {
            const tips = grouped[betType];
            return (
              <BetTypeCarousel
                key={betType}
                betType={betType}
                tips={tips}
                recentTipIds={recentTipIds}
                isLiveView={effectiveCategory === "live"}
                liveScoreDisplay={liveScoreDisplay}
                matchId={parsedMatchId}
                getCategoryDisplayName={getDisplayName}
                prettifyCategoryName={prettifyCategoryName}
                replaceTeamNames={replaceTeamNames}
                qnaConfig={qnaConfig}
                user_id={user_id}
                isQnaUnavailable={isQnaUnavailable}
                ENABLE_TENANT={ENABLE_TENANT}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default TipsList;
