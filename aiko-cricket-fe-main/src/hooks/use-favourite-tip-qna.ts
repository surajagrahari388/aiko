"use client";

import { useState, useCallback, useContext } from "react";
import { createId } from "@paralleldrive/cuid2";
import { Message } from "@/lib/schemas/qna";
import type { FavouriteTipRecord, OddsResponse, SportsMatches } from "@/lib/types";
import { TenantContext } from "@/contexts/analytics-context";
import { useLanguage } from "@/contexts/language-context";
import { posthog } from "posthog-js";
import { log } from "@/lib/debug-logger";

interface FavouriteTipQnaConfig {
  api_url: string;
  apim_key: string;
  user_id: string;
  conversation_id?: string;
  stats?: OddsResponse | SportsMatches;
  squads?: {
    player_id: string;
    full_name: string;
    playing_role: string;
    team_name: string;
  }[];
  caching_enabled?: boolean;
}

interface FavouriteTipWithQna extends FavouriteTipRecord {
  qna_processed?: boolean;
  qna_messages?: Message[];
  qna_loading?: boolean;
  qna_error?: string;
}

export const useFavouriteTipQna = (config: FavouriteTipQnaConfig) => {
  const analytics = useContext(TenantContext);
  const tenantId = analytics?.tenantId;
  const { language } = useLanguage();

  const [processingTips, setProcessingTips] = useState<Set<string>>(new Set());

  // Helper function to generate user-friendly error messages
  const getErrorDetails = async (
    response: Response,
    questionText: string,
    conversationId: string
  ) => {
    const status = response.status;
    let userMessage = "";

    let responseText = "";
    try {
      responseText = await response.text();
    } catch (e) {
      console.error("Failed to read response text:", e);
    }

    // Generate user-friendly messages based on status code
    switch (status) {
      case 400:
        userMessage =
          "Oops! It looks like there was an issue while processing your question. Please try again.";
        break;
      case 401:
        userMessage =
          "Hmm, we couldn't verify your access. Try refreshing the page or logging in again.";
        break;
      case 403:
        userMessage =
          "Sorry, you don't have permission to use this feature right now. Please contact support if you think this is a mistake.";
        break;
      case 404:
        userMessage =
          "The AI service seems to be missing. It might be temporarily unavailable—please try again soon.";
        break;
      case 429:
        userMessage =
          "You're asking questions a bit too quickly! Please wait a moment before trying again.";
        break;
      case 500:
        userMessage =
          "Something went wrong on our end. We're working to fix it—please try again in a few minutes.";
        break;
      default:
        userMessage = `An unexpected error occurred (${status}). Please try again.`;
    }

    return {
      userMessage,
      errorDetails: {
        status,
        responseText,
        questionText,
        conversationId,
        timestamp: new Date().toISOString(),
      },
    };
  };

  const processFavouriteTip = useCallback(
    async (tip: FavouriteTipRecord): Promise<FavouriteTipWithQna> => {
      if (!tip.original_question?.trim()) {
        return {
          ...tip,
          qna_processed: true,
          qna_error: "No question to process",
        };
      }

      // Check if already processing
      if (processingTips.has(tip.id)) {
        return tip as FavouriteTipWithQna;
      }

      setProcessingTips((prev) => new Set(prev).add(tip.id));

      // analyticsPayload needs to be visible to the outer catch block below.
      let analyticsPayload: Record<string, unknown> = {};

      try {
        const userMessage: Message = {
          id: createId(),
          role: "user",
          content: tip.original_question,
        };

        // Prepare payload for QnA processing
        const payloadConversationId =
          tip.conversation_id || config.conversation_id || createId();

        // Normalize match info so consumers don't have to care about the original shape
        const matchInfo: OddsResponse["response"]["match_info"] | undefined = (() => {
          // If stats already follows OddsResponse schema
          if ((config.stats as OddsResponse)?.response?.match_info) {
            return (config.stats as OddsResponse).response.match_info;
          }

          // If stats is SportsMatches, map the first match into a compatible shape
          const sm = config.stats as SportsMatches | undefined;
          const first = sm?.matches?.[0];
          if (!first) return undefined;

          return {
            match_id: first.match_id,
            title: first.title,
            date_start_ist: first.date_start_ist || first.date_start,
            status_str: first.status_str,
            teama: { name: first.teams?.[0]?.name },
            teamb: { name: first.teams?.[1]?.name },
            pitch: { pitch_condition: first.pitch_type },
            venue: {
              name: first.venues?.name || "",
              country: first.venues?.country || "",
              location: first.venues?.location || "",
            },
            competition: {
              title: first.competitions?.title || "",
              season: first.competitions?.season || "",
            },
            format_str: first.format_str || "",
            weather: { weather: first.weather || "" },
          };
        })();

        const payload = {
          messages: [userMessage],
          conversation_id: payloadConversationId,
          user_id: config.user_id,
          oddsData: config.stats || null,
          match_id: matchInfo?.match_id?.toString() || "",
          venue_name: matchInfo?.venue?.name || "",
          tournament_title: matchInfo?.competition?.title || "",
          team1_full_name: matchInfo?.teama?.name || "",
          team2_full_name: matchInfo?.teamb?.name || "",
          season: matchInfo?.competition?.season || "",
          match_title: matchInfo?.title || "",
          date_start_ist: matchInfo?.date_start_ist || "",
          tournament_type: matchInfo?.format_str || "",
          venue_country: matchInfo?.venue?.country || "",
          venue_location: matchInfo?.venue?.location || "",
          venue_state: "",
          pitch_type: matchInfo?.pitch?.pitch_condition || "",
          weather: matchInfo?.weather?.weather || "",
          match_status: matchInfo?.status_str || "",
          players: config.squads || [],
          caching_enabled: config.caching_enabled ?? true,
        };

        analyticsPayload = {
          tip_id: tip.id,
          question_id: userMessage.id,
          question_text: tip.original_question,
          question_length: tip.original_question.length,
          conversation_id: payloadConversationId,
          tenant_id: tenantId,
          language,
          match_id: payload.match_id,
          match_title: payload.match_title,
          tournament_title: payload.tournament_title,
          tournament_season: payload.season,
          tournament_type: payload.tournament_type,
          team1_name: payload.team1_full_name,
          team2_name: payload.team2_full_name,
          venue_name: payload.venue_name,
          venue_country: payload.venue_country,
          venue_location: payload.venue_location,
          date_start_ist: payload.date_start_ist,
          pitch_condition: payload.pitch_type,
          weather: payload.weather,
          match_status: payload.match_status,
        };

        try {
          posthog.capture("favourite_tip_qna_asked", analyticsPayload);
          log({
            event_name: "favourite_tip_qna_asked",
            payload: analyticsPayload,
          });
        } catch (err) {
          console.debug("PostHog capture failed for favourite_tip_qna_asked", err);
        }

        const apiUrl =
          config.api_url && config.api_url.length > 0 ? config.api_url : "/api/tips";

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (config.apim_key) headers["Ocp-Apim-Subscription-Key"] = config.apim_key;

        const response = await fetch(apiUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorDetails = await getErrorDetails(response, tip.original_question, payloadConversationId);
          try {
            posthog.capture("favourite_tip_qna_error", { ...analyticsPayload, error_status: errorDetails.errorDetails.status });
            log({
              event_name: "favourite_tip_qna_error",
              payload: { ...analyticsPayload, error_status: errorDetails.errorDetails.status },
            });
          } catch (err) {
            console.debug("PostHog capture failed for favourite_tip_qna_error", err);
          }
          return { ...tip, qna_processed: true, qna_error: errorDetails.userMessage, conversation_id: payloadConversationId } as FavouriteTipWithQna;
        }

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let content = "";
        const assistantMessage: Message = { id: createId(), role: "assistant", content: "" };

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            content += chunk;
            assistantMessage.content = content;
          }

          try {
            posthog.capture("favourite_tip_qna_success", { ...analyticsPayload, response_length: content.length });
            log({
              event_name: "favourite_tip_qna_success",
              payload: { ...analyticsPayload, response_length: content.length },
            });
          } catch (err) {
            console.debug("PostHog capture failed for favourite_tip_qna_success", err);
          }

          return { ...tip, qna_processed: true, qna_messages: [userMessage, { ...assistantMessage, content }] } as FavouriteTipWithQna;
        } finally {
          reader.releaseLock();
        }
      } catch (error) {
        console.error("Error processing favourite tip QnA:", error);
        try {
          posthog.capture("favourite_tip_qna_error", { ...analyticsPayload, error_message: error instanceof Error ? error.message : "Unknown error" });
          log({
            event_name: "favourite_tip_qna_error",
            payload: { ...analyticsPayload, error_message: error instanceof Error ? error.message : "Unknown error" },
          });
        } catch (err) {
          console.debug("PostHog capture failed for favourite_tip_qna_error", err);
        }
        return { ...tip, qna_processed: true, qna_error: "Failed to process question. Please try again." } as FavouriteTipWithQna;
      } finally {
        setProcessingTips((prev) => {
          const newSet = new Set(prev);
          newSet.delete(tip.id);
          return newSet;
        });
      }
    },
    [config, processingTips, tenantId, language]
  );

  const isProcessing = useCallback((tipId: string) => processingTips.has(tipId), [processingTips]);

  return {
    processFavouriteTip,
    isProcessing,
    processingCount: processingTips.size,
  };
};

export default useFavouriteTipQna;
