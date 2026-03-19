"use client";

import type React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlayerInsights from "@/components/player-insights/player-insights";
import { SingleMatchResponse } from "@/lib/types";
import { usePlayersData } from "@/hooks/use-players-data";
import { useMemo, useRef, useState, useEffect } from "react";
import useGlobalTips from "@/hooks/use-global-tips";
import { useFavouriteTips } from "@/hooks/use-favourite-tips";
import type { MatchSummaryData } from "@/lib/types";
import {
  extractFilterCategories,
  filterTipsByCategory,
  groupTips,
  hasLiveTips,
} from "@/components/tips-section/tips-category-logic";
import {
  getCategoryDisplayName,
  prettifyCategoryName,
  replaceTeamPlaceholders,
} from "@/components/tips-section/tips-string-utils";
import AskQuestion from "@/components/QnA/ask-question";
import { useMultiQuestionChat } from "@/hooks/use-multi-question-chat";
import { MyTipsSection } from "@/components/tips-section/my-tips-section";
import { MatchTipsCard } from "@/components/tips-section/match-insights-card";
import BetTypeCarousel from "@/components/tips-section/bet-type-carousel";
import TipsLoadingSkeleton, {
  MatchTipsCardSkeleton,
} from "@/components/tips-section/tips-loading-skeleton";
import TipsErrorCard from "@/components/tips-section/tips-error-card";
import TipsGeneratingState from "@/components/tips-section/tips-generating-state";
import { SSEStatusIndicator } from "@/components/sse-status-indicator";
import BottomNavBar from "@/components/match-details/bottom-nav-bar";
import { useSSEStatus } from "@/contexts/sse-status-context";

interface MatchDetailsTabsProps {
  matchId: string;
  matchData: SingleMatchResponse;
  matchSummary?: MatchSummaryData | null;
  isMatchSummaryLoading?: boolean;
  user_id?: string | null;
  SHOW_FAVOURITE_TIPS?: boolean;
  SHOW_FEEDBACK?: boolean;
  SHOW_PLAYER_INSIGHTS?: boolean;
  SHOW_FRIENDLY_BET_MAPPING?: boolean;
  ENABLE_TENANT?: boolean;
  conversation_id?: string;
  apim_key?: string;
  apim_url?: string;
  base_conversation_url?: string;
  api_url_qna?: string;
  tips_broadcast?: string;
  /** Override bottom padding on scrollable content (default: "pb-16") */
  contentPaddingBottom?: string;
  /** Disable internal scroll — parent manages scrolling (used in match-center) */
  disableInternalScroll?: boolean;
  /** Embed mode: hides bottom nav bar and shows only tips (live when match is live, pre-game otherwise) */
  embedMode?: boolean;
}

const MatchDetailsTabs: React.FC<MatchDetailsTabsProps> = ({
  matchId,
  matchData,
  matchSummary,
  isMatchSummaryLoading,
  user_id,
  SHOW_FAVOURITE_TIPS,
  SHOW_FEEDBACK,
  SHOW_PLAYER_INSIGHTS,
  SHOW_FRIENDLY_BET_MAPPING,
  ENABLE_TENANT,
  conversation_id,
  apim_key,
  apim_url,
  base_conversation_url,
  api_url_qna,
  tips_broadcast,
  contentPaddingBottom,
  disableInternalScroll,
  embedMode,
}) => {
  const isUnavailable = Boolean(
    matchData &&
      matchData.match?.competitions?.category !== "international" &&
      matchData.match?.competitions?.title.toLowerCase() !==
        "indian premier league"
  );

  const { players } = usePlayersData({
    matchId: matchId,
    subscriptionKey: apim_key,
  });

  const oddsData = useMemo(
    () => ({
      sports: matchData.sports,
      matches: [matchData.match],
    }),
    [matchData]
  );

  const squads = useMemo(
    () =>
      players?.teams?.flatMap((team) =>
        team.squads?.map((player) => ({
          player_id: player.player_id,
          full_name: player.full_name,
          playing_role: player.playing_role,
          team_name: team.name,
        })) || []
      ) || [],
    [players?.teams]
  );

  // New hooks for tips
  const {
    tips,
    tipsGenerating,
    isLoading: tipsLoading,
    error: tipsError,
    refetch: refetchTips,
    teamNames,
    recentTipIds,
    sseStatus,
    manualRetry,
    maxRetriesReached,
  } = useGlobalTips({
    matchData: oddsData,
    user_id: user_id ?? undefined,
    apim_url,
    tips_broadcast,
    enableSSE: true,
    enableTenant: ENABLE_TENANT,
    subscriptionKey: apim_key,
  });

  // Sync SSE status to context so navbar can read it
  const { setSseStatus } = useSSEStatus();
  useEffect(() => {
    setSseStatus(sseStatus);
  }, [sseStatus, setSseStatus]);

  const { favouriteTips, isLoading: isFavouriteTipsLoading } = useFavouriteTips(
    SHOW_FAVOURITE_TIPS ? user_id ?? undefined : undefined
  );

  const parsedMatchId = Number(matchId);

  // QnA state
  const qnaState = useMultiQuestionChat({
    api_url: api_url_qna ?? "",
    apim_key: apim_key ?? "",
    user_id: user_id ?? "",
    stats: oddsData,
    squads,
    caching_enabled: true,
    conversation_id: conversation_id ?? "",
  });

  const teamA =
    teamNames?.team1 || matchData?.match?.teams?.[0]?.name || "Team A";
  const teamB =
    teamNames?.team2 || matchData?.match?.teams?.[1]?.name || "Team B";

  const liveScoreDisplay = useMemo(() => {
    const match = oddsData?.matches?.[0];
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
  }, [oddsData]);

  const filterCategories = useMemo(
    () => extractFilterCategories(tips.filter((tip) => !tip.is_match_pulse)),
    [tips]
  );

  const isMatchLive = useMemo(() => {
    const match = oddsData?.matches?.[0];
    if (!match) return false;
    return (
      (match.status_str || "").toLowerCase().includes("live") ||
      (match.status_note || "").toLowerCase().includes("live")
    );
  }, [oddsData]);

  const liveTipsAvailable = useMemo(
    () => isMatchLive && hasLiveTips(tips),
    [isMatchLive, tips]
  );

  const hasPreGameTips = useMemo(
    () => tips.some((tip) => !(tip.is_live && tip.original_bet_type_live)),
    [tips]
  );

  // All possible tab categories
  const allTabCategories = useMemo(() => {
    // Embed mode: only show tips — live when match is live, pre-game otherwise
    if (embedMode) {
      const categories = [];
      if (liveTipsAvailable) categories.push("live");
      if (tipsLoading || hasPreGameTips) categories.push("all");
      return categories.length > 0 ? categories : ["all"];
    }

    const categories = [];

    // Add Live Tips first if match is live and has at least 1 live tip
    if (liveTipsAvailable) {
      categories.push("live");
    }

    // Add Pre Game if tips are loading or there are pre-game tips
    if (tipsLoading || hasPreGameTips) {
      categories.push("all");
    }

    // Add Ask Aiko third
    if (!isUnavailable) {
      categories.push("ask-aiko");
    }

    // Add My Tips if available
    if (!isUnavailable && (favouriteTips?.count ?? 0) > 0) {
      categories.push("my-tips");
    }

    // Add Match Tips and remaining categories
    categories.push("match-tips");
    categories.push(...filterCategories);
    return categories;
  }, [
    embedMode,
    isUnavailable,
    favouriteTips?.count,
    liveTipsAvailable,
    hasPreGameTips,
    tipsLoading,
    filterCategories,
  ]);

  const getDisplayName = (categoryName: string) =>
    getCategoryDisplayName(categoryName, teamA, teamB);
  const replaceTeamNames = (text: string) =>
    replaceTeamPlaceholders(text, teamA, teamB);

  // State for controlled tabs
  // Embed mode: only "live" or "all" — never "match-tips"
  // Live match: In-Game > Insights > Pre-Game
  // Not live: Pre-Game > Insights (show insights while pre-game loads, switch to pre-game when available)
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (embedMode) {
      return liveTipsAvailable ? "live" : "all";
    }
    return liveTipsAvailable
      ? "live"
      : isMatchLive
      ? hasPreGameTips ? "all" : "match-tips"
      : hasPreGameTips
      ? "all"
      : "match-tips";
  });

  // Track if user has manually switched tabs
  const [hasManuallySelectedTab, setHasManuallySelectedTab] = useState(false);

  // If the active tab is no longer in the list, fall back to the first available tab
  useEffect(() => {
    if (
      !allTabCategories.includes(activeTab) &&
      activeTab !== "player-insights"
    ) {
      setActiveTab(allTabCategories[0] ?? "match-tips");
    }
  }, [allTabCategories, activeTab]);

  // Live match: auto-switch to In-Game when live tips become available
  useEffect(() => {
    if (liveTipsAvailable && !hasManuallySelectedTab) {
      setActiveTab("live");
    }
  }, [liveTipsAvailable, hasManuallySelectedTab]);

  // Not live: show Insights as placeholder, then switch to Pre-Game when tips load
  useEffect(() => {
    if (!isMatchLive && hasPreGameTips && !hasManuallySelectedTab) {
      setActiveTab("all");
    }
  }, [isMatchLive, hasPreGameTips, hasManuallySelectedTab]);

  // Live match without In-Game tips: show Insights when they load (skip in embed mode)
  useEffect(() => {
    if (
      !embedMode &&
      isMatchLive &&
      !liveTipsAvailable &&
      !isMatchSummaryLoading &&
      matchSummary &&
      !hasManuallySelectedTab
    ) {
      setActiveTab("match-tips");
    }
  }, [embedMode, isMatchLive, liveTipsAvailable, isMatchSummaryLoading, matchSummary, hasManuallySelectedTab]);

  // Ref for scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Function to scroll tab into center view (debounced for performance)
  const scrollTabToCenter = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Clear existing timeout to debounce rapid tab changes
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    // Debounce the scroll operation
    scrollTimeoutRef.current = window.setTimeout(() => {
      // Find the clicked tab element
      const tabElement = container.querySelector(
        `[data-state="active"]`
      ) as HTMLElement;
      if (!tabElement) return;

      // Calculate scroll position to center the tab
      const containerWidth = container.clientWidth;
      const tabLeft = tabElement.offsetLeft;
      const tabWidth = tabElement.offsetWidth;

      // Calculate the position to center the tab
      const targetScrollLeft = tabLeft - containerWidth / 2 + tabWidth / 2;

      // Smooth scroll to the calculated position
      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: "smooth",
      });
    }, 50);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        setActiveTab(value);
        setHasManuallySelectedTab(true);
        scrollTabToCenter();
      }}
      className="flex flex-col flex-1 min-h-0"
    >
      {/* Tab Content Area: scrollable by default; when disableInternalScroll is true, parent manages scrolling */}
      <div className={`${disableInternalScroll ? "" : "flex-1 overflow-y-auto"} ${contentPaddingBottom || "pb-16"} bg-background rounded-xl border border-border/50`}>
        <div className="px-1 sm:px-2 py-2 sm:py-3">
          {allTabCategories.map((category) => {
            const filteredTips = filterTipsByCategory(tips, category);
            const grouped = groupTips(filteredTips, SHOW_FRIENDLY_BET_MAPPING);
            return (
              <TabsContent
                key={category}
                value={category}
                className="px-2 sm:px-4 md:px-4 py-4 sm:py-2 m-0"
              >
                {category === "ask-aiko" ? (
                  (!isUnavailable && (
                    <AskQuestion
                      user_id={user_id ?? ""}
                      oddsData={oddsData}
                      players={players}
                      playersLoading={false}
                      playersError={null}
                      qnaState={qnaState}
                      apim_key={apim_key ?? ""}
                      apim_url={apim_url ?? ""}
                      base_conversation_url={base_conversation_url ?? ""}
                      conversation_id={conversation_id ?? ""}
                      SHOW_FEEDBACK={SHOW_FEEDBACK}
                      SHOW_FAVOURITE_TIPS={SHOW_FAVOURITE_TIPS}
                    />
                  )) || (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">
                        Ask Aiko feature is currently unavailable
                      </p>
                    </div>
                  )
                ) : category === "match-tips" ? (
                  isMatchSummaryLoading ? (
                    <MatchTipsCardSkeleton />
                  ) : matchSummary ? (
                    <MatchTipsCard
                      matchId={parsedMatchId}
                      summary={matchSummary}
                    />
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">
                        No match insights available
                      </p>
                    </div>
                  )
                ) : category === "my-tips" ? (
                  <MyTipsSection
                    myTips={favouriteTips?.data ?? []}
                    isLoading={isFavouriteTipsLoading}
                    user_id={user_id ?? ""}
                    oddsData={oddsData}
                    players={squads}
                    apim_key={apim_key ?? ""}
                    apim_url={api_url_qna ?? ""}
                    conversation_id={conversation_id ?? ""}
                  />
                ) : category === "all" ? (
                  tipsLoading ? (
                    <TipsLoadingSkeleton />
                  ) : tipsError ? (
                    <TipsErrorCard isFetching={false} onRetry={refetchTips} />
                  ) : tipsGenerating ? (
                    <TipsGeneratingState />
                  ) : !tips || tips.length === 0 ? (
                    <div className="text-center">
                      <p className="text-base font-medium">
                        Tips will be available soon
                      </p>
                      <p className="text-sm mt-2">
                        Check back later for Cricket insights
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.keys(grouped).length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          <p className="text-sm">No tips available</p>
                        </div>
                      ) : (
                        Object.keys(grouped).map((betType) => {
                          const tipsForBet = grouped[betType];
                          return (
                            <BetTypeCarousel
                              key={betType}
                              betType={betType}
                              tips={tipsForBet}
                              recentTipIds={recentTipIds}
                              isLiveView={false}
                              liveScoreDisplay={liveScoreDisplay}
                              matchId={parsedMatchId}
                              getCategoryDisplayName={getDisplayName}
                              prettifyCategoryName={prettifyCategoryName}
                              replaceTeamNames={replaceTeamNames}
                              ENABLE_TENANT={ENABLE_TENANT}
                              qnaConfig={{
                                api_url: api_url_qna ?? "",
                                apim_key: apim_key ?? "",
                                user_id: user_id ?? "",
                                match_stats: oddsData,
                                squads,
                                conversation_id: conversation_id ?? "",
                              }}
                              user_id={user_id ?? undefined}
                              isQnaUnavailable={isUnavailable}
                            />
                          );
                        })
                      )}
                    </div>
                  )
                ) : tipsLoading ? (
                  <TipsLoadingSkeleton />
                ) : tipsError ? (
                  <TipsErrorCard isFetching={false} onRetry={refetchTips} />
                ) : tipsGenerating ? (
                  <TipsGeneratingState />
                ) : Object.keys(grouped).length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">
                      No tips available for this category
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.keys(grouped).map((betType) => {
                      const tipsForBet = grouped[betType];
                      return (
                        <BetTypeCarousel
                          key={betType}
                          betType={betType}
                          tips={tipsForBet}
                          recentTipIds={recentTipIds}
                          isLiveView={category === "live"}
                          liveScoreDisplay={liveScoreDisplay}
                          matchId={parsedMatchId}
                          getCategoryDisplayName={getDisplayName}
                          prettifyCategoryName={prettifyCategoryName}
                          replaceTeamNames={replaceTeamNames}
                          ENABLE_TENANT={ENABLE_TENANT}
                          qnaConfig={{
                            api_url: api_url_qna ?? "",
                            apim_key: apim_key ?? "",
                            user_id: user_id ?? "",
                            match_stats: oddsData,
                            squads,
                            conversation_id: conversation_id ?? "",
                          }}
                          user_id={user_id ?? undefined}
                          isQnaUnavailable={isUnavailable}
                        />
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            );
          })}

          {SHOW_PLAYER_INSIGHTS && (
            <TabsContent
              value="player-insights"
              className="px-2 sm:px-4 md:px-4 py-4 sm:py-2 m-0"
            >
              <PlayerInsights
                matchId={matchId}
                userId={user_id ?? "user_123"}
                subscriptionKey={apim_key}
              />
            </TabsContent>
          )}
        </div>
        </div>

      {/* Bottom Navigation Bar - hidden in embed mode */}
      {!embedMode && (
        <BottomNavBar
          allTabCategories={allTabCategories}
          activeTab={activeTab}
          onTabChange={(value) => {
            setActiveTab(value);
            setHasManuallySelectedTab(true);
          }}
          showPlayerInsights={SHOW_PLAYER_INSIGHTS}
          getDisplayName={getDisplayName}
        />
      )}
      </Tabs>
  );
};

export default MatchDetailsTabs;
