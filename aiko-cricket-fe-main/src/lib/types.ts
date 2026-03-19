import { z } from "zod";

/**
 * ==========================================
 * CORE SPORTS DATA TYPES
 * ==========================================
 * Types related to cricket matches, teams, players, and competitions
 */

// Player related schemas and types
export const PlayerSchema = z.object({
  player_id: z.string(),
  full_name: z.string(),
  nationality: z.string(),
  birthplace: z.string(),
  birthdate: z.string(),
  playing_role: z.string(),
  batting_style: z.string(),
  bowling_style: z.string(),
  player_credits: z.number().optional(),
  player_points: z.number().optional(),
});

export type Player = z.infer<typeof PlayerSchema>;

export const PlayerDataSchema = z.object({
  player_id: z.string(),
  full_name: z.string(),
  nationality: z.string(),
  birthplace: z.string(),
  birthdate: z.string(),
  playing_role: z.string(),
  batting_style: z.string(),
  bowling_style: z.string(),
  player_credits: z.number().optional(),
  player_points: z.number().optional(),
});

export type PlayerData = z.infer<typeof PlayerDataSchema>;

export const PlayerTeamSchema = z.object({
  team_id: z.string(),
  team_name: z.string(),
  team_thumb_url: z.string(),
  player_id: z.string(),
  full_name: z.string(),
  nationality: z.string(),
  birthplace: z.string(),
  birthdate: z.string(),
  playing_role: z.string(),
  batting_style: z.string(),
  bowling_style: z.string(),
  player_credits: z.number().optional(),
  player_points: z.number().optional(),
});

export type PlayerTeam = z.infer<typeof PlayerTeamSchema>;

// Team related schemas and types
export const TeamSchema = z.object({
  cid: z.string(),
  team_id: z.string(),
  name: z.string(),
  short_name: z.string(),
  logo_url: z.string(),
  thumb_url: z.string(),
  last_5_matches: z.array(z.number()).optional(),
  squads: z.array(z.any()).optional(), // Can be more specific if needed
  scores_full: z.string().optional(),
  scores: z.string().optional(),
  overs: z.string().optional(),
});

export type Team = z.infer<typeof TeamSchema>;

// Competition schema based on actual API response
export const CompetitionSchema = z.object({
  status: z.string(),
  type: z.string(),
  cid: z.string(),
  title: z.string(),
  abbr: z.string(),
  category: z.string(),
  match_format: z.string(),
  season: z.string(),
  date_start: z.string(),
  date_end: z.string(),
  country: z.string(),
  total_matches: z.number(),
  total_rounds: z.number(),
  total_teams: z.number(),
  player_of_the_series: z.string().nullable(),
  updated_at: z.string(),
});

export type Competition = z.infer<typeof CompetitionSchema>;

// Contest schema based on actual API response
export const ContestSchema = z.object({
  contest_id: z.string(),
  prize_pool: z.number(),
  entry_fee: z.number(),
  max_entries: z.number(),
  max_entries_per_user: z.number(),
  max_prize: z.number(),
  current_spots: z.number(),
  max_spots: z.number(),
});

export type Contest = z.infer<typeof ContestSchema>;

// Match schema based on actual API response
export const MatchSchema = z.object({
  competitions: CompetitionSchema,
  teams: z.array(TeamSchema),
  date_start_ist: z.string(),
  date_start: z.string(),
  date_end: z.string(),
  date_end_ist: z.string(),
  match_id: z.string(),
  format_str: z.string(),
  title: z.string(),
  short_title: z.string(),
  subtitle: z.string(),
  status_str: z.string(),
  status_note: z.string().nullable(),
  game_state_str: z.string(),
  venues: z.object({
    venue_id: z.string(),
    name: z.string(),
    location: z.string(),
    country: z.string(),
    timezone: z.string(),
  }),
  umpires: z.string(),
  referee: z.string(),
  result: z.string().nullable(),
  result_type: z.number().optional(),
  win_margin: z.string().optional(),
  winning_team_id: z.number().optional(),
  weather: z.string(),
  weather_desc: z.string(),
  wind_speed: z.number(),
  clouds: z.number(),
  toss_winner: z.string(),
  contests: z.array(z.any()),
  pitch_type: z.string(),
  pitch_batting: z.string(),
  pitch_bowling_pace: z.string(),
  pitch_bowling_spin: z.string(),
  updated_at: z.string(),
  is_lineup_out: z.boolean(),
});

export type Match = z.infer<typeof MatchSchema>;

// Sports matches schema based on actual API response
export const SportsMatchesSchema = z.object({
  sports: z.string(),
  matches: z.array(MatchSchema),
  tenantId: z.string().optional(),
});

export type SportsMatches = z.infer<typeof SportsMatchesSchema>;

// Single match response schema for individual match pages
export const SingleMatchResponseSchema = z.object({
  sports: z.string(),
  match: MatchSchema,
});

export type SingleMatchResponse = z.infer<typeof SingleMatchResponseSchema>;

// ==========================================
// DETAILED MATCH DATA TYPES (Match ID Detail Route)
// ==========================================

// Ball-by-ball commentary schema
export const RecentBallSchema = z.object({
  event_id: z.string(),
  over: z.number(),
  ball: z.number(),
  score: z.union([z.number(), z.string()]),
  commentary: z.string(),
  run: z.number(),
  bat_run: z.number(),
  noball_run: z.number(),
  wide_run: z.number(),
  bye_run: z.number(),
  legbye_run: z.number(),
  noball: z.boolean(),
  wideball: z.boolean(),
  six: z.boolean(),
  four: z.boolean(),
  batsman_id: z.string(),
  bowler_id: z.string(),
  non_striker_batsman_id: z.string(),
  event: z.string(),
  noball_dismissal: z.boolean(),
});

export type RecentBall = z.infer<typeof RecentBallSchema>;

// Batsman stats schema
export const BatsmanSchema = z.object({
  player_id: z.string(),
  name: z.string(),
  batting: z.boolean(),
  role: z.string(),
  role_str: z.string().nullable(),
  runs: z.number(),
  balls_faced: z.number(),
  fours: z.number(),
  sixes: z.number(),
  run0: z.number(),
  run1: z.number(),
  run2: z.number(),
  run3: z.number(),
  run5: z.number(),
  how_out: z.string(),
  dismissal: z.string(),
  strike_rate: z.number(),
});

export type Batsman = z.infer<typeof BatsmanSchema>;

// Bowler stats schema
export const BowlerSchema = z.object({
  player_id: z.string(),
  name: z.string(),
  bowling: z.boolean(),
  overs: z.number(),
  maidens: z.number(),
  runs_conceded: z.number(),
  wickets: z.number(),
  noballs: z.number(),
  wides: z.number(),
  econ: z.number(),
});

export type Bowler = z.infer<typeof BowlerSchema>;

// Fielder stats schema
export const FielderSchema = z.object({
  player_id: z.string(),
  name: z.string(),
  catches: z.number(),
  runout_thrower: z.string().nullable(),
  runout_catcher: z.string().nullable(),
  runout_direct_hit: z.string().nullable(),
  stumping: z.number(),
  is_substitute: z.boolean(),
});

export type Fielder = z.infer<typeof FielderSchema>;

// Innings schema
export const InningSchema = z.object({
  inning_id: z.string(),
  number: z.number(),
  name: z.string(),
  short_name: z.string(),
  status: z.number(),
  is_super_over: z.boolean(),
  result: z.number(),
  scores: z.string(),
  scores_full: z.string(),
  batting_team_id: z.string(),
  fielding_team_id: z.string(),
  max_over: z.string(),
  target: z.string().nullable(),
  batsmen: z.array(BatsmanSchema),
  bowlers: z.array(BowlerSchema),
  fielders: z.array(FielderSchema),
  recent_balls: z.array(RecentBallSchema),
});

export type Inning = z.infer<typeof InningSchema>;

// Updated competition schema for detailed match
export const DetailedCompetitionSchema = z.object({
  cid: z.string(),
  title: z.string(),
  abbr: z.string(),
  updated_at: z.string(),
  season: z.string(),
  category: z.string(),
});

export type DetailedCompetition = z.infer<typeof DetailedCompetitionSchema>;

// Updated team schema for detailed match
export const DetailedTeamSchema = z.object({
  team_id: z.string(),
  name: z.string(),
  short_name: z.string(),
  cid: z.string(),
  logo_url: z.string(),
  thumb_url: z.string(),
  scores_full: z.string().optional(),
});

export type DetailedTeam = z.infer<typeof DetailedTeamSchema>;

// Updated venues schema for detailed match
export const DetailedVenuesSchema = z.object({
  venue_id: z.string(),
  name: z.string(),
  location: z.string(),
  state: z.string().nullable(),
  country: z.string(),
  timezone: z.string(),
});

export type DetailedVenues = z.infer<typeof DetailedVenuesSchema>;

// Contest schema for detailed match
export const DetailedContestSchema = z.object({
  contest_id: z.string(),
  prize_pool: z.number(),
  entry_fee: z.number(),
  max_entries: z.number(),
  max_entries_per_user: z.number(),
  max_prize: z.number(),
  current_spots: z.number(),
  max_spots: z.number(),
});

export type DetailedContest = z.infer<typeof DetailedContestSchema>;

// Detailed match schema
export const DetailedMatchSchema = z.object({
  competitions: DetailedCompetitionSchema,
  teams: z.array(DetailedTeamSchema),
  date_start_ist: z.string(),
  date_start: z.string(),
  match_id: z.string(),
  format_str: z.string(),
  title: z.string(),
  short_title: z.string(),
  subtitle: z.string(),
  status_str: z.string(),
  status_note: z.string(),
  game_state_str: z.string(),
  result: z.string().nullable(),
  toss_winner: z.string(),
  contests: z.array(DetailedContestSchema),
  pitch_type: z.string(),
  pitch_batting: z.string(),
  pitch_bowling_pace: z.string(),
  pitch_bowling_spin: z.string(),
  venues: DetailedVenuesSchema,
  weather: z.string(),
  weather_desc: z.string(),
  wind_speed: z.number(),
  clouds: z.number(),
  updated_at: z.string(),
  is_lineup_out: z.boolean(),
  domestic: z.string(),
  oddstype: z.string(),
  odds_id: z.string(),
  session_odds_available: z.boolean(),
  innings: z.array(InningSchema),
});

export type DetailedMatch = z.infer<typeof DetailedMatchSchema>;

// Detailed match response schema for match ID detail route
export const DetailedMatchResponseSchema = z.object({
  sports: z.string(),
  match: DetailedMatchSchema,
});

export type DetailedMatchResponse = z.infer<typeof DetailedMatchResponseSchema>;

// ==========================================
// SSE MATCH PUSH TYPES (match_push_obj)
// ==========================================

export interface MatchPushInning {
  inning_id: number;
  is_super_over: boolean;
  batting_team_id: number;
  fielding_team_id: number;
  scores_full: string;
  recent_balls: RecentBall[];
}

export interface MatchPushTeam {
  team_id: number;
  name: string;
  short_name: string;
}

export interface MatchPushMatch {
  match_id: string;
  title: string;
  short_title: string;
  format_str: string;
  status_str: string;
  status_note: string;
  game_state_str: string;
  teams: MatchPushTeam[];
  innings: MatchPushInning[];
  toss: { winner: number; decision: string };
  weather: string;
  pitch_type: string;
  date_start_ist: string;
}

export interface MatchPushData {
  sports: string;
  match: MatchPushMatch;
}

// ==========================================
// TIPS DATA TYPES
// ==========================================

export interface TipOdds {
  name?: string;
  odds?: string;
  value?: string;
}

export interface TipData {
  tip_id: string;
  scenario: string;
  summary: string;
  bet_type: string;
  original_bet_type?: string;
  original_scenario?: string;
  original_bet_type_status?: boolean;
  friendly_bet_type?: string;
  filter_category?: string[];
  is_live?: boolean;
  original_bet_type_live?: boolean;
  gpt_call_stats?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cached_tokens: number;
  };
  updated_at?: string;
  updated_at_score?: string | null;
  score_snapshot?: string;
  odds?: TipOdds;
  tenant_id?: string;
  tenant_bet_type?: string;
  is_match_pulse?: boolean;
}

export interface TipsApiResponse {
  summary: TipData[];
  user_id?: string;
  language?: string;
  team1_full_name?: string;
  team2_full_name?: string;
  updated_at?: string;
}

export const ReleaseSchema = z.object({
  id: z.number(),
  frontend: z.string(),
  ai: z.string(),
  media: z.string(),
  personalisation: z.string(),
  sql_rag: z.string(),
  caching_service: z.string(),
  conversation_ms: z.string(),
  description: z.string(),
});

export type Release = z.infer<typeof ReleaseSchema>;

// Match Summary Data Schema
export const MatchSummaryDataSchema = z.object({
  title: z.string(),
  analysis: z.array(
    z.object({
      type: z.string(),
      details: z.string(),
      tip_id: z.string(),
    })
  ),
  total_summary: z.string(),
  user_id: z.string(),
  language: z.string(),
  match_id: z.number(),
  tip_id: z.string(),
  gpt_call_stats: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
    cached_tokens: z.number(),
  }),
});

export type MatchSummaryData = z.infer<typeof MatchSummaryDataSchema>;

// Odds Response Schema (based on usage in use-match-summary.ts)
export const OddsResponseSchema = z.object({
  response: z.object({
    match_info: z.object({
      match_id: z.string().optional(),
      title: z.string().optional(),
      date_start_ist: z.string().optional(),
      status_str: z.string().optional(),
      teama: z.object({
        name: z.string(),
      }).optional(),
      teamb: z.object({
        name: z.string(),
      }).optional(),
      pitch: z.object({
        pitch_condition: z.string(),
      }).optional(),
      venue: z.object({
        name: z.string(),
        country: z.string().optional(),
        location: z.string().optional(),
      }).optional(),
      format_str: z.string().optional(),
      competition: z.object({
        abbr: z.string().optional(),
        title: z.string().optional(),
        season: z.string().optional(),
      }).optional(),
      weather: z.object({
        weather: z.string(),
      }).optional(),
    }),
  }),
});

export type OddsResponse = z.infer<typeof OddsResponseSchema>;

export interface StarredQuestion {
  id: string;
  conversation_id: string;
  original_question: string;
  message_id: string;
  created_at: string;
  updated_at: string;
}

export interface StarredQuestionsResponse {
  status: string;
  message: string;
  user_id: string;
  count: number;
  data: StarredQuestion[];
}

export const PersonalizedTipSchema = z.object({
  conversation_id: z.string(),
  match_id: z.string(),
  message_id: z.string(),
  question: z.string(),
  user_id: z.string(),
});

export type PersonalizedTip = z.infer<typeof PersonalizedTipSchema>;

export const UnstarQuestionSchema = z.object({
  conversation_id: z.string(),
  match_id: z.string(),
  message_id: z.string(),
  user_id: z.string(),
});

export type UnstarQuestion = z.infer<typeof UnstarQuestionSchema>;

// Favourite Tips API Types
export const GetFavouriteTipsSchema = z.object({
  user_id: z.string(),
});

export type GetFavouriteTips = z.infer<typeof GetFavouriteTipsSchema>;

// Favourite Tips types
export interface FavouriteTipRecord {
  id: string;
  conversation_id: string;
  original_question: string;
  message_id: string;
  created_at: string;
  updated_at: string;
}

export interface FavouriteTipWithQna extends FavouriteTipRecord {
  qna_processed?: boolean;
  qna_messages?: import("./schemas/qna").Message[];
  qna_loading?: boolean;
  qna_error?: string;
}

export interface FavouriteTipsResponse {
  status: string;
  message: string;
  user_id: string;
  count: number;
  data: FavouriteTipRecord[];
}