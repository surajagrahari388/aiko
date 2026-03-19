"use client";

import { useQuery } from "@tanstack/react-query";
import { SportsMatches } from "@/lib/types";

async function fetchMatches(): Promise<SportsMatches> {
  const response = await fetch("/api/cricket/matches", {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch matches: ${response.status} ${errorText}`);
  }

  return response.json();
}

interface UseMatchesOptions {
  enabled?: boolean;
}

export function useMatches(options?: UseMatchesOptions) {
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    enabled,
    staleTime: Infinity,
  });
}

export default useMatches;