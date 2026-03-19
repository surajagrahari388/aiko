import { useState, useEffect, useCallback } from "react";
import { DataPlayer } from "@/lib/schemas/qna";
import { useEmbedContext } from "@/contexts/embed-context";

interface UsePlayersDataProps {
  matchId: string;
  subscriptionKey?: string;
}

interface UsePlayersDataResult {
  players: DataPlayer | null;
  isLoading: boolean;
  error: string | null;
}

export function usePlayersData({
  matchId,
  subscriptionKey,
}: UsePlayersDataProps): UsePlayersDataResult {
  const [players, setPlayers] = useState<DataPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscriptionKey: embedKey } = useEmbedContext();
  const effectiveSubscriptionKey = subscriptionKey || embedKey;

  const fetchPlayers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (effectiveSubscriptionKey) {
        headers["Ocp-Apim-Subscription-Key"] = effectiveSubscriptionKey;
      }
      const response = await fetch(`/api/players?matchId=${matchId}`, {
        method: "GET",
        headers,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Failed to fetch players: ${response.status} ${JSON.stringify(
            error,
          )}`,
        );
      }
      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      setPlayers(null);
      setError(err instanceof Error ? err.message : "Failed to fetch players");
    } finally {
      setIsLoading(false);
    }
  }, [matchId, effectiveSubscriptionKey]);

  useEffect(() => {
    if (matchId) fetchPlayers();
  }, [matchId, fetchPlayers]);

  return { players, isLoading, error };
}
