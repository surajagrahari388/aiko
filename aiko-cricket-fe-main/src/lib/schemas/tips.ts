import { z } from "zod";

export const GptCallStatsSchema = z.object({
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  total_tokens: z.number(),
  cached_tokens: z.number(),
});

export const TipItemSchema = z.object({
  scenario: z.string(),
  summary: z.string(),
  bet_type: z.string(),
  tip_id: z.string(),
  original_bet_type: z.string().optional(),
  original_scenario: z.string().optional(),
  original_bet_type_status: z.boolean().optional(),
  friendly_bet_type: z.string().optional(),
  is_live: z.boolean().optional(),
  filter_category: z.array(z.string()).optional(),
  original_bet_type_live: z.boolean().optional(),
  gpt_call_stats: GptCallStatsSchema.optional(),
  updated_at: z.string().optional(),
});

export const TipsResponseSchema = z.object({
  summary: z.array(TipItemSchema),
  user_id: z.string().optional(),
  language: z.string().optional(),
  team1_full_name: z.string().optional(),
  team2_full_name: z.string().optional(),
  updated_at: z.string().optional(),
});

export type GptCallStats = z.infer<typeof GptCallStatsSchema>;
export type TipItem = z.infer<typeof TipItemSchema>;
export type TipsResponse = z.infer<typeof TipsResponseSchema>;

export default TipsResponseSchema;
