import type { DetailedMatchResponse } from "@/lib/types";

/**
 * Convert cricket over notation (base-6) to decimal overs.
 * Cricket overs use base-6 for the ball component:
 *   "18.5" means 18 overs and 5 balls = 18 + 5/6 ≈ 18.8333
 *   NOT the decimal 18.5
 */
export function cricketOversToDecimal(overs: string | number): number {
  const str = String(overs);
  const parts = str.split(".");
  const wholeOvers = parseInt(parts[0]) || 0;
  const balls = parts.length > 1 ? parseInt(parts[1]) || 0 : 0;
  return wholeOvers + balls / 6;
}

/** Parse runs and overs from scores_full, e.g. "137/1 (11.3 ov)" → { runs: 137, overs: 11.5 } */
function parseScoresFull(scoresFull?: string): {
  runs: number;
  overs: number;
} | null {
  if (!scoresFull) return null;
  const match = scoresFull.match(/^(\d+)\/\d+\s*\((\d+\.?\d*)\s*ov\)/);
  if (!match) return null;
  return {
    runs: parseInt(match[1]),
    overs: cricketOversToDecimal(match[2]),
  };
}

export function calculateCRR(
  detailedMatchData?: DetailedMatchResponse,
  isLive?: boolean,
): string {
  if (!detailedMatchData?.match?.innings || !isLive) return "";
  const currentInning = detailedMatchData.match.innings.find(
    (i) => i.status === 3,
  );
  if (!currentInning) return "";

  const parsed = parseScoresFull(currentInning.scores_full);
  if (!parsed || parsed.overs === 0) return "";

  return (parsed.runs / parsed.overs).toFixed(2);
}

export function calculateRRR(
  detailedMatchData?: DetailedMatchResponse,
  isLive?: boolean,
): string {
  if (!detailedMatchData?.match?.innings || !isLive) return "";

  const firstInning = detailedMatchData.match.innings.find(
    (i) => i.number === 1,
  );
  const secondInning = detailedMatchData.match.innings.find(
    (i) => i.number === 2,
  );

  // Case 1: 2nd innings is actively in progress
  if (secondInning && secondInning.status === 3) {
    let target: number | null = null;
    const hasTarget =
      secondInning.target &&
      secondInning.target !== "null" &&
      secondInning.target !== null;
    if (hasTarget) {
      target = parseInt(secondInning.target as string);
    } else if (firstInning?.scores) {
      const firstInningsRuns = parseInt(
        firstInning.scores.match(/^(\d+)/)?.[1] || "0",
      );
      target = firstInningsRuns + 1;
    }

    if (!target || target <= 0) return "";

    const parsed = parseScoresFull(secondInning.scores_full);
    const currentRuns = parsed?.runs ?? 0;
    const currentOvers = parsed?.overs ?? 0;

    const remainingRuns = target - currentRuns;
    if (remainingRuns <= 0) return "";

    const maxOvers = parseFloat(secondInning.max_over || "20");
    const remainingOvers = maxOvers - currentOvers;
    if (remainingOvers <= 0) return "";
    const rrr = remainingRuns / remainingOvers;
    return rrr > 0 ? rrr.toFixed(2) : "";
  }

  // Case 2: 1st innings is complete, 2nd hasn't started yet
  if (
    firstInning &&
    (firstInning.status === 2 || firstInning.status === 4) &&
    (!secondInning || secondInning.status !== 3)
  ) {
    const firstInningsRuns = parseInt(
      firstInning.scores?.match(/^(\d+)/)?.[1] || "0",
    );
    const target = firstInningsRuns + 1;
    if (target <= 0) return "";

    const maxOvers = parseFloat(firstInning.max_over || "20");
    if (maxOvers <= 0) return "";
    const rrr = target / maxOvers;
    return rrr > 0 ? rrr.toFixed(2) : "";
  }

  return "";
}
