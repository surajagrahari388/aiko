"use client";

import { useMatches } from "@/hooks/use-matches";
import MatchesContainerSkeleton from "@/components/match-card/matches-container-skeleton";
import MatchesContainer from "@/components/match-card/matches-container";
import { SportsMatches } from "@/lib/types";

interface MatchesClientProps {
  initialData?: SportsMatches | null;
  matchesLimit?: number;
}

export default function MatchesClient({ initialData, matchesLimit = 3 }: MatchesClientProps) {
  const { data, error, isLoading } = useMatches({
    enabled: true, // Always enable for live updates
  });

  const matchesData = data || initialData;

  if (isLoading && !initialData) return <MatchesContainerSkeleton />;
  if (error || !matchesData) return <MatchesContainerSkeleton />;

  return <MatchesContainer sportsMatchesData={matchesData} matchesLimit={matchesLimit} />;
}
