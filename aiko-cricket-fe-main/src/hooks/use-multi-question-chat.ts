"use client";

import { useCallback, useState, useRef, useEffect, useContext } from "react";
import { createId } from "@paralleldrive/cuid2";
import { toast } from "sonner";
import { TenantContext } from "@/contexts/analytics-context";
import { useLanguage } from "@/contexts/language-context";
import { posthog } from "posthog-js";
import { log } from "@/lib/debug-logger";
import { Message } from "@/lib/schemas/qna";
import { SportsMatches } from "@/lib/types";

// Helper function to generate user-friendly error messages and support email details
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
        "Something went wrong on our end. Our team is on it—please try again in a bit.";
      break;
    case 502:
    case 503:
    case 504:
      userMessage =
        "Our service is taking a quick break. Please try again in a few minutes.";
      break;
    default:
      userMessage = `An unexpected error occurred (${status}). Please try again or contact support if it persists.`;
  }

  // Create structured error details for support
  const timestamp = new Date().toISOString();
  const errorDetails = {
    status,
    responseText,
    timestamp,
    questionText,
    conversationId,
  };

  // Keep user-facing message simple and without mailto links; UI will provide a 'Contact Support' action
  // (e.g., a button that calls the feedback endpoint)
  // userMessage was set earlier based on status switch

  return {
    userMessage,
    errorDetails,
  };
};

// Send the collected error details to the backend feedback endpoint
const sendSupportFeedback = async (
  feedbackUrl: string,
  payload: Record<string, unknown>,
  apimKey?: string
) => {
  try {
    await fetch(feedbackUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apimKey ? { "Ocp-Apim-Subscription-Key": apimKey } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Let caller handle failures - just log here for debugging
    console.error("Failed to send feedback to support endpoint:", err);
    throw err;
  }
};

export interface QuestionItem {
  id: string;
  text: string;
  status: "pending" | "processing" | "completed" | "error";
  messages: Message[];
  conversation_id: string;
  error?: string;
  error_details?: Record<string, unknown>;
  feedbackSent: boolean;
}

interface ChatConfig {
  api_url: string;
  apim_key: string;
  user_id: string;
  stats?: SportsMatches;
  squads?: {
    player_id: string;
    full_name: string;
    playing_role: string;
    team_name: string;
  }[];
  caching_enabled: boolean;
  conversation_id: string;
}

interface StreamResponse {
  reader: ReadableStreamDefaultReader<Uint8Array> | null;
  decoder: TextDecoder;
  abortController: AbortController;
}

export const useMultiQuestionChat = (config: ChatConfig) => {
  const analytics = useContext(TenantContext);
  const tenantId = analytics?.tenantId;
  const { language } = useLanguage();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const streamResponsesRef = useRef<Map<string, StreamResponse>>(new Map());

  // Send feedback for a specific question (can be called from UI)
  const sendFeedback = useCallback(
    async (questionId: string) => {
      const q = questions.find((x) => x.id === questionId);
      if (!q || !q.error_details) {
        console.warn(
          "No error details available to send feedback for",
          questionId
        );
        return;
      }

      const feedbackEndpoint = new URL(
        "/feedback",
        config.api_url.endsWith("/") ? config.api_url : config.api_url + "/"
      ).toString();

      const payload = {
        user_id: config.user_id,
        conversation_id: q.conversation_id,
        question: q.text,
        error: q.error_details,
        api_url: config.api_url,
        questionId: q.id,
      };

      try {
        await sendSupportFeedback(feedbackEndpoint, payload, config.apim_key);
        toast.success("Successfully reported");
        // Mark feedback as sent for this question
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === questionId ? { ...q, feedbackSent: true } : q
          )
        );
      } catch (err) {
        console.error("Failed to send feedback:", err);
        toast.error("Failed to send feedback. Please try again later.");
      }
    },
    [questions, config]
  );

  const updateQuestionStatus = useCallback(
    (questionId: string, status: QuestionItem["status"], error?: string) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, status, error } : q))
      );
    },
    []
  );

  const updateQuestionMessages = useCallback(
    (questionId: string, messages: Message[]) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, messages } : q))
      );
    },
    []
  );
  // Cleanup streaming responses on unmount
  useEffect(() => {
    const currentStreamResponses = streamResponsesRef.current;
    return () => {
      for (const streamResponse of currentStreamResponses.values()) {
        if (streamResponse.reader) {
          streamResponse.reader.cancel();
        }
        streamResponse.abortController.abort();
      }
      currentStreamResponses.clear();
    };
  }, []);

  const processQuestion = useCallback(
    async (
      questionId: string,
      questionText: string,
      conversationId: string
    ) => {
      updateQuestionStatus(questionId, "processing");

      try {
        const userMessage: Message = {
          id: questionId,
          role: "user",
          content: questionText,
        };

        // Update messages with user message
        updateQuestionMessages(questionId, [userMessage]);

        // Create abort controller for this question
        const abortController = new AbortController();
        // First, save the user message to conversation

        // Prepare payload
        const payload = {
          messages: [userMessage],
          conversation_id: conversationId,
          user_id: config.user_id,
          match_id: config.stats?.matches?.[0]?.match_id || "",
          venue_name: config.stats?.matches?.[0]?.venues?.name || "",
          tournament_title: config.stats?.matches?.[0]?.competitions?.title || "",
          team1_full_name: config.stats?.matches?.[0]?.teams?.[0]?.name || "",
          team2_full_name: config.stats?.matches?.[0]?.teams?.[1]?.name || "",
          season: config.stats?.matches?.[0]?.competitions?.season || "",
          match_title: config.stats?.matches?.[0]?.title || "",
          date_start_ist: config.stats?.matches?.[0]?.date_start_ist || "",
          tournament_type: config.stats?.matches?.[0]?.format_str || "",
          venue_country: config.stats?.matches?.[0]?.venues?.country || "",
          venue_location: config.stats?.matches?.[0]?.venues?.location || "",
          venue_state: "",
          pitch_type: config.stats?.matches?.[0]?.pitch_type || "",
          weather: config.stats?.matches?.[0]?.weather || "",
          match_status: config.stats?.matches?.[0]?.status_str || "",
          players: config.squads,
          caching_enabled: config.caching_enabled,
        };
        // Make the streaming API call
        const response = await fetch(config.api_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": config.apim_key,
          },
          body: JSON.stringify(payload),
          signal: abortController.signal,
        });

        if (!response.ok) {
          // Generate user-friendly error message based on status code
          const errorDetails = await getErrorDetails(
            response,
            questionText,
            conversationId
          );

          // Attach error details to the question and mark as errored so UI can resend if user clicks
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === questionId
                ? {
                    ...q,
                    status: "error",
                    error: errorDetails.userMessage,
                    error_details: errorDetails.errorDetails,
                  }
                : q
            )
          );

          // Stop processing this question
          return;
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // Store stream response for potential cleanup
        streamResponsesRef.current.set(questionId, {
          reader,
          decoder,
          abortController,
        });

        let content = "";

        const assistantMessage: Message = {
          id: createId(),
          role: "assistant",
          content: "",
        };

        // Update messages with initial assistant message
        updateQuestionMessages(questionId, [userMessage, assistantMessage]);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Check if this question was stopped
            if (abortController.signal.aborted) {
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            content += chunk;

            // Update the assistant message content
            const updatedAssistantMessage = { ...assistantMessage, content };
            updateQuestionMessages(questionId, [
              userMessage,
              updatedAssistantMessage,
            ]);
          }
          updateQuestionStatus(questionId, "completed");

          // Note: Conversation saving would be handled server-side in a real implementation
          // const finalMessages = [userMessage, { ...assistantMessage, content }];
          // await fetch(conversationLink, {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //     "Ocp-Apim-Subscription-Key": config.apim_key,
          //   },
          //   body: JSON.stringify({
          //     messages: finalMessages,
          //   }),
          //   signal: abortController.signal,
          // });
        } finally {
          reader.releaseLock();
          streamResponsesRef.current.delete(questionId);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          updateQuestionStatus(questionId, "pending");
          toast.error(
            "Question Stopped: The question was stopped by user request."
          );
        } else {
          console.error(`Failed to process question ${questionId}:`, error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to process question";
          updateQuestionStatus(questionId, "error", errorMessage);
          toast.error(`Question Error: ${errorMessage}`);
        }
        // Clean up stream response
        streamResponsesRef.current.delete(questionId);
      }
    },
    [config, updateQuestionStatus, updateQuestionMessages]
  );

  const addQuestion = useCallback(
    (
      questionText: string,
      conversationIdOverride?: string,
      isFaq?: boolean,
      faqCategory?: string,
      textSource?: "typed" | "voice"
    ) => {
      if (!questionText.trim()) {
        toast.error(
          "Empty Question: Please enter a question before adding it to the queue."
        );
        return null;
      }

      const questionId = createId();
      const conversationId = conversationIdOverride || config.conversation_id;

      const newQuestion: QuestionItem = {
        id: questionId,
        text: questionText.trim(),
        status: "pending",
        messages: [],
        conversation_id: conversationId,
        feedbackSent: false,
      };

      setQuestions((prev) => [...prev, newQuestion]);

      // Process the question immediately in the background
      processQuestion(questionId, questionText.trim(), conversationId);

      const analyticsPayload = {
        question_id: questionId,
        question_text: questionText.trim(),
        conversation_id: conversationId,
        tenant_id: tenantId,
        language,
        text_source: textSource || "typed",
        is_faq: isFaq || false,
        faq_category: faqCategory,
        match_id: config.stats?.matches?.[0]?.match_id,
        match_title: config.stats?.matches?.[0]?.title,
        tournament_title: config.stats?.matches?.[0]?.competitions?.title,
        tournament_season: config.stats?.matches?.[0]?.competitions?.season,
        tournament_type: config.stats?.matches?.[0]?.format_str,
        team1_name: config.stats?.matches?.[0]?.teams?.[0]?.name,
        team2_name: config.stats?.matches?.[0]?.teams?.[1]?.name,
        venue_name: config.stats?.matches?.[0]?.venues?.name,
        venue_country: config.stats?.matches?.[0]?.venues?.country,
        venue_location: config.stats?.matches?.[0]?.venues?.location,
        date_start_ist: config.stats?.matches?.[0]?.date_start_ist,
        pitch_condition: config.stats?.matches?.[0]?.pitch_type,
        weather: config.stats?.matches?.[0]?.weather,
        match_status: config.stats?.matches?.[0]?.status_str,
      };
      posthog.capture("qna_asked", analyticsPayload);
      log({
        event_name: "qna_asked",
        payload: analyticsPayload,
      });

      return questionId;
    },
    [processQuestion]
  );

  const removeQuestion = useCallback((questionId: string) => {
    // Stop the question if it's processing
    const streamResponse = streamResponsesRef.current.get(questionId);
    if (streamResponse) {
      streamResponse.abortController.abort();
      if (streamResponse.reader) {
        streamResponse.reader.cancel();
      }
      streamResponsesRef.current.delete(questionId);
    }

    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  }, []);

  const retryQuestion = useCallback(
    (questionId: string) => {
      const question = questions.find((q) => q.id === questionId);
      if (question) {
        processQuestion(questionId, question.text, question.conversation_id);
      }
    },
    [questions, processQuestion]
  );

  const clearAllQuestions = useCallback(() => {
    // Stop all processing questions
    for (const streamResponse of streamResponsesRef.current.values()) {
      streamResponse.abortController.abort();
      if (streamResponse.reader) {
        streamResponse.reader.cancel();
      }
    }
    streamResponsesRef.current.clear();

    setQuestions([]);
  }, []);

  const stopQuestion = useCallback((questionId: string) => {
    const streamResponse = streamResponsesRef.current.get(questionId);
    if (streamResponse) {
      streamResponse.abortController.abort();
      if (streamResponse.reader) {
        streamResponse.reader.cancel();
      }
      streamResponsesRef.current.delete(questionId);
    }
  }, []);

  return {
    questions,
    addQuestion,
    removeQuestion,
    retryQuestion,
    clearAllQuestions,
    stopQuestion,
    sendFeedback,
  };
};