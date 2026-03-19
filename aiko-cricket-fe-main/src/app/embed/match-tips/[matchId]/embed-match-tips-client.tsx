"use client";

import { useMatchSummary } from "@/hooks/use-match-summary";
import { useEmbedParams } from "@/hooks/use-embed-params";
import MatchDetailsTabs from "@/components/match-details/match-details-tabs";
import { EmbedProvider } from "@/contexts/embed-context";
import { TenantProvider } from "@/contexts/analytics-context";
import EmbedStyleOverrides from "@/components/embed/embed-style-overrides";
import { SSEStatusProvider } from "@/contexts/sse-status-context";
import { MicStateProvider } from "@/contexts/mic-state-context";
import { SingleMatchResponse } from "@/lib/types";

interface EmbedMatchTipsClientProps {
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

export default function EmbedMatchTipsClient({
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
}: EmbedMatchTipsClientProps) {
  useEmbedParams(themeParam, languageParam);

  // Match summary (lifted here so it's fetched once and shared with tabs)
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
          <div className="flex flex-col min-h-screen">
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
              embedMode
            />
          </div>
        </MicStateProvider>
      </SSEStatusProvider>
    </EmbedProvider>
    </TenantProvider>
  );
}
