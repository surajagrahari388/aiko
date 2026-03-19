"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePlayersData } from "@/hooks/use-players-data";
import { usePlayerTips } from "@/hooks/use-player-tips";
import type { PlayerTipsResponse } from "@/lib/schemas/player-tips";
import { prettifyCategoryName } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { TeamToggle } from "./team-toggle";
import { StadiumField } from "./stadium-field";
import { PlayerDetailPanel } from "./player-detail-panel";
import { PlayerInsightsLoading } from "./player-insights-skelton";
import { buildTeamFormation } from "./team-formation";
import { mapPlayingRole, type Player, type TeamFormation } from "./types";
import { Skeleton } from "../ui/skeleton";

interface PlayerInsightsProps {
  matchId: string;
  userId: string;
  subscriptionKey?: string;
}

const PlayerInsights = ({
  matchId,
  userId,
  subscriptionKey,
}: PlayerInsightsProps) => {
  const [selectedTeamIndex, setSelectedTeamIndex] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const { language } = useLanguage();

  const matchIdNumber = useMemo(() => {
    const parsed = Number.parseInt(matchId, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [matchId]);

  const {
    players: playersData,
    isLoading,
    error,
  } = usePlayersData({
    matchId: matchId,
    subscriptionKey,
  });

  const {
    data: playerTipsData,
    isLoading: isTipsLoading,
    error: tipsError,
  } = usePlayerTips({
    match_id: matchIdNumber,
    user_id: userId,
    language,
  });

  const teams = useMemo(() => playersData?.teams ?? [], [playersData]);
  const currentTeam = useMemo(() => teams[selectedTeamIndex], [teams, selectedTeamIndex]);

  type PlayerTip = PlayerTipsResponse["teams"][number]["players"][number];
  type TipEntry = PlayerTip["tips"][number];

  const playerTipsLookup = useMemo<Map<number, PlayerTip>>(() => {
    if (!playerTipsData) return new Map<number, PlayerTip>();
    const map = new Map<number, PlayerTip>();
    playerTipsData.teams.forEach((team) => {
      team.players.forEach((player) => {
        const id = Number(player.player_id);
        if (Number.isFinite(id)) {
          map.set(id, player);
        }
      });
    });
    return map;
  }, [playerTipsData]);

  const selectedPlayerTips = useMemo<TipEntry[]>(() => {
    if (!selectedPlayer) return [];
    const selectedPlayerId = Number(selectedPlayer.player_id);
    if (!Number.isFinite(selectedPlayerId)) return [];
    const playerWithTips = playerTipsLookup.get(selectedPlayerId);
    return playerWithTips ? playerWithTips.tips.slice(0, 3) : [];
  }, [playerTipsLookup, selectedPlayer]);

  const currentFormation: TeamFormation | null = useMemo(() => {
    if (!currentTeam) return null;
    return buildTeamFormation(currentTeam);
  }, [currentTeam]);

  // Set default selected player to the first player of the current team
  useEffect(() => {
    if (currentTeam?.squads?.length) {
      setSelectedPlayer((prev) => {
        if (prev && currentTeam.squads.some((player) => player.player_id === prev.player_id)) {
          return prev;
        }

        const firstPlayer = currentTeam.squads[0];
        return {
          player_id: firstPlayer.player_id,
          full_name: firstPlayer.full_name,
          playing_role: mapPlayingRole(firstPlayer.playing_role || "Player"),
          team_name: currentTeam.name,
          player_image: currentTeam.logo_url || currentTeam.thumb_url,
        };
      });
    } else {
      setSelectedPlayer(null);
    }
  }, [currentTeam]);

  const renderPlayerTips = useCallback(() => {
    if (isTipsLoading) {
      return (
        <div className="flex-1 space-y-2 sm:space-y-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-20 sm:h-24 md:h-28 w-full rounded-lg" />
          ))}
        </div>
      );
    }

    if (tipsError) {
      return (
        <div className="flex-1 flex items-center justify-center text-center text-sm text-muted-foreground p-6">
          Unable to load player tips right now.
        </div>
      );
    }

    if (!selectedPlayerTips.length) {
      return (
        <div className="flex-1 flex items-center justify-center text-center text-sm text-muted-foreground p-6">
          No insights available for this player yet.
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 sm:space-y-3">
          {selectedPlayerTips.map((tip) => (
            <div key={tip.tip_id} className="bg-muted rounded-lg p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-1.5 sm:mb-2">
                {prettifyCategoryName(tip.scenario)}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{tip.summary}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }, [isTipsLoading, tipsError, selectedPlayerTips]);

  const handleTeamSelect = useCallback((index: number) => {
    setSelectedTeamIndex(index);
    setSelectedPlayer(null);
  }, []);

  if (isLoading) {
    return <PlayerInsightsLoading />;
  }

  if (error || !playersData?.teams) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Unable to load player insights</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <TeamToggle teams={teams} selectedTeamIndex={selectedTeamIndex} onSelectTeam={handleTeamSelect} />

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-8 px-3 sm:px-4 md:px-6 mb-6 sm:mb-8 md:mb-10">
        {currentFormation && (
          <StadiumField
            formation={currentFormation}
            selectedPlayer={selectedPlayer}
            onSelectPlayer={setSelectedPlayer}
          />
        )}
        <PlayerDetailPanel
          player={selectedPlayer}
          isTipsLoading={isTipsLoading}
          tipsError={tipsError}
          renderPlayerTips={renderPlayerTips}
        />
      </div>
    </div>
  );
};

export default PlayerInsights;
