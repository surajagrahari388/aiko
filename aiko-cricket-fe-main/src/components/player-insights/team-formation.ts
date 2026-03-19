import type { Player, TeamFormation } from "./types";
import { mapPlayingRole } from "./types";

interface TeamInput {
  squads: Array<{ player_id: string; full_name: string; playing_role: string }>;
  name: string;
  logo_url?: string;
  thumb_url?: string;
}

const createPositionLabel = (role: string) => {
  const normalizedRole = role.toLowerCase();

  if (normalizedRole.includes("batter") || normalizedRole.includes("batsman")) return "Batter";
  if (normalizedRole.includes("keeper") || normalizedRole.includes("wicket")) return "Keeper";
  if (normalizedRole.includes("bowl") || normalizedRole.includes("pacer") || normalizedRole.includes("fast")) return "Bowler";
  if (normalizedRole.includes("spin")) return "Spinner";
  if (normalizedRole.includes("all-rounder") || normalizedRole.includes("allrounder")) return "All-rounder";

  return "Fielder";
};

export const buildTeamFormation = (team: TeamInput): TeamFormation => {
  const squad = team.squads || [];
  const playersToDisplay = squad.slice(0, 11);

  const centerX = 50;
  const centerY = 50;
  const radius = 35;
  const angleSlice = playersToDisplay.length ? 360 / playersToDisplay.length : 0;

  const players = playersToDisplay.map((player, index) => {
    const angle = (angleSlice * index - 90) * (Math.PI / 180);
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    return {
      position: {
        top: `${y}%`,
        left: `${x}%`,
        name: createPositionLabel(player.playing_role || ""),
      },
      player: {
        player_id: player.player_id,
        full_name: player.full_name,
        playing_role: mapPlayingRole(player.playing_role || "Player"),
        team_name: team.name,
        player_image: team.logo_url || team.thumb_url,
      } satisfies Player,
    };
  });

  return {
    name: team.name,
    players,
  };
};
