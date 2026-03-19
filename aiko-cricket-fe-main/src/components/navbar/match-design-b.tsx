import { useMemo } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import GoBack from "@/components/layout/go-back";
import SSEBroadcastIcon from "@/components/navbar/sse-broadcast-icon";
import type { MatchDesignProps } from "@/components/navbar/match-design-a";
import { calculateCRR, calculateRRR } from "@/lib/cricket-run-rate";

function parseScore(raw: string) {
  const m = raw.match(/^([^(]+)(\s*\([^)]+\))?/);
  return { score: m?.[1]?.trim() || raw, overs: m?.[2]?.trim() };
}

export default function MatchDesignB({
  teamAName,
  teamAShortName,
  teamALogo,
  teamAScore,
  teamAId,
  teamBName,
  teamBShortName,
  teamBLogo,
  teamBScore,
  teamBId,
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
  const hasScores = (teamAScore && teamAScore.trim()) || (teamBScore && teamBScore.trim());

  const currentInning = detailedMatchData?.match?.innings?.find(
    (inning) => inning.status === 3
  );
  const currentCRR = useMemo(() => calculateCRR(detailedMatchData, isLive), [detailedMatchData, isLive]);
  const currentRRR = useMemo(() => calculateRRR(detailedMatchData, isLive), [detailedMatchData, isLive]);

  return (
    <>
      {/* Navbar bar: GoBack + Ball badge */}
      <div className="container mx-auto md:px-2 sm:px-6 lg:px-6 px-3">
        <div className="flex items-center justify-between h-12 sm:h-14 gap-3">
          <div className="flex items-center gap-1 min-w-0">
            <GoBack />
          </div>

          {/* Center: Last ball event badge */}
          <div className="flex-1 flex justify-center">
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
                <Badge className={`relative ${lastBallBadgeColor} text-white text-base sm:text-xl font-bold px-4 sm:px-6 py-2 sm:py-2.5 border-0 rounded-full uppercase tracking-wider shadow-lg`}>
                  {lastBallType === "wicket" ? "OUT!" :
                   lastBallType === "six" ? "SIX!" :
                   lastBallType === "wide+six" ? "WIDE SIX!" :
                   lastBallType === "noball+six" ? "NB SIX!" :
                   lastBallType === "four" ? "FOUR!" :
                   lastBallType === "wide+four" ? "WIDE FOUR!" :
                   lastBallType === "noball+four" ? "NB FOUR!" :
                   lastBallType === "wide" ? "WIDE" :
                   lastBallType === "noball" ? "NO BALL" :
                   lastBallType === "dot" ? "DOT BALL" :
                   lastBallLabel === "1" ? "1 RUN" : `${lastBallLabel} RUNS`}
                </Badge>
              </div>
            ) : isLive && gameStateStr && gameStateStr !== "Default" && gameStateStr !== "Play Ongoing" ? (
              <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-sm sm:text-base font-bold px-4 sm:px-5 py-1 sm:py-1.5 border-0 rounded-full uppercase tracking-wider shadow-sm">
                {gameStateStr}
              </Badge>
            ) : isLive ? (
              <Badge className="bg-green-500 hover:bg-green-500 text-white text-sm sm:text-base font-bold px-4 sm:px-5 py-1 sm:py-1.5 border-0 rounded-full uppercase tracking-wider shadow-sm">
                Live
              </Badge>
            ) : (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                <span className="font-medium">{timeStr}</span>
                {dateStr && (
                  <>
                    <span className="text-muted-foreground/50">{"\u00B7"}</span>
                    <span className="font-medium">{dateStr}</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="w-8" />
        </div>
      </div>

      {/* Score section: team logos, names, scores */}
      <div className="w-full pb-1.5 sm:pb-2 bg-background">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Teams and Scores */}
          <div className="flex items-center justify-center">
            {/* Team A (left) */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end pr-2 sm:pr-4">
              {teamALogo && (
                <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl overflow-hidden bg-[#f3f4f6] flex items-center justify-center">
                  <Image
                    src={teamALogo}
                    alt={teamAName}
                    width={1024}
                    height={1024}
                    className="object-contain w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
                  />
                </div>
              )}
              <div className="flex flex-col items-start min-w-0">
                <span className="sm:hidden text-xs font-bold text-foreground truncate">
                  {teamAShortName || teamAName}
                </span>
                <span className="hidden sm:block text-sm md:text-base font-bold text-foreground truncate max-w-30 md:max-w-none">
                  {teamAName}
                </span>
                {hasScores ? (
                  teamAScore && teamAScore.trim() ? (
                    (() => {
                      const parsed = parseScore(teamAScore);
                      return (
                        <div className="flex items-baseline gap-1 whitespace-nowrap">
                          <span className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">{parsed.score}</span>
                          {parsed.overs && <span className="text-xs sm:text-sm md:text-base font-normal text-foreground leading-tight">{parsed.overs}</span>}
                        </div>
                      );
                    })()
                  ) : (
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground italic">Yet to bat</span>
                  )
                ) : null}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-12 sm:h-14 md:h-16 bg-foreground/20 shrink-0" />

            {/* Team B (right) */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 pl-2 sm:pl-4">
              <div className="flex flex-col items-start min-w-0">
                <span className="sm:hidden text-xs font-bold text-foreground truncate">
                  {teamBShortName || teamBName}
                </span>
                <span className="hidden sm:block text-sm md:text-base font-bold text-foreground truncate max-w-30 md:max-w-none">
                  {teamBName}
                </span>
                {hasScores ? (
                  teamBScore && teamBScore.trim() ? (
                    (() => {
                      const parsed = parseScore(teamBScore);
                      return (
                        <div className="flex items-baseline gap-1 whitespace-nowrap">
                          <span className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">{parsed.score}</span>
                          {parsed.overs && <span className="text-xs sm:text-sm md:text-base font-normal text-foreground leading-tight">{parsed.overs}</span>}
                        </div>
                      );
                    })()
                  ) : (
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground italic">Yet to bat</span>
                  )
                ) : null}
              </div>
              {teamBLogo && (
                <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl overflow-hidden bg-[#f3f4f6] flex items-center justify-center">
                  <Image
                    src={teamBLogo}
                    alt={teamBName}
                    width={1024}
                    height={1024}
                    className="object-contain w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"
                  />
                </div>
              )}
            </div>
          </div>

          {/* CRR · RRR compact line */}
          {isLive && (currentCRR || currentRRR) && (
            <div className="flex items-center justify-center gap-2 mt-1 text-[10px] sm:text-xs text-muted-foreground">
              {currentCRR && <span>CRR: <span className="font-semibold text-foreground">{currentCRR}</span></span>}
              {currentCRR && currentRRR && <span className="text-muted-foreground/40">{"\u00B7"}</span>}
              {currentRRR && <span>RRR: <span className="font-semibold text-foreground">{currentRRR}</span></span>}
              <SSEBroadcastIcon />
            </div>
          )}
        </div>
      </div>
    </>
  );
}