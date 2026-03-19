"use client";

import { useContext } from "react";
import { useLanguage } from "@/contexts/language-context";
import { TenantContext } from "@/contexts/analytics-context";
import { useEmbedContext } from "@/contexts/embed-context";
import {
  TipData,
  SportsMatches,
  MatchPushData,
  SingleMatchResponse,
  DetailedMatchResponse,
} from "@/lib/types";
import { mergeTipsByScenario } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type UseGlobalTipsProps = {
  matchData: SportsMatches;
  user_id?: string;
  apim_url?: string;
  tips_broadcast?: string;
  enabled?: boolean;
  enableSSE?: boolean;
  enableTenant?: boolean;
  subscriptionKey?: string;
};

type SSEStatus = "disconnected" | "connecting" | "connected" | "error";

type SSETipPayload = Partial<TipData> & {
  id?: string;
  title?: string;
  heading?: string;
  description?: string;
  content?: string;
  text?: string;
  betType?: string;
  category?: string;
  type?: string;
  original_bet_type_status?: boolean;
  odds?: {
    name?: string;
    odds?: string;
    value?: string;
  };
};

// Unnamed SSE events: connection ack, keep-alive ping, errors
type SSEUnnamedMessage = {
  type?: string;
  error?: string;
  message?: string;
  timestamp?: string;
  // Legacy fallback fields (tips sent as unnamed events during transition)
  tips?: SSETipPayload[];
  summary?: SSETipPayload[];
} & Record<string, unknown>;

export function useGlobalTips({
  matchData,
  user_id,
  apim_url,
  tips_broadcast,
  enabled = true,
  enableSSE = true,
  enableTenant,
  subscriptionKey,
}: UseGlobalTipsProps) {
  const match_id = matchData?.matches?.[0]?.match_id;
  const { language } = useLanguage();
  const tenantContext = useContext(TenantContext);
  const { subscriptionKey: embedKey } = useEmbedContext();
  const effectiveSubscriptionKey = subscriptionKey || embedKey;
  const queryClient = useQueryClient();
  const [teamNames, setTeamNames] = useState<{
    team1?: string;
    team2?: string;
  }>();
  const [updatedAt, setUpdatedAt] = useState<string | undefined>();
  const eventSourceRef = useRef<EventSource | null>(null);
  const sseStatusRef = useRef<SSEStatus>("disconnected");
  const [sseStatus, setSseStatus] = useState<SSEStatus>("disconnected");
  const [recentTipIds, setRecentTipIds] = useState<string[]>([]);
  const recentTipTimeoutsRef = useRef<Map<string, number>>(new Map());
  const retryCountRef = useRef<number>(0);
  const retryTimeoutRef = useRef<number | null>(null);
  const heartbeatTimeoutRef = useRef<number | null>(null);
  const [maxRetriesReached, setMaxRetriesReached] = useState<boolean>(false);
  const maxRetryAttempts = 5;
  const baseRetryDelay = 1000; // 1 second
  const heartbeatTimeout = 45000; // 45s — reconnect if no ping/event received
  const debugPrefix = "[Tips SSE]";

  const debugLog = useMemo(() => {
    return {
      info: (message: string, data?: Record<string, unknown>) => {
        if (typeof window !== "undefined") {
          console.info(debugPrefix, message, data ?? "");
        }
      },
      warn: (message: string, data?: Record<string, unknown>) => {
        if (typeof window !== "undefined") {
          console.warn(debugPrefix, message, data ?? "");
        }
      },
      error: (message: string, data?: Record<string, unknown>) => {
        if (typeof window !== "undefined") {
          console.error(debugPrefix, message, data ?? "");
        }
      },
    };
  }, []);

  // --- Score snapshot helper ---
  const buildScoreSnapshot = useCallback((): string | undefined => {
    try {
      const teams = matchData?.matches?.[0]?.teams || [];
      const formatScore = (team?: {
        short_name?: string;
        name?: string;
        scores_full?: string;
      }) => {
        if (!team?.scores_full) return null;
        const teamLabel = team.short_name || team.name || "";
        return `${teamLabel} ${team.scores_full}`.trim();
      };
      const parts = [formatScore(teams[0]), formatScore(teams[1])].filter(
        Boolean,
      );
      return parts.join(" | ") || undefined;
    } catch (e) {
      console.error("Failed to generate score snapshot for SSE tip", e);
      return undefined;
    }
  }, [matchData]);

  // --- Tips processing helper (shared by tips_update, match_pulse, and legacy onmessage) ---
  const processTipsPayload = useCallback(
    (tipsPayload: SSETipPayload[], { replaceLive = true } = {}) => {
      if (!tipsPayload.length) return;

      const normalized: TipData[] = tipsPayload.map((tip, index) => ({
        tip_id: tip.tip_id || tip.id || `sse-tip-${Date.now()}-${index}`,
        scenario:
          tip.scenario || tip.title || tip.heading || `Live Tip ${index + 1}`,
        summary:
          tip.summary || tip.description || tip.content || tip.text || "",
        bet_type:
          tip.bet_type ||
          tip.betType ||
          tip.category ||
          tip.type ||
          "MATCH_ODDS",
        friendly_bet_type: tip.friendly_bet_type,
        filter_category: tip.filter_category,
        original_scenario: tip.original_scenario,
        original_bet_type: tip.original_bet_type || tip.bet_type,
        original_bet_type_status: tip.original_bet_type_status,
        original_bet_type_live: tip.original_bet_type_live,
        is_live: tip.is_live,
        gpt_call_stats: tip.gpt_call_stats,
        updated_at: tip.updated_at,
        updated_at_score: tip.updated_at_score,
        is_match_pulse: tip.is_match_pulse,
        score_snapshot: buildScoreSnapshot(),
        odds: tip.odds
          ? {
              name: tip.odds.name,
              odds: tip.odds.odds || tip.odds.value,
            }
          : undefined,
      }));

      // Split into match pulse tips (replace existing) and regular tips (merge by scenario)
      const matchPulseTips = normalized.filter((t) => t.is_match_pulse);
      const regularTips = normalized.filter((t) => !t.is_match_pulse);

      queryClient.setQueryData<{ summary: TipData[] }>(
        ["tips", match_id, user_id, language],
        (oldData) => {
          const previous = oldData?.summary || [];

          const existingRegular = previous.filter((t) => !t.is_match_pulse);

          // When replaceLive, drop all existing live tips and use incoming as-is;
          // otherwise merge by scenario for backward compat (legacy / match_pulse).
          const mergedRegular = regularTips.length
            ? replaceLive
              ? [
                  ...existingRegular.filter((t) => !t.is_live),
                  ...regularTips,
                ]
              : mergeTipsByScenario(existingRegular, regularTips)
            : existingRegular;

          // When new match pulse tips arrive, replace all existing ones; otherwise keep existing
          const finalMatchPulse = matchPulseTips.length
            ? matchPulseTips
            : previous.filter((t) => t.is_match_pulse);
          const allTips = [...mergedRegular, ...finalMatchPulse];

          setRecentTipIds((prev) => {
            const incomingIds = normalized.map((tip) => tip.tip_id);

            debugLog.info("SSE Tips Received:", {
              count: normalized.length,
              matchPulseCount: matchPulseTips.length,
              regularCount: regularTips.length,
              tipIds: incomingIds,
              tipDetails: normalized.map((tip) => ({
                id: tip.tip_id,
                betType: tip.bet_type,
                isLive: tip.is_live,
                originalBetTypeLive: tip.original_bet_type_live,
                isMatchPulse: tip.is_match_pulse,
              })),
            });

            // Clean up existing timeouts for incoming tips (they get new timeouts)
            for (const id of incomingIds) {
              const existingTimeout = recentTipTimeoutsRef.current.get(id);
              if (existingTimeout) {
                clearTimeout(existingTimeout);
                recentTipTimeoutsRef.current.delete(id);
              }
            }

            // Set new timeouts for incoming tips (30 seconds to match HIGHLIGHT_MIN_DURATION_MS)
            for (const id of incomingIds) {
              const timeoutId = window.setTimeout(() => {
                debugLog.info("Removing recent tip from highlighting:", { id });
                setRecentTipIds((current) =>
                  current.filter((tipId) => tipId !== id),
                );
                recentTipTimeoutsRef.current.delete(id);
              }, 30000); // 30 seconds

              recentTipTimeoutsRef.current.set(id, timeoutId);
            }

            return [...incomingIds, ...prev].slice(0, 20);
          });
          debugLog.info("Tips updated", {
            previous: previous.length,
            incoming: normalized.length,
            matchPulseAppended: matchPulseTips.length,
            regularMerged: regularTips.length,
            total: allTips.length,
          });
          return {
            summary: allTips,
          };
        },
      );
    },
    [match_id, user_id, language, queryClient, debugLog, buildScoreSnapshot],
  );

  // --- Match push handler: patches the existing match query cache ---
  const processMatchPush = useCallback(
    (pushData: MatchPushData) => {
      const pushMatch = pushData.match;
      if (!pushMatch) return;

      // Read current match cache to merge against
      const currentCache = queryClient.getQueryData<{
        basicData: SingleMatchResponse;
        detailedData: DetailedMatchResponse | null;
      }>(["cricket", "match", match_id]);

      if (!currentCache) {
        debugLog.warn("No existing match cache to patch with match_push_obj");
        return;
      }

      // Patch basicData.match with SSE fields
      const patchedBasicMatch = {
        ...currentCache.basicData.match,
        status_str:
          pushMatch.status_str ?? currentCache.basicData.match.status_str,
        status_note:
          pushMatch.status_note ?? currentCache.basicData.match.status_note,
        game_state_str:
          pushMatch.game_state_str ??
          currentCache.basicData.match.game_state_str,
        weather: pushMatch.weather ?? currentCache.basicData.match.weather,
        pitch_type:
          pushMatch.pitch_type ?? currentCache.basicData.match.pitch_type,
        // Update team scores from innings data
        teams: currentCache.basicData.match.teams.map((team) => {
          const inning = pushMatch.innings?.find(
            (inn) => String(inn.batting_team_id) === String(team.team_id),
          );
          if (inning) {
            return { ...team, scores_full: inning.scores_full };
          }
          return team;
        }),
      };

      // Patch detailedData if it exists
      let patchedDetailed = currentCache.detailedData;
      if (patchedDetailed) {
        patchedDetailed = {
          ...patchedDetailed,
          match: {
            ...patchedDetailed.match,
            status_str:
              pushMatch.status_str ?? patchedDetailed.match.status_str,
            status_note:
              pushMatch.status_note ?? patchedDetailed.match.status_note,
            game_state_str:
              pushMatch.game_state_str ?? patchedDetailed.match.game_state_str,
            weather: pushMatch.weather ?? patchedDetailed.match.weather,
            pitch_type:
              pushMatch.pitch_type ?? patchedDetailed.match.pitch_type,
            // Merge innings: update scores_full from push, keep existing detailed stats
            innings: patchedDetailed.match.innings.map((existingInning) => {
              const pushInning = pushMatch.innings?.find(
                (pi) =>
                  String(pi.inning_id) === String(existingInning.inning_id),
              );
              if (pushInning) {
                return {
                  ...existingInning,
                  scores_full: pushInning.scores_full,
                  is_super_over: pushInning.is_super_over,
                  ...(pushInning.recent_balls?.length > 0 && {
                    recent_balls: pushInning.recent_balls,
                  }),
                };
              }
              return existingInning;
            }),
          },
        };
      }

      queryClient.setQueryData(["cricket", "match", match_id], {
        basicData: {
          ...currentCache.basicData,
          match: patchedBasicMatch,
        },
        detailedData: patchedDetailed,
      });

      debugLog.info("Match cache patched via match_push_obj", {
        match_id: pushMatch.match_id,
        status_str: pushMatch.status_str,
      });
    },
    [match_id, queryClient, debugLog],
  );

  const { data, isLoading, error, refetch } = useQuery<{
    summary: TipData[];
    generating?: boolean;
  }>({
    queryKey: ["tips", match_id, user_id, language],
    enabled: enabled && Boolean(match_id && user_id),
    refetchInterval: (query) => {
      if (query.state.data?.generating) return 15_000;
      return false;
    },
    queryFn: async () => {
      if (!match_id || !user_id) {
        throw new Error("Missing match_id or user_id");
      }
      const payload = {
        match_id: Number(match_id),
        user_id,
        language,
        ...(enableTenant &&
          tenantContext?.tenantIdMapping && {
            tenant_id: tenantContext.tenantIdMapping,
          }),
      };
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (effectiveSubscriptionKey) {
        headers["Ocp-Apim-Subscription-Key"] = effectiveSubscriptionKey;
      }
      const res = await fetch("/api/tips", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (res.status === 202) {
        return { summary: [], generating: true };
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch tips: ${res.status} ${text}`);
      }
      const json = await res.json();
      const summary = json.summary || [];
      if (json.team1_full_name || json.team2_full_name) {
        setTeamNames({
          team1: json.team1_full_name,
          team2: json.team2_full_name,
        });
      }
      if (json.updated_at) {
        setUpdatedAt(json.updated_at);
      }
      return { summary };
    },
  });

  const tipsGenerating = data?.generating ?? false;

  const scheduleRetry = useCallback(() => {
    if (retryCountRef.current >= maxRetryAttempts) {
      debugLog.error("Max retry attempts reached", {
        attempts: retryCountRef.current,
      });
      setMaxRetriesReached(true);
      toast.error("Connection failed", {
        description: `Unable to establish live connection after ${maxRetryAttempts} attempts`,
        duration: 5000,
      });
      return;
    }

    const delay = Math.min(
      baseRetryDelay * Math.pow(2, retryCountRef.current),
      8000,
    ); // Exponential backoff, cap at 8s
    retryCountRef.current += 1;

    debugLog.info(
      `Scheduling retry ${retryCountRef.current}/${maxRetryAttempts} in ${delay}ms`,
    );

    retryTimeoutRef.current = window.setTimeout(() => {
      connectSSERef.current();
    }, delay);
  }, [debugLog]);

  const connectSSE = useCallback(() => {
    if (!enableSSE || !apim_url || !tips_broadcast || !match_id || !user_id) {
      debugLog.warn("Skipping SSE connection due to missing prerequisites", {
        enableSSE,
        hasApim: Boolean(apim_url),
        hasTipsBroadcast: Boolean(tips_broadcast),
        match_id,
        user_id,
      });
      return;
    }

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    sseStatusRef.current = "connecting";
    setSseStatus("connecting");
    let url = `${apim_url}${tips_broadcast}/tips${enableTenant && tenantContext?.tenantIdMapping ? `/tenants/${encodeURIComponent(tenantContext.tenantIdMapping)}` : ""}/users/${encodeURIComponent(user_id)}/matches/${encodeURIComponent(match_id)}/language/${encodeURIComponent(language)}`;
    if (effectiveSubscriptionKey) {
      url += `?subscription-key=${encodeURIComponent(effectiveSubscriptionKey)}`;
    }

    debugLog.info("Attempting SSE Connection", {
      match_id,
      language,
      enableSSE,
      hasApim: Boolean(apim_url),
      hasTipsBroadcast: Boolean(tips_broadcast),
    });

    try {
      const es = new EventSource(url);
      eventSourceRef.current = es;

      // Resets the inactivity watchdog; if no ping/event arrives within
      // heartbeatTimeout ms we force a reconnect to avoid zombie connections.
      const resetHeartbeat = () => {
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
        }
        heartbeatTimeoutRef.current = window.setTimeout(() => {
          debugLog.warn(
            "SSE heartbeat timeout — no activity, forcing reconnect",
          );
          es.close();
          eventSourceRef.current = null;
          sseStatusRef.current = "disconnected";
          setSseStatus("disconnected");
          scheduleRetry();
        }, heartbeatTimeout);
      };

      // --- onopen: connection established ---
      es.onopen = () => {
        sseStatusRef.current = "connected";
        setSseStatus("connected");
        const wasRetrying = retryCountRef.current > 0;
        retryCountRef.current = 0;
        setMaxRetriesReached(false);
        resetHeartbeat();
        debugLog.info("SSE Connection Established");

        // Reconnected silently — SSE broadcast icon shows status
      };

      // --- onmessage: unnamed events only (connected ack, ping, error) ---
      es.onmessage = (event) => {
        try {
          const payload: SSEUnnamedMessage = JSON.parse(event.data);

          if (payload.type === "connected") {
            debugLog.info("SSE connected acknowledgment", {
              message: payload.message,
            });
            return;
          }

          if (payload.type === "ping") {
            resetHeartbeat();
            return;
          }

          if (payload.type === "error" || payload.error) {
            toast.error("Live tips error", {
              description:
                payload.message ||
                payload.error?.toString() ||
                "Unknown error occurred",
              duration: 4000,
            });
            return;
          }

          // Backward compatibility: if server sends tips as unnamed events (legacy format)
          const legacyTips = payload.summary || payload.tips;
          if (
            legacyTips &&
            Array.isArray(legacyTips) &&
            legacyTips.length > 0
          ) {
            debugLog.warn("Received tips via unnamed event (legacy format)");
            processTipsPayload(legacyTips);
            return;
          }

          debugLog.warn("Unexpected unnamed SSE message", {
            type: payload.type,
          });
        } catch (err) {
          debugLog.error("Failed to parse unnamed SSE message", {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      };

      // --- Named event: tips_update ---
      es.addEventListener("tips_update", ((event: MessageEvent) => {
        try {
          resetHeartbeat();
          const payload = JSON.parse(event.data);
          debugLog.info("tips_update event received", {
            count: payload.summary?.length,
          });
          processTipsPayload(payload.summary || [], { replaceLive: true });
        } catch (err) {
          debugLog.error("Failed to process tips_update", {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }) as EventListener);

      // --- Named event: match_pulse ---
      es.addEventListener("match_pulse", ((event: MessageEvent) => {
        try {
          resetHeartbeat();
          const payload = JSON.parse(event.data);
          debugLog.info("match_pulse event received", {
            count: payload.summary?.length,
          });
          processTipsPayload(payload.summary || []);
        } catch (err) {
          debugLog.error("Failed to process match_pulse", {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }) as EventListener);

      // --- Named event: match_push_obj ---
      es.addEventListener("match_push_obj", ((event: MessageEvent) => {
        try {
          resetHeartbeat();
          const pushData: MatchPushData = JSON.parse(event.data);
          debugLog.info("match_push_obj event received", {
            match_id: pushData.match?.match_id,
            status: pushData.match?.status_str,
          });
          processMatchPush(pushData);
        } catch (err) {
          debugLog.error("Failed to process match_push_obj", {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }) as EventListener);

      // --- onerror: connection error + auto retry ---
      es.onerror = () => {
        sseStatusRef.current = "error";
        setSseStatus("error");
        debugLog.error("SSE connection encountered an error");
        // Auto retry on error
        scheduleRetry();
      };
    } catch (err) {
      sseStatusRef.current = "error";
      setSseStatus("error");
      debugLog.error("Unable to start SSE", {
        error: err instanceof Error ? err.message : String(err),
      });
      // Auto retry on initialization error
      scheduleRetry();
    }
  }, [
    enableSSE,
    apim_url,
    tips_broadcast,
    match_id,
    user_id,
    language,
    queryClient,
    debugLog,
    scheduleRetry,
    processTipsPayload,
    processMatchPush,
    enableTenant,
    tenantContext?.tenantIdMapping,
    effectiveSubscriptionKey,
  ]);

  const disconnectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      sseStatusRef.current = "disconnected";
      setSseStatus("disconnected");
      debugLog.info("SSE connection closed");

      // Clear heartbeat watchdog
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = null;
      }

      // Clean up recent tip timeouts
      for (const timeoutId of recentTipTimeoutsRef.current.values()) {
        clearTimeout(timeoutId);
      }
      recentTipTimeoutsRef.current.clear();
      setRecentTipIds([]);

      // Clear retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
        retryCountRef.current = 0;
        setMaxRetriesReached(false);
      }
    }
  }, [debugLog]);

  const manualRetry = useCallback(() => {
    // Reset retry count for manual retry
    retryCountRef.current = 0;
    setMaxRetriesReached(false);

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    disconnectSSE();
    connectSSE();
  }, [connectSSE, disconnectSSE]);

  // Stable refs so the effect doesn't re-fire when callbacks get new references
  const connectSSERef = useRef(connectSSE);
  connectSSERef.current = connectSSE;
  const disconnectSSERef = useRef(disconnectSSE);
  disconnectSSERef.current = disconnectSSE;

  const hasData = !!data;
  useEffect(() => {
    if (
      enableSSE &&
      !isLoading &&
      hasData &&
      sseStatusRef.current === "disconnected"
    ) {
      connectSSERef.current();
    }
    return () => {
      disconnectSSERef.current();
    };
  }, [enableSSE, isLoading, hasData]);

  return {
    tips: data?.summary || [],
    tipsGenerating,
    isLoading,
    error,
    refetch,
    connectSSE,
    disconnectSSE,
    manualRetry,
    sseStatus,
    maxRetriesReached,
    teamNames,
    updatedAt,
    recentTipIds,
    isSSEConnected: sseStatus === "connected",
  };
}

export default useGlobalTips;
