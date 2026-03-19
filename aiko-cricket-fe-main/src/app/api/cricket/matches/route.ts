import { NextResponse } from "next/server";
import type { Match, SportsMatches } from "@/lib/types";
import { fetchFromApim, injectTenantId } from "@/lib/api-helpers";

export async function GET(req: Request) {
  try {
    const result = await fetchFromApim(
      "/cricket/matches",
      "/api/cricket/matches",
    );

    if (result instanceof NextResponse) return result;

    const data = result.data;

    const version = String(process.env.VERSION || "LITE").toLowerCase().trim();
    const shouldFilter = version === "lite";

    const firstMatchPerCompetition = (matches: Match[]) => {
      const seen = new Set<string>();
      const deduped: Match[] = [];
      for (const m of matches) {
        try {
          const cid = String(m?.competitions?.cid || "");
          if (!seen.has(cid)) {
            seen.add(cid);
            deduped.push(m);
          }
        } catch (e) {
          console.error("[API] error processing match for competition dedupe:", e);
          continue;
        }
      }
      return deduped;
    };

    try {
      const upstreamMatches: Match[] = Array.isArray(data?.matches)
        ? (data.matches as Match[])
        : [];

      const matches = shouldFilter
        ? firstMatchPerCompetition(upstreamMatches)
        : upstreamMatches;

      const responseData = injectTenantId({
        sports: data?.sports || "cricket",
        matches,
      } as SportsMatches);

      return NextResponse.json(responseData);
    } catch (e) {
      console.error("[API] error processing upstream matches:", e);
      return NextResponse.json(injectTenantId(data));
    }
  } catch (error) {
    console.error("[API] /api/cricket/matches error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
