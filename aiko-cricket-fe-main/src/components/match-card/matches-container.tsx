"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MatchCard } from "@/components/match-card/match-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import type { Match } from "@/lib/types";
import { SportsMatches } from "@/lib/types";
import { useMatchFilter } from "@/contexts/match-filter-context";

interface GroupedMatches {
  [competitionTitle: string]: Match[];
}

export interface MatchesContainerProps {
  sportsMatchesData: SportsMatches;
  hideCompetitionLinks?: boolean;
  matchesLimit?: number;
}

const getSportsDisplayName = (sport: string) => {
  return sport.charAt(0).toUpperCase() + sport.slice(1);
};

const MatchesContainer: React.FC<MatchesContainerProps> = ({ sportsMatchesData, hideCompetitionLinks = false, matchesLimit = 3 }) => {
    const { sports, matches } = sportsMatchesData;
    const matchFilterContext = useMatchFilter();
    const selectedStatus = matchFilterContext?.selectedStatus || "all";
    const [expandedCompetitions, setExpandedCompetitions] = useState<
      Record<string, boolean>
    >({});
    const router = useRouter();

    // Memoize date calculations
    const { today, tomorrow } = useMemo(() => ({
      today: new Date().toISOString().split("T")[0],
      tomorrow: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    }), []);

    // Filter matches based on selected status
    const filteredMatches = useMemo(() => {
      if (selectedStatus === "all") return matches;
      if (selectedStatus === "live") {
        return matches.filter(
          (match) => match.status_str?.toLowerCase() === "live"
        );
      }
      if (selectedStatus === "today") {
        return matches.filter((match) =>
          match.date_start_ist.startsWith(today)
        );
      }
      if (selectedStatus === "tomorrow") {
        return matches.filter((match) =>
          match.date_start_ist.startsWith(tomorrow)
        );
      }
      return matches;
    }, [matches, selectedStatus, today, tomorrow]);

    // Count matches by status
    // const liveMatchesCount = useMemo(
    //   () =>
    //     matches.filter((match) => match.status_str?.toLowerCase() === "live")
    //       .length,
    //   [matches]
    // );

    // Group matches by competition
    const groupedMatches = useMemo<GroupedMatches>(() => {
      if (!filteredMatches.length) return {} as GroupedMatches;
      return filteredMatches.reduce((acc, match) => {
        const competitionTitle = match.competitions?.title?.trim();
        const key =
          competitionTitle && competitionTitle.length > 0
            ? competitionTitle
            : "Other Competitions";
        (acc[key] ||= []).push(match);
        return acc;
      }, {} as GroupedMatches);
    }, [filteredMatches]);

    return (
      <div
        className="min-h-screen bg-linear-to-r from-background via-background to-background/90 relative overflow-hidden"
        id="matches-container"
      >
        <div className="relative z-10 container mx-auto py-2">
          {/* Display matches grouped by competition */}
          <div className="space-y-2">
            {Object.entries(groupedMatches).map(
              ([competitionTitle, competitionMatches]) => {
                const competitionId = competitionMatches[0]?.competitions?.cid;
                const isExpanded =
                  expandedCompetitions[competitionTitle] ?? true;

                return (
                  <div key={competitionTitle} className="space-y-2">
                    {/* Competition Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm sm:text-lg font-semibold text-foreground">
                          {competitionTitle}
                        </h2>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedCompetitions((prev) => ({
                            ...prev,
                            [competitionTitle]: !isExpanded,
                          }))
                        }
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isExpanded ? "" : "rotate-180"
                          }`}
                        />
                      </Button>
                    </div>

                    {/* Matches Grid and See All Link */}
                    {isExpanded && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
                          {(() => {
                            // If on competition page, show all matches without filtering
                            if (hideCompetitionLinks) {
                              return competitionMatches.map((match: Match) => (
                                <MatchCard
                                  key={match.match_id}
                                  match={match}
                                  sport={sports}
                                />
                              ));
                            }

                            // Main page logic: limit to configurable number of matches but show all live if >limit live matches
                            const liveMatches = competitionMatches.filter(
                              (match) =>
                                match.status_str?.toLowerCase() === "live"
                            );
                            const nonLiveMatches = competitionMatches.filter(
                              (match) =>
                                match.status_str?.toLowerCase() !== "live"
                            );

                            let matchesToShow: Match[];

                            if (liveMatches.length > matchesLimit) {
                              // If more than configured limit live matches, show all live matches
                              matchesToShow = liveMatches;
                            } else {
                              // Otherwise, show up to configured limit matches total (prioritizing live matches)
                              const remainingSlots = matchesLimit - liveMatches.length;
                              const additionalMatches = nonLiveMatches.slice(
                                0,
                                remainingSlots
                              );
                              matchesToShow = [
                                ...liveMatches,
                                ...additionalMatches,
                              ];
                            }

                            return matchesToShow.map((match: Match) => (
                              <MatchCard
                                key={match.match_id}
                                match={match}
                                sport={sports}
                              />
                            ));
                          })()}
                        </div>
                        {/* See All Matches link for this competition - only show if more than configured limit matches total */}
                        {!hideCompetitionLinks &&
                          competitionMatches.length > matchesLimit && (
                            <div className="flex justify-start">
                              <Button
                                variant="link"
                                className="text-muted-foreground hover:text-foreground p-0 h-auto font-normal text-sm"
                                onClick={() => {
                                  if (competitionId) {
                                    router.push(
                                      `/cricket/competition/${competitionId}`
                                    );
                                  }
                                }}
                              >
                                {"See All Matches ›"}
                              </Button>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>

          {/* No matches message */}
          {filteredMatches.length === 0 && matches.length > 0 && (
            <div className="text-center py-8">
              <Card className="bg-card/50 backdrop-blur-sm p-6 border border-border/50 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No{" "}
                  {selectedStatus === "live"
                    ? "Live"
                    : selectedStatus === "today"
                    ? "Today's"
                    : selectedStatus === "tomorrow"
                    ? "Tomorrow's"
                    : ""}{" "}
                  Matches
                </h3>
                <p className="text-muted-foreground text-sm">
                  {selectedStatus === "live"
                    ? "No live matches are currently available. Check back later or view all matches."
                    : selectedStatus === "today"
                    ? "No matches are scheduled for today. Check back later or view all matches."
                    : selectedStatus === "tomorrow"
                    ? "No matches are scheduled for tomorrow. Check back later or view all matches."
                    : "No matches available."}
                </p>
              </Card>
            </div>
          )}

          {/* No matches at all message */}
          {matches.length === 0 && (
            <div className="text-center py-8">
              <Card className="bg-card/50 backdrop-blur-sm p-6 border border-border/50 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Matches Available
                </h3>
                <p className="text-muted-foreground text-sm">
                  Check back later for upcoming {getSportsDisplayName(sports)}{" "}
                  matches.
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
};

MatchesContainer.displayName = "MatchesContainer";

export default MatchesContainer;
