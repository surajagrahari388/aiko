"use client";

import { useQuery } from "@tanstack/react-query";
import { Match } from "@/lib/types";

async function fetchMatch(matchId: string): Promise<Match> {
  const response = await fetch(`/api/cricket/matches/${matchId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch match data: ${response.status} ${errorText}`);
  }

  return response.json();
}

interface UseMatchDataOptions {
  enabled?: boolean;
}

export function useMatchData(matchId: string | undefined, options?: UseMatchDataOptions) {
  const enabled = options?.enabled ?? Boolean(matchId);

  return useQuery({
    queryKey: ["match", matchId],
    queryFn: () => {
      if (!matchId) {
        throw new Error("Match ID is required");
      }
      return fetchMatch(matchId);
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export default useMatchData;