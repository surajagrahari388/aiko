"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import MatchDetailsTabs from "@/components/match-details/match-details-tabs";
import MatchDetailsSkeleton from "@/components/match-details/match-details-skeleton";
import NavbarMatchSection from "@/components/navbar/navbar-match";
import HotInsightsSection from "@/components/match-details/hot-insights-section";
import { SingleMatchResponse, DetailedMatchResponse } from "@/lib/types";
import { MicStateProvider } from "@/contexts/mic-state-context";
import { SSEStatusProvider } from "@/contexts/sse-status-context";
import useGlobalTips from "@/hooks/use-global-tips";
import { useMatchSummary } from "@/hooks/use-match-summary";
import {
  getCategoryDisplayName as getCategoryDisplayNameUtil,
  replaceTeamPlaceholders,
} from "@/components/tips-section/tips-string-utils";
import { useDesignVariant } from "@/hooks/use-design-variant";
import GoBack from "@/components/layout/go-back";

async function fetchMatch(matchId: string): Promise<{
  basicData: SingleMatchResponse;
  detailedData: DetailedMatchResponse | null;
}> {
  const res = await fetch(`/api/cricket/matches/${matchId}`);
  if (!res.ok) throw new Error("Failed to fetch match");
  const data = await res.json();
  
  // Try to determine if this is detailed match data or basic match data
  const hasDetailedData = data.match?.innings && Array.isArray(data.match.innings);
  
  return {
    basicData: data as SingleMatchResponse,
    detailedData: hasDetailedData ? (data as DetailedMatchResponse) : null,
  };
}

export default function MatchDetailsClient({
  matchId,
  initialData,
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
  AUTH_AUTH0_ID,
  AUTH0_ISSUER,
  matchData,
  detailedMatchData,
}: {
  matchId: string;
  initialData?: SingleMatchResponse;
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
  AUTH_AUTH0_ID?: string;
  AUTH0_ISSUER?: string;
  matchData?: SingleMatchResponse;
  detailedMatchData?: DetailedMatchResponse | null;
}) {
  const initialDataUpdatedAt = useRef(initialData ? Date.now() : 0);

  // Fetch match data once (live updates come via SSE match_push_obj)
  const { data, error, isLoading } = useQuery<{
    basicData: SingleMatchResponse;
    detailedData: DetailedMatchResponse | null;
  }>({
    queryKey: ["cricket", "match", matchId],
    queryFn: () => fetchMatch(matchId),
    initialData: initialData && matchData ? {
      basicData: matchData,
      detailedData: detailedMatchData ?? null
    } : undefined,
    initialDataUpdatedAt: initialDataUpdatedAt.current,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    retry: 2,
    enabled: true,
  });
  
  // Use polled data if available, otherwise fall back to passed props
  const finalMatchData = data?.basicData || matchData || initialData;
  const finalDetailedMatchData = data?.detailedData || detailedMatchData || undefined;

  // Update document title with competition abbreviation
  useEffect(() => {
    const abbr = finalMatchData?.match?.competitions?.abbr;
    if (abbr) {
      document.title = `${abbr} | Aiko`;
    }
  }, [finalMatchData?.match?.competitions?.abbr]);

  // Construct oddsData for useGlobalTips (same shape as MatchDetailsTabs)
  const oddsData = useMemo(
    () =>
      finalMatchData
        ? { sports: finalMatchData.sports, matches: [finalMatchData.match] }
        : undefined,
    [finalMatchData]
  );

  // Tips data (React Query deduplicates — same cache as MatchDetailsTabs)
  const { tips, teamNames } = useGlobalTips({
    matchData: oddsData ?? { sports: "", matches: [] },
    user_id: user_id ?? undefined,
    apim_url,
    tips_broadcast,
    enableSSE: false,
    enableTenant: ENABLE_TENANT,
    enabled: !!oddsData,
    subscriptionKey: apim_key,
  });

  // Match summary (lifted here so it's fetched once and shared)
  const parsedMatchId = Number(matchId);
  const { summary: matchSummary, isLoading: isMatchSummaryLoading } =
    useMatchSummary({
      match_id: parsedMatchId,
      user_id: user_id ?? "user_123",
      subscriptionKey: apim_key,
    });

  // Hot insights tips — only match pulse tips (is_match_pulse flag from API)
  const hotInsightsTips = useMemo(
    () => tips.filter((tip) => tip.is_match_pulse),
    [tips]
  );

  // Team name helpers for hot insights cards
  const teamA =
    teamNames?.team1 ||
    finalMatchData?.match?.teams?.[0]?.name ||
    "Team A";
  const teamB =
    teamNames?.team2 ||
    finalMatchData?.match?.teams?.[1]?.name ||
    "Team B";
  const getDisplayName = (name: string) =>
    getCategoryDisplayNameUtil(name, teamA, teamB);
  const replaceTeamNames = (text: string) =>
    replaceTeamPlaceholders(text, teamA, teamB);

  const { variant } = useDesignVariant("match-navbar");
  const isDesignC = variant === "C";

  if (isLoading && !initialData && !matchData) return <MatchDetailsSkeleton />;
  if (error && !finalMatchData) return <MatchDetailsSkeleton />;
  if (!finalMatchData) return <MatchDetailsSkeleton />;

  const hotInsightsBlock = (
    <div className="my-1.5 rounded-lg bg-muted/30 border border-border/20">
      <HotInsightsSection
        tips={hotInsightsTips}
        matchId={Number(matchId)}
        matchSummary={matchSummary}
        isMatchSummaryLoading={isMatchSummaryLoading}
        replaceTeamNames={replaceTeamNames}
        getCategoryDisplayName={getDisplayName}
        ENABLE_TENANT={ENABLE_TENANT}
      />
    </div>
  );

  const tabsBlock = (
    <MatchDetailsTabs
      matchId={matchId}
      matchData={finalMatchData}
      matchSummary={matchSummary}
      isMatchSummaryLoading={isMatchSummaryLoading}
      user_id={user_id}
      SHOW_FAVOURITE_TIPS={SHOW_FAVOURITE_TIPS}
      SHOW_FEEDBACK={SHOW_FEEDBACK}
      SHOW_PLAYER_INSIGHTS={SHOW_PLAYER_INSIGHTS}
      SHOW_FRIENDLY_BET_MAPPING={SHOW_FRIENDLY_BET_MAPPING}
      ENABLE_TENANT={ENABLE_TENANT}
      conversation_id={conversation_id}
      apim_key={apim_key}
      apim_url={apim_url}
      base_conversation_url={base_conversation_url}
      api_url_qna={api_url_qna}
      tips_broadcast={tips_broadcast}
      contentPaddingBottom={isDesignC ? "pb-56" : undefined}
      disableInternalScroll
    />
  );

  const navbarBlock = (
    <NavbarMatchSection
      AUTH_AUTH0_ID={AUTH_AUTH0_ID!}
      AUTH0_ISSUER={AUTH0_ISSUER!}
      matchData={finalMatchData}
      detailedMatchData={finalDetailedMatchData}
    />
  );

  if (isDesignC) {
    // Design C: Compact back bar + Match Pulse + Tabs all scroll together, Score bar fixed at bottom
    return (
      <SSEStatusProvider>
      <MicStateProvider>
        <div className="flex flex-col flex-1 min-h-0 w-full container mx-auto">
          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* Compact back bar — scrolls away */}
            <div className="flex items-center gap-2 px-1 py-1">
              <GoBack />
              {finalMatchData.match?.status_note && (
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {finalMatchData.match.status_note}
                </p>
              )}
            </div>
            {hotInsightsBlock}
            {tabsBlock}
          </div>
        </div>

        {/* Fixed bottom: Score bar + Ball-by-ball — sits above the BottomNavBar */}
        <div className="fixed bottom-13 inset-x-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
          <div className="container mx-auto">
            {navbarBlock}
          </div>
        </div>
      </MicStateProvider>
      </SSEStatusProvider>
    );
  }

  // Design A/B: Navbar sticky top, Match Pulse + Tabs scroll together
  return (
    <SSEStatusProvider>
    <MicStateProvider>
      <div className="flex flex-col flex-1 min-h-0 w-full container mx-auto gap-2">
        <div className="shrink-0 bg-background shadow-sm sm:ring-1 sm:ring-border/30 overflow-hidden rounded-b-xl sm:rounded-xl">
          {navbarBlock}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {hotInsightsBlock}
          {tabsBlock}
        </div>
      </div>
    </MicStateProvider>
    </SSEStatusProvider>
  );
}
