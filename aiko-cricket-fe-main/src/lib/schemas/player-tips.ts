import { z } from "zod";

export const PlayerTipSchema = z.object({
  scenario: z.string(),
  original_scenario: z.string().optional(),
  original_bet_type: z.string().optional(),
  friendly_bet_type: z.string().optional(),
  summary: z.string().optional(),
  bet_type: z.string().optional(),
  tip_id: z.string().optional(),
  is_live: z.boolean().optional(),
  original_bet_type_live: z.boolean().optional(),
  gpt_call_stats: z
    .object({
      input_tokens: z.number().optional(),
      output_tokens: z.number().optional(),
      cached_tokens: z.number().optional(),
    })
    .optional(),
  updated_at: z.string().optional(),
});

export const PlayerSchema = z.object({
  player_id: z.number(),
  player_name: z.string(),
  tips: z.array(PlayerTipSchema),
});

export const TeamPlayersSchema = z.object({
  team_name: z.string(),
  players: z.array(PlayerSchema),
});

export const PlayerTipsResponseSchema = z.object({
  match_id: z.number(),
  language: z.string(),
  generated_at: z.string().optional(),
  teams: z.array(TeamPlayersSchema),
});

export const PlayerTipsRequestSchema = z.object({
  match_id: z.number(),
  user_id: z.string(),
  language: z.string(),
});

export type PlayerTip = z.infer<typeof PlayerTipSchema>;
export type Player = z.infer<typeof PlayerSchema>;
export type TeamPlayers = z.infer<typeof TeamPlayersSchema>;
export type PlayerTipsResponse = z.infer<typeof PlayerTipsResponseSchema>;
export type PlayerTipsRequest = z.infer<typeof PlayerTipsRequestSchema>;

export default PlayerTipsResponseSchema;
