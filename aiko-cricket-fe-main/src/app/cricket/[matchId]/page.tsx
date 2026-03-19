import React, { cache } from "react";
import { Metadata } from "next";
import { SingleMatchResponse, DetailedMatchResponse } from "@/lib/types";
import MatchDetailsClient from "@/components/match-details/match-details-client";
import { auth } from "@/auth";
import { createId } from "@paralleldrive/cuid2";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface MatchDetailsPageProps {
  params: Promise<{
    matchId: string;
  }>;
}

const getMatchData = cache(async (matchId: string) => {
  if (matchId === "837981") {
    matchId = "83798";
  }

  // Check if tenant functionality is enabled
  const isTenantEnabled = process.env.ENABLE_TENANT === "true";

  const apiUrl = isTenantEnabled
    ? `${process.env.APIM_URL}${process.env.FANTASY_TENANT}/tenants/${process.env.TENANT_ID_MAPPING}/cricket/matches/${matchId}?include=true`
    : `${process.env.APIM_URL}${process.env.FANTASY}/cricket/matches/${matchId}?include=true`;

  const response = await fetch(apiUrl, {
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.APIM_SUBSCRIPTION_KEY!,
    },
    cache: "no-store", // Never cache
    next: { revalidate: 0 }, // Always fetch fresh
  });

  if (!response.ok) {
    throw new Error("Failed to fetch match data");
  }

  const data = await response.json();
  
  // Try to determine if this is detailed match data or basic match data
  const hasDetailedData = data.match?.innings && Array.isArray(data.match.innings);
  
  return {
    basicData: data as SingleMatchResponse,
    detailedData: hasDetailedData ? (data as DetailedMatchResponse) : null,
  };
});

export async function generateMetadata({
  params,
}: MatchDetailsPageProps): Promise<Metadata> {
  const { matchId } = await params;

  try {
    const match_data = await getMatchData(matchId);
    const competition_abbr =
      match_data?.basicData?.match?.competitions?.abbr || "Cricket Match";

    return {
      title: `${competition_abbr} | Aiko`,
    };
  } catch (error) {
    console.error("Error fetching match data for metadata:", error);
    return {
      title: `Match ${matchId}`,
    };
  }
}

const MatchDetailsPage: React.FC<MatchDetailsPageProps> = async ({
  params,
}) => {
  const { matchId } = await params;
  const session = await auth();

  const showFavouriteTips = process.env.SHOW_FAVOURITE_TIPS === "true";
  const showFeedback = process.env.SHOW_FEEDBACK === "true";
  const showPlayerInsights = process.env.SHOW_PLAYER_INSIGHTS === "true";
  const showFriendlyBetMapping =
    process.env.SHOW_FRIENDLY_BET_MAPPING !== "false";
  const enableTenant = process.env.ENABLE_TENANT === "true";
  const conversation_id = createId();
  const api_url_qna = enableTenant
    ? `${process.env.APIM_URL}${process.env.RAG}/tenants/${process.env.TENANT_ID_MAPPING}/chat`
    : `${process.env.APIM_URL}${process.env.RAG}/chat`;
  const apim_key = process.env.APIM_SUBSCRIPTION_KEY!;
  const base_conversation_url = enableTenant
    ? `${process.env.CONVERSATION}/tenants/${process.env.TENANT_ID_MAPPING}`
    : process.env.CONVERSATION!;
  const apim_url = process.env.APIM_URL;
  const tips_broadcast = process.env.TIPS_BROADCAST;
  try {
    const matchDataResult = await getMatchData(matchId);
    const match_data = matchDataResult.basicData;
    const detailed_match_data = matchDataResult.detailedData;
    
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-muted/60">
        <MatchDetailsClient
          matchId={matchId}
          initialData={match_data}
          user_id={session?.user?.sub}
          SHOW_FAVOURITE_TIPS={showFavouriteTips}
          SHOW_FEEDBACK={showFeedback}
          SHOW_PLAYER_INSIGHTS={showPlayerInsights}
          SHOW_FRIENDLY_BET_MAPPING={showFriendlyBetMapping}
          ENABLE_TENANT={enableTenant}
          conversation_id={conversation_id}
          apim_key={apim_key}
          apim_url={apim_url}
          api_url_qna={api_url_qna}
          base_conversation_url={base_conversation_url}
          tips_broadcast={tips_broadcast}
          AUTH_AUTH0_ID={process.env.AUTH_AUTH0_ID!}
          AUTH0_ISSUER={process.env.AUTH0_ISSUER!}
          matchData={match_data}
          detailedMatchData={detailed_match_data}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching match data:", error);
    // Render MatchDetailsClient without initial data — it will fetch client-side
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-muted/60">
        <MatchDetailsClient
          matchId={matchId}
          user_id={session?.user?.sub}
          SHOW_FAVOURITE_TIPS={showFavouriteTips}
          SHOW_FEEDBACK={showFeedback}
          SHOW_PLAYER_INSIGHTS={showPlayerInsights}
          SHOW_FRIENDLY_BET_MAPPING={showFriendlyBetMapping}
          ENABLE_TENANT={enableTenant}
          conversation_id={conversation_id}
          apim_key={apim_key}
          apim_url={apim_url}
          api_url_qna={api_url_qna}
          base_conversation_url={base_conversation_url}
          tips_broadcast={tips_broadcast}
          AUTH_AUTH0_ID={process.env.AUTH_AUTH0_ID!}
          AUTH0_ISSUER={process.env.AUTH0_ISSUER!}
        />
      </div>
    );
  }
};

export default MatchDetailsPage;
