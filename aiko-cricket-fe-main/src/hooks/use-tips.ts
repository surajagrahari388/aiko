
"use client";

import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { TipsResponseSchema, TipsResponse } from "@/lib/schemas/tips";
import { TenantContext } from "@/contexts/analytics-context";

type FetchTipsParams = {
  match_id: number | string;
  user_id?: string;
  language?: string;
  team1_full_name?: string;
  team2_full_name?: string;
};

export type TipsQueryData = TipsResponse & { generating?: boolean };

async function fetchTips(body: FetchTipsParams, tenantIdMapping?: string, enableTenant?: boolean): Promise<TipsQueryData> {
  // Coerce match_id to number (server expects a number)
  const payload = {
    ...body,
    match_id: typeof body.match_id === "string" ? Number(body.match_id) : (body.match_id as number),
    ...(enableTenant && tenantIdMapping && { tenant_id: tenantIdMapping }),
  };

  const res = await fetch(`/api/tips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Backend is still generating tips — bypass Zod validation and return
  // a minimal TipsQueryData shape so consumers can detect the state and poll.
  if (res.status === 202) {
    return { summary: [], generating: true };
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch tips: ${res.status} ${text}`);
  }

  const json = await res.json();
  // Validate with zod
  const parsed = TipsResponseSchema.safeParse(json);
  if (!parsed.success) {
    // include validation errors in thrown error for easier debugging
    throw new Error(`Tips response validation failed: ${JSON.stringify(parsed.error.format())}`);
  }

  return parsed.data;
}

export function useTips(params: FetchTipsParams, options?: { enabled?: boolean; enableTenant?: boolean }) {
  const enabled = options?.enabled ?? Boolean(params.match_id);
  const tenantContext = useContext(TenantContext);

  const query = useQuery<TipsQueryData>({
    queryKey: ["tips", params.match_id, params.language, params.user_id, options?.enableTenant],
    queryFn: () => fetchTips(params, tenantContext?.tenantIdMapping, options?.enableTenant),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: (q) => {
      if (q.state.data?.generating) return 15_000;
      return false;
    },
  });

  return {
    ...query,
    tipsGenerating: query.data?.generating ?? false,
  };
}

export default useTips;
