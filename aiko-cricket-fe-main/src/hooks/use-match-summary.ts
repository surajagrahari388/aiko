"use client";

import { useState, useEffect, useCallback } from "react";
import { MatchSummaryData } from "@/lib/types";
import { useLanguage } from "@/contexts/language-context";
import { useEmbedContext } from "@/contexts/embed-context";

interface UseMatchSummaryProps {
  match_id: number;
  user_id: string;
  subscriptionKey?: string;
}

interface UseMatchSummaryResult {
  summary: MatchSummaryData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isFetching: boolean;
}

export function useMatchSummary({
  user_id,
  match_id,
  subscriptionKey,
}: UseMatchSummaryProps): UseMatchSummaryResult {
  const [summary, setSummary] = useState<MatchSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const { language } = useLanguage();
  const { subscriptionKey: embedKey } = useEmbedContext();
  const effectiveSubscriptionKey = subscriptionKey || embedKey;

  const normalizedMatchId = match_id === 837981 ? 83798 : match_id;

  const fetchSummary = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const request_body = {
        match_id: normalizedMatchId,
        user_id: user_id,
        language: language,
      };
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (effectiveSubscriptionKey) {
        headers["Ocp-Apim-Subscription-Key"] = effectiveSubscriptionKey;
      }
      const response = await fetch("/api/match-summary", {
        method: "POST",
        headers,
        body: JSON.stringify(request_body),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Failed to fetch match summary: ${response.status} ${JSON.stringify(
            error
          )}`
        );
      }
      const data = await response.json();
      // The response already includes language
      setSummary(data);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch match summary";
      setSummary(null);
      setError(errorMsg);
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  }, [normalizedMatchId, user_id, language, effectiveSubscriptionKey]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const refetch = useCallback(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, isLoading, error, refetch, isFetching };
}
