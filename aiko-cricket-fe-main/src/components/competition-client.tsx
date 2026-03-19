"use client";

import { useCompetitionMatches } from "@/hooks/use-competition-matches";
import MatchesContainerSkeleton from "@/components/match-card/matches-container-skeleton";
import MatchesContainer from "@/components/match-card/matches-container";
import { SportsMatches } from "@/lib/types";

interface CompetitionClientProps {
  competitionId: string;
  initialData?: SportsMatches;
}

export default function CompetitionClient({
  competitionId,
  initialData,
}: CompetitionClientProps) {
  const { data, error, isLoading } = useCompetitionMatches(competitionId, {
    enabled: true, // Always enable for live updates
    initialData,
  });

  // Use latest data from query if available, otherwise use initialData
  const matchesData = data || initialData;

  if (isLoading && !initialData) return <MatchesContainerSkeleton />;
  if (error || !matchesData) return <div className="p-4">Unable to load matches</div>;

  return <MatchesContainer sportsMatchesData={matchesData} hideCompetitionLinks={true} />;
}
