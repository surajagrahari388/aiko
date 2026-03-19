export interface Player {
  player_id: string;
  full_name: string;
  playing_role: string;
  team_name: string;
  player_image?: string;
}

export interface TeamFormation {
  name: string;
  players: Array<{
    position: { top: string; left: string; name: string };
    player: Player;
  }>;
}

const PLAYING_ROLE_MAP: Record<string, string> = {
  bat: "Batsman",
  batsman: "Batsman",
  batter: "Batsman",
  bowl: "Bowler",
  bowler: "Bowler",
  all: "All Rounder",
  allrounder: "All Rounder",
  "all-rounder": "All Rounder",
  wk: "Wicketkeeper",
  wicketkeeper: "Wicketkeeper",
  wkbat: "Wicketkeeper",
};

export const mapPlayingRole = (role: string): string => {
  if (!role) return "Player";
  const normalizedRole = role.toLowerCase().trim();
  return PLAYING_ROLE_MAP[normalizedRole] || role;
};
