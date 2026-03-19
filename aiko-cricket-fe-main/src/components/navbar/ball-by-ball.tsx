"use client";

import React, { useMemo, useLayoutEffect, useRef } from "react";
import type { DetailedMatchResponse, RecentBall } from "@/lib/types";

interface BallByBallProps {
  matchData?: DetailedMatchResponse;
}

interface OverData {
  overNumber: number;
  balls: Array<{
    ball: number;
    run: number;
    isWicket: boolean;
    isBoundary: boolean;
    isSix: boolean;
    isWide: boolean;
    isNoBall: boolean;
  }>;
  totalRuns: number;
}

export default function BallByBall({ matchData }: BallByBallProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevCurrentOverRef = useRef<number | null>(null);
  
  const match = matchData?.match;
  const currentInning = match?.innings?.find(
    (inning) => inning.status === 3 // Current/ongoing inning
  );

  const recentOvers = useMemo(() => {
    if (!currentInning?.recent_balls) return [];

    // Group balls by over
    const overMap = new Map<number, RecentBall[]>();
    
    currentInning.recent_balls
      .filter((ball) => ball.event === "ball" || ball.event === "wicket" || ball.wideball || ball.wide_run > 0 || ball.noball || ball.noball_run > 0)
      .forEach((ball) => {
        const overNum = Number(ball.over);
        if (!overMap.has(overNum)) {
          overMap.set(overNum, []);
        }
        overMap.get(overNum)!.push(ball);
      });

    // Convert to OverData and sort by over number (descending for most recent first)
    const overs: OverData[] = Array.from(overMap.entries())
      .sort(([a], [b]) => a - b) // Oldest first, most recent on the right
      .slice(-5) // Show last 5 overs
      .map(([overNumber, balls]) => {
        const sortedBalls = balls.sort((a, b) => a.ball - b.ball);
        const totalRuns = sortedBalls.reduce((sum, ball) => sum + ball.run, 0);
        
        return {
          overNumber,
          balls: sortedBalls.map((ball) => ({
            ball: ball.ball,
            run: ball.run,
            isWicket: ball.event === "wicket" || String(ball.score).toLowerCase() === "w",
            isBoundary: ball.four,
            isSix: ball.six,
            isWide: ball.wideball || ball.wide_run > 0,
            isNoBall: ball.noball || ball.noball_run > 0,
          })),
          totalRuns,
        };
      });
      // Oldest first, newest on the right

    return overs;
  }, [
    currentInning?.recent_balls, 
    currentInning?.inning_id,
    match?.match_id,
    match?.updated_at
  ]);

  // Track total ball count to detect new ball events within the same over
  const totalBallCount = recentOvers.reduce((sum, over) => sum + over.balls.length, 0);

  // Auto-scroll to the right (newest over) on mount and when balls change
  // useLayoutEffect prevents visible flash — runs before browser paint
  useLayoutEffect(() => {
    if (!scrollContainerRef.current) return;
    // Always snap to end instantly to prevent layout shift
    scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    prevCurrentOverRef.current = totalBallCount;
  }, [totalBallCount]);

  if (!match || !currentInning || recentOvers.length === 0) {
    return null;
  }

  const getBallDisplay = (ball: OverData["balls"][0]) => {
    if (ball.isWicket) return "W";
    const extra = ball.isWide ? "WD" : ball.isNoBall ? "NB" : "";
    if (extra && (ball.isBoundary || ball.isSix)) return `${extra}+${ball.run}`;
    if (extra) return extra;
    return ball.run.toString();
  };

  const getBallStyle = (ball: OverData["balls"][0]) => {
    if (ball.isWicket) {
      return "bg-red-500 text-white border-red-500";
    }
    if (ball.isSix) {
      return "bg-purple-500 text-white border-purple-500";
    }
    if (ball.isBoundary) {
      return "bg-green-500 text-white border-green-500";
    }
    if (ball.isWide || ball.isNoBall) {
      return "bg-orange-500 text-white border-orange-500";
    }
    return "bg-background text-foreground border-border";
  };

  return (
    <div className="mx-3 sm:mx-4 mt-1.5 mb-1.5 rounded-lg bg-muted/30 overflow-hidden">
      <div className="px-2 sm:px-3">
        <div className="py-1 sm:py-1.5">
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide overscroll-x-contain touch-pan-x"
          >
            <div className={`flex items-center gap-2 w-fit ${recentOvers.length === 1 ? "mx-auto" : "ml-auto"}`}>
            {recentOvers.map((over, index) => (
              <div
                key={over.overNumber}
                className="flex items-center gap-1.5 shrink-0 rounded-lg px-2 py-1.5 bg-background/60 border border-foreground/15"
              >
                {/* Over label */}
                <div className="flex items-center gap-1 pr-2 border-r border-border/30">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Ov
                  </span>
                  <span className={`text-sm font-bold text-foreground ${index === recentOvers.length - 1 ? 'text-green-600' : ''}`}>
                    {over.overNumber + 1}
                  </span>
                </div>

                {/* Individual balls */}
                <div className="flex items-center gap-1">
                  {over.balls.map((ball, ballIndex) => (
                    <div
                      key={ballIndex}
                      className={`
                        min-w-6 h-6 px-1 rounded-full border flex items-center justify-center
                        text-[10px] font-bold transition-colors whitespace-nowrap
                        ${getBallStyle(ball)}
                      `}
                    >
                      {getBallDisplay(ball)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}