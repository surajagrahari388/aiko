import { cache } from "react";
import { SingleMatchResponse } from "@/lib/types";
import { buildApimUrl } from "@/lib/api-helpers";

export interface EmbedSearchParams {
  user_id?: string;
  language?: string;
  theme?: string;
  "subscription-key"?: string;
  channel?: string;
  tenant_id?: string;
  accent_color?: string;
  font_family?: string;
  border_radius?: string;
  heading_size?: string;
  body_size?: string;
}

export const getEmbedMatchData = cache(
  async (matchId: string, subscriptionKey: string) => {
    const normalizedMatchId = matchId === "837981" ? "83798" : matchId;
    const apiUrl = buildApimUrl(
      `/cricket/matches/${normalizedMatchId}?include=true`,
    );

    const response = await fetch(apiUrl, {
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SingleMatchResponse;
  },
);

export function EmbedError({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-[7.5rem] p-4">
      <p className="text-sm text-destructive font-medium">{message}</p>
    </div>
  );
}
