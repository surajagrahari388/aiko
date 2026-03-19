import React from "react";
import { notFound } from "next/navigation";
import {
  getEmbedMatchData,
  EmbedError,
  type EmbedSearchParams,
} from "@/lib/embed-helpers";
import { embedBrandingSchema, tenantIdSchema } from "@/lib/schemas/embed-params";
import EmbedMatchCenterClient from "./embed-match-center-client";

export const dynamic = "force-dynamic";

interface EmbedMatchCenterPageProps {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<EmbedSearchParams>;
}

export default async function EmbedMatchCenterPage({
  params,
  searchParams,
}: EmbedMatchCenterPageProps) {
  const { matchId } = await params;
  const {
    user_id,
    language,
    theme,
    "subscription-key": subscriptionKey,
    channel,
    tenant_id,
    accent_color,
    font_family,
    border_radius,
    heading_size,
    body_size,
  } = await searchParams;

  if (!subscriptionKey) {
    return <EmbedError message="Missing subscription-key parameter" />;
  }

  if (!user_id) {
    return <EmbedError message="Missing user_id parameter" />;
  }

  if (!channel) {
    return <EmbedError message="Missing channel parameter" />;
  }

  if (!tenant_id) {
    return <EmbedError message="Missing tenant_id parameter" />;
  }

  const parsedTenantId = tenantIdSchema.safeParse(tenant_id);
  if (!parsedTenantId.success) {
    return <EmbedError message="Invalid tenant_id parameter" />;
  }

  const branding = embedBrandingSchema.safeParse({
    accent_color,
    font_family,
    border_radius,
    heading_size,
    body_size,
  });

  const matchData = await getEmbedMatchData(matchId, subscriptionKey);

  if (!matchData) {
    notFound();
  }

  const conversation_id = crypto.randomUUID();

  return (
    <EmbedMatchCenterClient
      matchId={matchId}
      matchData={matchData}
      userId={user_id}
      language={language}
      theme={theme}
      apimUrl={process.env.APIM_URL}
      tipsBroadcast={process.env.TIPS_BROADCAST}
      enableTenant
      tenantId={parsedTenantId.data}
      subscriptionKey={subscriptionKey}
      channel={channel}
      conversationId={conversation_id}
      apiUrlQna={`${process.env.APIM_URL}${process.env.RAG}/tenants/${parsedTenantId.data}/chat`}
      baseConversationUrl={`${process.env.CONVERSATION}/tenants/${parsedTenantId.data}`}
      showFriendlyBetMapping={process.env.SHOW_FRIENDLY_BET_MAPPING === "true"}
      accentColor={branding.data?.accent_color}
      fontFamily={branding.data?.font_family}
      borderRadius={branding.data?.border_radius}
      headingSize={branding.data?.heading_size}
      bodySize={branding.data?.body_size}
    />
  );
}
