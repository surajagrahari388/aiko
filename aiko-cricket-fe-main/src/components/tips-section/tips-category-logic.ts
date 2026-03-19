import { SportsMatches } from "@/lib/types";

export type TipSummary = {
  tip_id: string;
  scenario: string;
  original_scenario?: string;
  summary: string;
  bet_type: string;
  friendly_bet_type?: string;
  filter_category?: string[];
  is_live?: boolean;
  original_bet_type_live?: boolean;
  updated_at?: string;
  updated_at_score?: string | null;
  score_snapshot?: string;
  tenant_id?: string;
  tenant_bet_type?: string;
  is_match_pulse?: boolean;
};

export const extractFilterCategories = (summary: TipSummary[]): string[] => {
  return Array.from(
    new Set(
      summary
        .flatMap((item) => item.filter_category || [])
        .filter(
          (cat) => cat && cat.toLowerCase() !== "all" && cat.toLowerCase() !== "hot" && cat.toLowerCase() !== "match_pulse" && cat.trim() !== ""
        )
    )
  ).sort();
};

export const hasLiveTips = (summary: TipSummary[]): boolean => {
  return summary.some((tip) => tip.is_live && tip.original_bet_type_live);
};

export const filterTipsByCategory = (
  summary: TipSummary[],
  selectedCategory: string
): TipSummary[] => {
  if (selectedCategory === "live") {
    return summary.filter((tip) => tip.is_live && tip.original_bet_type_live);
  }

  if (selectedCategory === "all") {
    // All category excludes live tips and match pulse tips (match pulse tips are shown in Hot Insights carousel only)
    return summary.filter((tip) => !(tip.is_live && tip.original_bet_type_live) && !tip.is_match_pulse);
  }

  return summary.filter((tip) =>
    !tip.is_match_pulse && tip.filter_category?.includes(selectedCategory)
  );
};

export const groupTips = (
  tips: TipSummary[],
  showFriendlyBetMapping?: boolean
): Record<string, TipSummary[]> => {
  return tips.reduce<Record<string, TipSummary[]>>((acc, item) => {
    const key =
      showFriendlyBetMapping && item.friendly_bet_type
        ? item.friendly_bet_type
        : item.bet_type || "GENERAL";

    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
};

export type QnaConfig = {
  api_url: string;
  apim_key: string;
  user_id: string;
  match_stats: SportsMatches;
  squads: {
    player_id: string;
    full_name: string;
    playing_role: string;
    team_name: string;
  }[];
  conversation_id: string;
};
