"use client";

import { useQuery } from "@tanstack/react-query";
import { SportsMatches } from "@/lib/types";

async function fetchCompetitionMatches(competitionId: string): Promise<SportsMatches> {
  const response = await fetch(`/api/cricket/competition/${competitionId}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch competition matches: ${response.status} ${errorText}`);
  }

  return response.json();
}

interface UseCompetitionMatchesOptions {
  enabled?: boolean;
  initialData?: SportsMatches;
}

export function useCompetitionMatches(competitionId: string, options?: UseCompetitionMatchesOptions) {
  const enabled = options?.enabled ?? true;
  const initialData = options?.initialData;

  return useQuery({
    queryKey: ["competition-matches", competitionId],
    queryFn: () => fetchCompetitionMatches(competitionId),
    enabled,
    initialData,
    staleTime: Infinity,
  });
}