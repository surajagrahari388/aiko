import { NextRequest, NextResponse } from "next/server";
import { resolveSubscriptionKey } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let matchId = searchParams.get("matchId");
    if (!matchId) {
      return NextResponse.json(
        { error: "Missing matchId parameter" },
        { status: 400 },
      );
    }
    if (!/^\d+$/.test(matchId)) {
      return NextResponse.json(
        { error: "Invalid matchId parameter" },
        { status: 400 },
      );
    }

    if (matchId === "837981") {
      matchId = "83798";
    }

    const isTenantEnabled = process.env.ENABLE_TENANT === "true";

    const apiUrl = isTenantEnabled
      ? `${process.env.APIM_URL}${process.env.FANTASY_TENANT}/tenants/${process.env.TENANT_ID_MAPPING}/cricket/matches/${matchId}/players`
      : `${process.env.APIM_URL}${process.env.FANTASY}/cricket/matches/${matchId}/players`;

    const response = await fetch(
      `${apiUrl}`,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": resolveSubscriptionKey(request),
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );
    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = errorText ? JSON.parse(errorText) : null;
      } catch {
        errorJson = errorText;
      }
      console.error("Error fetching players data:", errorJson);
      return NextResponse.json(
        { error: "Failed to fetch players data", details: errorJson },
        { status: response.status },
      );
    }
    const data = await response.json();

    // Normalize: APIM returns `players` per team, but our schema expects `squads`
    if (Array.isArray(data?.teams)) {
      data.teams = data.teams.map(
        (team: { players?: unknown; squads?: unknown; [key: string]: unknown }) => {
          if (Array.isArray(team.squads)) return team;
          if (Array.isArray(team.players)) {
            const { players, ...rest } = team;
            return { ...rest, squads: players };
          }
          return { ...team, squads: [] };
        },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
