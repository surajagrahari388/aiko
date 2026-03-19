"use client";

import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { useDesignVariant } from "@/hooks/use-design-variant";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { signOut, useSession } from "next-auth/react";
import type { SingleMatchResponse, DetailedMatchResponse } from "@/lib/types";
import { formatDateWithTimezone } from "@/lib/utils";
import MatchDesignA from "@/components/navbar/match-design-a";
import MatchDesignB from "@/components/navbar/match-design-b";
import MatchDesignC from "@/components/navbar/match-design-c";
import BallByBall from "@/components/navbar/ball-by-ball";
import GoBack from "@/components/layout/go-back";

interface NavbarProps {
  showAllLanguages?: boolean;
  AUTH_AUTH0_ID: string;
  AUTH0_ISSUER: string;
  matchData?: SingleMatchResponse;
  detailedMatchData?: DetailedMatchResponse;
}

export default function NavbarMatchSection({
  AUTH_AUTH0_ID,
  AUTH0_ISSUER,
  matchData,
  detailedMatchData,
}: NavbarProps) {
  const { data: session, status, update } = useSession();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { variant } = useDesignVariant("match-navbar");

  const user = session?.user;
  const userLoading = status === "loading";

  // Shared match data resolution
  const match = detailedMatchData?.match || matchData?.match;
  const teams = match?.teams || [];
  const team1 = teams[0];
  const team2 = teams[1];
  const statusLower = (match?.status_str || "").toLowerCase();
  const isLive =
    statusLower === "live" ||
    (match?.status_note || "").toLowerCase().includes("live");

  const getScore = (teamIdx: number) => {
    if (!isLive) return undefined;

    if (detailedMatchData?.match?.innings) {
      const currentInning = detailedMatchData.match.innings.find(
        (inning) => inning.batting_team_id === teams[teamIdx]?.team_id && inning.status === 3
      );
      if (currentInning?.scores_full) {
        return currentInning.scores_full;
      }
    }

    const score = teams[teamIdx]?.scores_full;
    if (!score) return undefined;
    // Treat 0/0 as "yet to bat"
    if (/^0\/0/.test(score.trim())) return undefined;
    return score;
  };

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

  const lastBall = useMemo(() => {
    if (!detailedMatchData?.match?.innings) return null;
    const currentInning = detailedMatchData.match.innings.find(
      (inning) => inning.status === 3
    );
    if (!currentInning?.recent_balls?.length) return null;
    // Filter to actual ball/wicket events (exclude overend summaries which have a different shape)
    const ballEvents = currentInning.recent_balls.filter(
      (b) => b.event === "ball" || b.event === "wicket"
    );
    return ballEvents.length > 0 ? ballEvents[ballEvents.length - 1] : null;
  }, [detailedMatchData]);

  const lastBallLabel = useMemo(() => {
    if (!lastBall) return "";
    if (lastBall.event === "wicket") return "W";
    if (lastBall.six) return "6";
    if (lastBall.four) return "4";
    if (lastBall.wideball || lastBall.wide_run > 0) return "WD";
    if (lastBall.noball || lastBall.noball_run > 0) return "NB";
    return String(lastBall.run);
  }, [lastBall]);

  const lastBallBadgeColor = useMemo(() => {
    if (!lastBall) return "bg-green-500 hover:bg-green-500";
    if (lastBall.event === "wicket") return "bg-red-500 hover:bg-red-500";
    if (lastBall.six) return "bg-purple-500 hover:bg-purple-500";
    if (lastBall.four) return "bg-blue-500 hover:bg-blue-500";
    if (lastBall.wideball || lastBall.wide_run > 0 || lastBall.noball || lastBall.noball_run > 0)
      return "bg-orange-500 hover:bg-orange-500";
    if (lastBall.run === 0) return "bg-gray-400 hover:bg-gray-400";
    return "bg-green-500 hover:bg-green-500";
  }, [lastBall]);

  const lastBallType = useMemo(() => {
    if (!lastBall) return "dot";
    if (lastBall.event === "wicket") return "wicket";
    const isWide = lastBall.wideball || lastBall.wide_run > 0;
    const isNoBall = lastBall.noball || lastBall.noball_run > 0;
    if (lastBall.six) return isWide ? "wide+six" : isNoBall ? "noball+six" : "six";
    if (lastBall.four) return isWide ? "wide+four" : isNoBall ? "noball+four" : "four";
    if (isWide) return "wide";
    if (isNoBall) return "noball";
    if (lastBall.run === 0) return "dot";
    return "run";
  }, [lastBall]);

  const handleLogout = () => {
    signOut({ redirect: false }).then(() => {
      update();
      window.location.href = `${AUTH0_ISSUER}v2/logout?client_id=${AUTH_AUTH0_ID}&returnTo=${encodeURIComponent(
        window.location.origin
      )}`;
    });
  };

  // Shared props for both design variants
  const designProps = {
    teamAName: team1?.name || team1?.short_name || "TBA",
    teamAShortName: team1?.short_name,
    teamALogo: team1?.thumb_url || team1?.logo_url || undefined,
    teamAScore: getScore(0) || "",
    teamAId: team1?.team_id,
    teamBName: team2?.name || team2?.short_name || "TBA",
    teamBShortName: team2?.short_name,
    teamBLogo: team2?.thumb_url || team2?.logo_url || undefined,
    teamBScore: getScore(1) || "",
    teamBId: team2?.team_id,
    isLive,
    timeStr,
    dateStr,
    lastBallLabel,
    lastBallBadgeColor,
    lastBallEventId: lastBall?.event_id || "",
    lastBallType,
    statusNote: match?.status_note,
    gameStateStr: match?.game_state_str,
    detailedMatchData,
  };

  return (
    <>
    <nav className="text-foreground shrink-0">
      {/* Design-specific navbar + score section */}
      {match ? (
        variant === "A" ? (
          <MatchDesignA {...designProps} />
        ) : variant === "C" ? (
          <MatchDesignC {...designProps} />
        ) : (
          <MatchDesignB {...designProps} />
        )
      ) : (
        <div className="container mx-auto md:px-2 sm:px-6 lg:px-6 px-3">
          <div className="flex items-center h-11">
            <GoBack />
          </div>
        </div>
      )}

      {/* Status Note Strip (Design B only — A has it in top bar, C has it inline) */}
      {variant === "B" && match?.status_note && (
        <div className="mx-3 sm:mx-4 mt-1.5 rounded-lg bg-muted/30 border border-border/20">
          <p className="text-center text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground py-1 px-3">
            {match.status_note}
          </p>
        </div>
      )}

      {/* Ball by Ball Section */}
      {isLive && detailedMatchData && (
        <BallByBall matchData={detailedMatchData} />
      )}

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out from Aiko Cricket?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsLogoutDialogOpen(false);
                handleLogout();
              }}
              className="flex-1 sm:flex-none"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
    </>
  );
}
