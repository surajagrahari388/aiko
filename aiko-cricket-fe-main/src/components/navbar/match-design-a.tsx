import React, { useMemo } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import GoBack from "@/components/layout/go-back";
import SSEBroadcastIcon from "@/components/navbar/sse-broadcast-icon";
import type { DetailedMatchResponse } from "@/lib/types";
import { calculateCRR, calculateRRR } from "@/lib/cricket-run-rate";

function parseScore(raw: string) {
  const m = raw.match(/^([^(]+)(\s*\([^)]+\))?/);
  return { score: m?.[1]?.trim() || raw, overs: m?.[2]?.trim() };
}

export interface MatchDesignProps {
  teamAName: string;
  teamAShortName?: string;
  teamALogo?: string;
  teamAScore: string;
  teamAId?: string;
  teamBName: string;
  teamBShortName?: string;
  teamBLogo?: string;
  teamBScore: string;
  teamBId?: string;
  isLive: boolean;
  timeStr: string;
  dateStr: string;
  lastBallLabel: string;
  lastBallBadgeColor: string;
  lastBallEventId?: string;
  lastBallType?: string;
  statusNote?: string | null;
  gameStateStr?: string;
  detailedMatchData?: DetailedMatchResponse;
}

export default function MatchDesignA({
  teamAName,
  teamAShortName,
  teamALogo,
  teamAScore,
  teamBName,
  teamBShortName,
  teamBLogo,
  teamBScore,
  isLive,
  timeStr,
  dateStr,
  lastBallLabel,
  lastBallBadgeColor,
  lastBallEventId,
  lastBallType,
  statusNote,
  gameStateStr,
  detailedMatchData,
}: MatchDesignProps) {
  const currentCRR = useMemo(() => calculateCRR(detailedMatchData, isLive), [detailedMatchData, isLive]);
  const currentRRR = useMemo(() => calculateRRR(detailedMatchData, isLive), [detailedMatchData, isLive]);
  const hasScores = (teamAScore && teamAScore.trim()) || (teamBScore && teamBScore.trim());

  const teamAParsed = teamAScore && teamAScore.trim() ? parseScore(teamAScore) : null;
  const teamBParsed = teamBScore && teamBScore.trim() ? parseScore(teamBScore) : null;
  const showBottomRow = hasScores && (teamAParsed?.overs || teamBParsed?.overs || currentCRR || currentRRR);

  return (
    <div className="w-full bg-background">
      <div className="container mx-auto px-3 sm:px-6 lg:px-6 py-3 sm:py-3.5 flex flex-col gap-3 sm:gap-3.5">
        {/* Top bar: GoBack + Status Note (centered) */}
        <div className="relative flex items-center justify-center min-h-8 sm:min-h-9">
          <div className="absolute left-0">
            <GoBack />
          </div>
          {statusNote && (
            <p className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground truncate max-w-[70%] text-center">
              {statusNote}
            </p>
          )}
        </div>

        {/* Main section: Team A | Ball Event | Team B */}
        <div>
          <div className={`flex ${hasScores ? 'items-start' : 'items-center'} justify-between`}>
            {/* Team A — left */}
            <div className={`flex ${hasScores ? 'items-start' : 'items-center'} gap-1.5 sm:gap-2 flex-1 min-w-0`}>
              {teamALogo && (
                <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl overflow-hidden bg-[#f3f4f6] flex items-center justify-center">
                  <Image src={teamALogo} alt={teamAName} width={1024} height={1024} className="object-contain w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="sm:hidden text-xs font-bold text-foreground truncate">{teamAShortName || teamAName}</span>
                <span className="hidden sm:block text-sm md:text-base font-bold text-foreground truncate max-w-30 md:max-w-none">{teamAName}</span>
                {hasScores && (
                  teamAParsed ? (
                    <span className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground leading-tight whitespace-nowrap">{teamAParsed.score}</span>
                  ) : (
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground italic">Yet to bat</span>
                  )
                )}
              </div>
            </div>

            {/* Center: Ball event badge */}
            <div className="shrink flex flex-col items-center px-1 sm:px-4 max-w-[35%] sm:max-w-none pt-0.5">
              {isLive && lastBallLabel ? (
                <div
                  key={lastBallEventId}
                  className={`relative flex items-center justify-center rounded-full p-0.5 animate-border-spin ${
                    lastBallType === "wicket" ? "animate-ball-shake" : "animate-ball-pop"
                  }`}
                  style={{
                    background: `conic-gradient(from var(--border-angle, 0deg), transparent 40%, ${
                      lastBallType === "wicket" ? "rgba(248,113,113,0.9)" :
                      lastBallType === "six" || lastBallType === "wide+six" || lastBallType === "noball+six" ? "rgba(192,132,252,0.9)" :
                      lastBallType === "four" || lastBallType === "wide+four" || lastBallType === "noball+four" ? "rgba(96,165,250,0.9)" :
                      "rgba(255,255,255,0.4)"
                    } 50%, transparent 60%)`
                  } as React.CSSProperties}
                >
                  <Badge className={`relative ${lastBallBadgeColor} text-white text-xs sm:text-xl font-bold px-3 sm:px-6 py-1.5 sm:py-2.5 border-0 rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap`}>
                    {lastBallType === "wicket" ? "OUT!" :
                     lastBallType === "six" ? "SIX!" :
                     lastBallType === "wide+six" ? "WIDE SIX!" :
                     lastBallType === "noball+six" ? "NB SIX!" :
                     lastBallType === "four" ? "FOUR!" :
                     lastBallType === "wide+four" ? "WIDE FOUR!" :
                     lastBallType === "noball+four" ? "NB FOUR!" :
                     lastBallType === "wide" ? "WIDE" :
                     lastBallType === "noball" ? "NO BALL" :
                     lastBallType === "dot" ? "DOT" :
                     lastBallLabel === "1" ? "1 RUN" : `${lastBallLabel} RUNS`}
                  </Badge>
                </div>
              ) : isLive && gameStateStr && gameStateStr !== "Default" && gameStateStr !== "Play Ongoing" ? (
                <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-xs sm:text-base font-bold px-3 sm:px-5 py-1 sm:py-1.5 border-0 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap">
                  {gameStateStr}
                </Badge>
              ) : isLive ? (
                <Badge className="bg-green-500 hover:bg-green-500 text-white text-sm sm:text-base font-bold px-4 sm:px-5 py-1 sm:py-1.5 border-0 rounded-full uppercase tracking-wider shadow-sm">
                  Live
                </Badge>
              ) : (
                <div className="flex flex-col items-center gap-0.5 text-xs sm:text-sm text-muted-foreground">
                  <span className="font-medium">{timeStr}</span>
                  {dateStr && <span className="font-medium text-[10px] sm:text-xs">{dateStr}</span>}
                </div>
              )}
            </div>

            {/* Team B — right */}
            <div className={`flex ${hasScores ? 'items-start' : 'items-center'} gap-1.5 sm:gap-2 flex-1 min-w-0 justify-end`}>
              <div className="flex flex-col items-end min-w-0">
                <span className="sm:hidden text-xs font-bold text-foreground truncate">{teamBShortName || teamBName}</span>
                <span className="hidden sm:block text-sm md:text-base font-bold text-foreground truncate max-w-30 md:max-w-none">{teamBName}</span>
                {hasScores && (
                  teamBParsed ? (
                    <span className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground leading-tight whitespace-nowrap">{teamBParsed.score}</span>
                  ) : (
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground italic">Yet to bat</span>
                  )
                )}
              </div>
              {teamBLogo && (
                <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl overflow-hidden bg-[#f3f4f6] flex items-center justify-center">
                  <Image src={teamBLogo} alt={teamBName} width={1024} height={1024} className="object-contain w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                </div>
              )}
            </div>
          </div>

          {/* Overs + CRR/RRR unified row */}
          {showBottomRow && (
            <div className="flex items-center justify-between mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-foreground/70">
              <span className="flex-1 min-w-0 pl-9.5 sm:pl-12 md:pl-14">{teamAParsed?.overs || ""}</span>
              {isLive && (currentCRR || currentRRR) && (
                <div className="flex items-center gap-2 shrink-0">
                  {currentCRR && <span>CRR: <span className="font-semibold text-foreground">{currentCRR}</span></span>}
                  {currentCRR && currentRRR && <span className="text-muted-foreground/40">{"\u00B7"}</span>}
                  {currentRRR && <span>RRR: <span className="font-semibold text-foreground">{currentRRR}</span></span>}
                  <SSEBroadcastIcon />
                </div>
              )}
              <span className="flex-1 min-w-0 text-right pr-9.5 sm:pr-12 md:pr-14">{teamBParsed?.overs || ""}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}