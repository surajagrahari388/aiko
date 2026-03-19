"use client";

import { useQuery } from "@tanstack/react-query";
import { PlayerTipsResponseSchema, PlayerTipsResponse } from "@/lib/schemas/player-tips";

type FetchPlayerTipsParams = {
  match_id: number | string;
  user_id: string;
  language: string;
};

type PlayerTipsRequestPayload = {
  match_id: number;
  user_id: string;
  language: string;
};

async function fetchPlayerTips(body: FetchPlayerTipsParams): Promise<PlayerTipsResponse> {
  // Coerce match_id to number (server expects a number)
  const payload: PlayerTipsRequestPayload = {
    ...body,
    match_id: typeof body.match_id === "string" ? Number(body.match_id) : (body.match_id as number),
  };

  const res = await fetch(`/api/tips/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch player tips: ${res.status} ${text}`);
  }

  const json = await res.json();
  // Validate with zod
  const parsed = PlayerTipsResponseSchema.safeParse(json);
  if (!parsed.success) {
    // include validation errors in thrown error for easier debugging
    throw new Error(`Player tips response validation failed: ${JSON.stringify(parsed.error.format())}`);
  }

  return parsed.data;
}

export function usePlayerTips(params: FetchPlayerTipsParams, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(params.match_id && params.user_id && params.language);

  return useQuery({
    queryKey: ["player-tips", params.match_id, params.language, params.user_id],
    queryFn: () => fetchPlayerTips(params),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export default usePlayerTips;