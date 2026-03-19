"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { log } from "@/lib/debug-logger";
import { FeedbackItem } from "@/lib/schemas/qna";

interface ConversationHistoryItem {
  messages: ConversationMessage[];
  userId: string;
  matchId: string;
  totalMessages: number;
  updated_at?: string;
  created_at?: string;
}

interface ConversationMessage {
  id: string;
  role: "function" | "user" | "assistant" | "system" | "data" | "tool";
  content: string;
  tools?: string;
  tools_data?: string;
  queryId?: string;
  question?: string;
  createdAt: string;
  tournament?: string;
  match?: string;
  match_id?: string;
  subtitle_match?: string;
  date?: string;
  venue?: string;
  venue_country?: string;
  venue_location?: string;
  format?: string;
  players?: string;
  team1_name?: string;
  team2_name?: string;
  total_cost_usd?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  cached_tokens?: number;
  cached?: boolean;
  successful_requests?: number;
  buildNumber?: string;
  conversationId: string;
  feedbacks?: FeedbackItem[]; // Add feedbacks array to match the Message schema
}

interface ConversationHistoryConfig {
  base_conversation_url: string;
  apim_key: string;
  user_id: string;
  match_id: string;
  apim_url: string;
}

export const useConversationHistory = (config: ConversationHistoryConfig) => {
  const [conversationHistory, setConversationHistory] =
    useState<ConversationHistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchConversationHistory = useCallback(
    async (force = false) => {
      if (
        !config.user_id ||
        !config.match_id ||
        config.match_id.trim() === ""
      ) {
        log(
          "Skipping conversation history fetch - missing user_id or match_id"
        );
        return;
      }

      // Prevent multiple simultaneous requests
      if (isLoading && !force) {
        log("Fetch already in progress, skipping");
        return;
      }

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setError(null);

      try {
        const url = `${config.apim_url}${config.base_conversation_url}/user/${config.user_id}/match/${config.match_id}/messages`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": config.apim_key,
          },
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          if (response.status === 404) {
            // No previous conversation found, which is normal for first time
            log("No previous conversation found (404)");
            const result = null;
            setConversationHistory(result);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setConversationHistory(data);
        setLastFetchTime(Date.now());
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          log("Fetch was aborted");
          return;
        }
        console.error("Failed to fetch conversation history:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch conversation history";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [
      config.base_conversation_url,
      config.apim_key,
      config.user_id,
      config.match_id,
      isLoading,
    ]
  );

  useEffect(() => {
    if (config.user_id && config.match_id && config.match_id.trim() !== "") {
      fetchConversationHistory();
    }
  }, [config.user_id, config.match_id]); // Removed fetchConversationHistory from deps to prevent loops

  const refetch = useCallback(() => {
    fetchConversationHistory(true); // Force refresh
  }, [fetchConversationHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    conversationHistory,
    isLoading,
    error,
    refetch,
    lastFetchTime,
  };
};