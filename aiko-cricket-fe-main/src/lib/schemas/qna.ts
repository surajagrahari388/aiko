import { z } from "zod";

// Schema for individual feedback items
export const FeedbackItemSchema = z.object({
  id: z.string(),
  type: z.string(), // "upvote", "downvote", "custom", etc.
  title: z.string(),
  description: z.string(),
  createdAt: z.string(),
});

export type FeedbackItem = z.infer<typeof FeedbackItemSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  role: z.union([
    z.literal("user"),
    z.literal("assistant"),
    z.literal("system"),
    z.literal("function"),
    z.literal("data"),
    z.literal("tool"),
  ]),
  content: z.string(),
  conversationId: z.string().optional(),
  createdAt: z.string().optional(),
  tools: z.string().nullable().optional(),
  feedback: z.boolean().nullable().optional(),
  feedbacks: z.array(FeedbackItemSchema).optional(), // Array of feedback objects
});

export const mailSchema = z.object({
  title: z.string().min(2).max(50),
  description: z.string().min(2).max(500),
});

export type Message = z.infer<typeof MessageSchema>;

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

export const TeamSchema = z.object({
  team_id: z.string(),
  name: z.string(),
  short_name: z.string(),
  cid: z.string(),
  logo_url: z.string(),
  thumb_url: z.string(),
  last_5_matches: z.array(z.number()),
  squads: z.array(PlayerSchema),
});

export type Team = z.infer<typeof TeamSchema>;

export const DataPlayerSchema = z.object({
  sports: z.string(),
  teams: z.array(TeamSchema),
  match_id: z.string(),
});

export type DataPlayer = z.infer<typeof DataPlayerSchema>;

export const voteSchema = z.object({
  messages: z.array(MessageSchema),
  index: z.number(),
  feedback: z.enum(["upvote", "downvote", "custom"]),
  title: z.string().min(2).max(100),
  description: z.string().min(2).max(500),
  user_id: z.string(),
  conversation_id: z.string(),
  tournament: z.string().optional(),
  match: z.string().optional(),
  subtitle_match: z.string().optional(),
  date: z.string().optional(),
});

export type Vote = z.infer<typeof voteSchema>;

