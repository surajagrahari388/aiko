"use client";

import React, { useMemo, useCallback, useContext } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Team } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { formatDateWithTimezone } from "@/lib/utils";
import { Match } from "@/lib/types";
import posthog from "posthog-js";
import { TenantContext } from "@/contexts/analytics-context";
import { useLanguage } from "@/contexts/language-context";
import { log } from "@/lib/debug-logger";

export interface MatchCardProps {
  match: Match;
  sport: string;
}

const TeamRow: React.FC<{ team?: Team; score?: string }> = React.memo(
  ({ team, score }) => {
    const fullName = team?.name || team?.short_name || "TEAM";
    const logo_url = team?.logo_url;

    return (
      <div className="flex items-center gap-3 px-2">
        {logo_url ? (
          <Image
            src={logo_url}
            alt={fullName}
            className="w-5 h-5 rounded-full object-cover shrink-0"
            width={20}
            height={20}
            placeholder="empty"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground shrink-0">
            {fullName.slice(0, 2)}
          </div>
        )}
        <div className="min-w-0 flex-1 flex items-center justify-between">
          <div 
            className="text-xs font-medium text-foreground truncate flex-1 max-w-[85px] sm:max-w-[110px]"
            title={fullName}
          >
            {fullName}
          </div>
          {score && (
            <div className="text-xs font-normal text-muted-foreground ml-2 shrink-0">
              {score}
            </div>
          )}
        </div>
      </div>
    );
  }
);

TeamRow.displayName = "TeamRow";

const MatchCardComponent: React.FC<MatchCardProps> = ({ match }) => {
  const tenantContext = useContext(TenantContext);
  const { language } = useLanguage();

  const statusLower = match?.status_str?.toLowerCase();

  const timeStr = useMemo(() => {
    const dateSrc = match?.date_start ?? match?.date_start_ist;
    return dateSrc
      ? formatDateWithTimezone(dateSrc, "utc", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).toLowerCase()
      : "--:--";
  }, [match?.date_start, match?.date_start_ist]);

  const dateStr = useMemo(() => {
    const dateSrc = match?.date_start ?? match?.date_start_ist;
    return dateSrc
      ? formatDateWithTimezone(dateSrc, "utc", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      : "";
  }, [match?.date_start, match?.date_start_ist]);

  const isLive = statusLower === "live";

  const getScore = useCallback(
    (teamIdx: number) => {
      if (!isLive) return undefined;
      const score = match.teams?.[teamIdx]?.scores_full || match.teams?.[teamIdx]?.scores;
      
      // Check if both teams have no scores
      const team1Score = match.teams?.[0]?.scores_full || match.teams?.[0]?.scores;
      const team2Score = match.teams?.[1]?.scores_full || match.teams?.[1]?.scores;
      const bothTeamsHaveNoScore = !team1Score && !team2Score;
      
      // If both teams have no scores, don't show anything
      if (bothTeamsHaveNoScore) return undefined;
      
      // If at least one team has a score and this team doesn't, show "Yet to bat"
      if (!score) return "Yet to bat";
      return score;
    },
    [isLive, match.teams]
  );

  // Create payload for logging (can be reused across multiple refs)
  const matchClickPayload = useMemo(() => ({
    match_id: match.match_id,
    competition: match.competitions?.title || "Unknown",
    status: match.status_str || "Unknown",
    date_start: match.date_start ?? match.date_start_ist,
    team_1:
      match.teams?.[0]?.name || match.teams?.[0]?.short_name || "Unknown",
    team_2:
      match.teams?.[1]?.name || match.teams?.[1]?.short_name || "Unknown",
    tenant_id: tenantContext?.tenantId || "Unknown",
    language: language || "Unknown",
  }), [match, tenantContext?.tenantId, language]);

  const handleMatchClick = useCallback(() => {
    posthog.capture("match_click", matchClickPayload);
    log({
      event_name: "match_click",
      payload: matchClickPayload,
    });
  }, [matchClickPayload]);

  return (
    <Link
      href={`/cricket/${match?.match_id || ""}`}
      passHref
      onClick={handleMatchClick}
    >
      <Card className="relative bg-card/60 backdrop-blur-sm border-border/50 transition-all duration-300 h-full cursor-pointer shadow-sm hover:-translate-y-1 hover:scale-[1.02]">
        <div className="p-1">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Left - Teams stacked vertically */}
            <div className="flex-1 flex flex-col gap-1">
              <TeamRow team={match.teams?.[0]} score={getScore(0)} />
              <TeamRow team={match.teams?.[1]} score={getScore(1)} />
            </div>

            {/* Divider */}
            <div className="w-px h-12 sm:h-16 bg-border" />

            {/* Right - Status Badge, Date and Time */}
            <div className="shrink-0 pr-1 sm:pr-2 pl-2 sm:pl-4 text-right flex flex-col items-end justify-center min-w-[100px]">
              {/* Status Badge - Show only for live matches */}
              {statusLower && isLive && (
                <div className="flex justify-end">
                  <Badge
                    className="relative bg-green-500/10 text-green-500 text-xs shrink-0 flex items-center gap-1.5 px-2.5 py-1 overflow-hidden border-0"
                    variant="secondary"
                  >
                      {/* Ripple effect background */}
                      <div className="absolute inset-0 bg-green-500/5 animate-ping rounded-full"></div>

                      {/* Pulsing dot with ripple */}
                      <div className="relative">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-2 h-2 bg-green-500/30 rounded-full animate-ping"></div>
                      </div>

                      <span className="relative font-medium">Live</span>
                    </Badge>
                </div>
              )}

              {/* Date and Time for scheduled matches (not live) */}
              {!isLive && (
                <>
                  <div className="text-xs text-muted-foreground leading-tight mt-1">
                    {dateStr}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground mt-0.5">
                    {timeStr}
                  </div>
                </>
              )}

              {/* keep ISO in an accessible-only element for screen readers for scheduled matches */}
              {(match?.date_start || match?.date_start_ist) && !isLive && (
                <span className="sr-only">
                  {match.date_start ?? match.date_start_ist}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

MatchCardComponent.displayName = "MatchCard";

export const MatchCard = MatchCardComponent;
