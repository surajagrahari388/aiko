"use client";

import { useMemo, useCallback } from "react";
import { useGlobalTips } from "@/hooks/use-global-tips";
import { useMatchSummary } from "@/hooks/use-match-summary";
import { useEmbedParams } from "@/hooks/use-embed-params";
import HotInsightsSection from "@/components/match-details/hot-insights-section";
import MatchDetailsTabs from "@/components/match-details/match-details-tabs";
import {
  replaceTeamPlaceholders,
  getCategoryDisplayName,
} from "@/components/tips-section/tips-string-utils";
import { EmbedProvider } from "@/contexts/embed-context";
import { TenantProvider } from "@/contexts/analytics-context";
import EmbedStyleOverrides from "@/components/embed/embed-style-overrides";
import { SSEStatusProvider } from "@/contexts/sse-status-context";
import { MicStateProvider } from "@/contexts/mic-state-context";
import { SingleMatchResponse, SportsMatches } from "@/lib/types";

interface EmbedMatchCenterClientProps {
  matchId: string;
  matchData: SingleMatchResponse;
  userId: string;
  language?: string;
  theme?: string;
  apimUrl?: string;
  tipsBroadcast?: string;
  enableTenant: boolean;
  tenantId: string;
  subscriptionKey: string;
  channel: string;
  conversationId: string;
  apiUrlQna?: string;
  baseConversationUrl?: string;
  showFriendlyBetMapping?: boolean;
  accentColor?: string;
  fontFamily?: string;
  borderRadius?: "none" | "sm" | "md" | "lg";
  headingSize?: "sm" | "md" | "lg";
  bodySize?: "sm" | "md" | "lg";
}

export default function EmbedMatchCenterClient({
  matchId,
  matchData,
  userId,
  language: languageParam,
  theme: themeParam,
  apimUrl,
  tipsBroadcast,
  enableTenant,
  tenantId,
  subscriptionKey,
  channel,
  conversationId,
  apiUrlQna,
  baseConversationUrl,
  showFriendlyBetMapping,
  accentColor,
  fontFamily,
  borderRadius,
  headingSize,
  bodySize,
}: EmbedMatchCenterClientProps) {
  useEmbedParams(themeParam, languageParam);

  // Convert SingleMatchResponse to SportsMatches shape for useGlobalTips
  const sportsMatchData: SportsMatches = useMemo(
    () => ({
      sports: matchData.sports,
      matches: [matchData.match],
    }),
    [matchData]
  );

  // SSE dedup: parent reads cache only (enableSSE: false),
  // MatchDetailsTabs opens SSE internally (enableSSE: true)
  const { tips: allTips, teamNames } = useGlobalTips({
    matchData: sportsMatchData,
    user_id: userId,
    apim_url: apimUrl,
    tips_broadcast: tipsBroadcast,
    enableSSE: false,
    enableTenant,
    subscriptionKey,
  });

  const matchPulseTips = useMemo(
    () => allTips.filter((t) => t.is_match_pulse),
    [allTips]
  );

  // Resolve team names: prefer SSE-provided teamNames, fallback to matchData teams
  const team1 =
    teamNames?.team1 || matchData.match.teams?.[0]?.name || "Team A";
  const team2 =
    teamNames?.team2 || matchData.match.teams?.[1]?.name || "Team B";

  const replaceTeamNames = useCallback(
    (text: string) => replaceTeamPlaceholders(text, team1, team2),
    [team1, team2]
  );

  const getCategory = useCallback(
    (name: string) => getCategoryDisplayName(name, team1, team2),
    [team1, team2]
  );

  // Match summary (shared between HotInsightsSection and MatchDetailsTabs)
  const {
    summary: matchSummary,
    isLoading: isMatchSummaryLoading,
  } = useMatchSummary({
    match_id: Number(matchId),
    user_id: userId,
    subscriptionKey,
  });

  return (
    <TenantProvider tenantIdMapping={tenantId}>
    <EmbedProvider
      subscriptionKey={subscriptionKey}
      channel={channel}
      disableAudio
      accentColor={accentColor}
      fontFamily={fontFamily}
      borderRadius={borderRadius}
      headingSize={headingSize}
      bodySize={bodySize}
    >
      <EmbedStyleOverrides />
      <SSEStatusProvider>
        <MicStateProvider>
          <div className="flex flex-col h-screen">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-2">
                <HotInsightsSection
                  tips={matchPulseTips}
                  matchId={Number(matchId)}
                  matchSummary={matchSummary}
                  isMatchSummaryLoading={isMatchSummaryLoading}
                  replaceTeamNames={replaceTeamNames}
                  getCategoryDisplayName={getCategory}
                  ENABLE_TENANT={enableTenant}
                />
              </div>
              <MatchDetailsTabs
                matchId={matchId}
                matchData={matchData}
                matchSummary={matchSummary}
                isMatchSummaryLoading={isMatchSummaryLoading}
                user_id={userId}
                SHOW_FAVOURITE_TIPS={false}
                SHOW_FEEDBACK={false}
                SHOW_PLAYER_INSIGHTS={false}
                SHOW_FRIENDLY_BET_MAPPING={showFriendlyBetMapping}
                ENABLE_TENANT={enableTenant}
                conversation_id={conversationId}
                apim_key={subscriptionKey}
                apim_url={apimUrl}
                base_conversation_url={baseConversationUrl}
                api_url_qna={apiUrlQna}
                tips_broadcast={tipsBroadcast}
                contentPaddingBottom="pb-0"
                disableInternalScroll
                embedMode
              />
            </div>
          </div>
        </MicStateProvider>
      </SSEStatusProvider>
    </EmbedProvider>
    </TenantProvider>
  );
}
