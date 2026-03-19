"use client";

import { useMemo, useCallback } from "react";
import { useGlobalTips } from "@/hooks/use-global-tips";
import { useMatchSummary } from "@/hooks/use-match-summary";
import { useEmbedParams } from "@/hooks/use-embed-params";
import HotInsightsSection from "@/components/match-details/hot-insights-section";
import {
  replaceTeamPlaceholders,
  getCategoryDisplayName,
} from "@/components/tips-section/tips-string-utils";
import { EmbedProvider } from "@/contexts/embed-context";
import { TenantProvider } from "@/contexts/analytics-context";
import EmbedStyleOverrides from "@/components/embed/embed-style-overrides";
import { SingleMatchResponse, SportsMatches } from "@/lib/types";

interface EmbedMatchPulseClientProps {
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
  accentColor?: string;
  fontFamily?: string;
  borderRadius?: "none" | "sm" | "md" | "lg";
  headingSize?: "sm" | "md" | "lg";
  bodySize?: "sm" | "md" | "lg";
}

export default function EmbedMatchPulseClient({
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
  accentColor,
  fontFamily,
  borderRadius,
  headingSize,
  bodySize,
}: EmbedMatchPulseClientProps) {
  useEmbedParams(themeParam, languageParam);

  // Convert SingleMatchResponse to SportsMatches shape for useGlobalTips
  const sportsMatchData: SportsMatches = useMemo(
    () => ({
      sports: matchData.sports,
      matches: [matchData.match],
    }),
    [matchData]
  );

  const {
    tips: allTips,
    teamNames,
  } = useGlobalTips({
    matchData: sportsMatchData,
    user_id: userId,
    apim_url: apimUrl,
    tips_broadcast: tipsBroadcast,
    enableSSE: true,
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
    </EmbedProvider>
    </TenantProvider>
  );
}
