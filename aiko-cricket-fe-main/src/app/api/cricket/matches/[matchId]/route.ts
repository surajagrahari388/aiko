import { NextResponse } from "next/server";
import { fetchFromApim } from "@/lib/api-helpers";

type RouteContext = {
  params: Promise<{ matchId: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  let matchId: string | undefined;

  if (context && context.params) {
    try {
      const resolvedParams = await context.params;
      matchId = resolvedParams?.matchId;
    } catch (_e) {
      console.error('Error awaiting context.params for matchId', _e);
      matchId = (context.params as unknown as { matchId: string })?.matchId;
    }
  }

  if (!matchId) {
    try {
      const url = new URL(req.url);
      const segments = url.pathname.split("/").filter(Boolean);
      matchId = segments.length ? segments[segments.length - 1] : undefined;
    } catch (e) {
      console.error('Error parsing URL for matchId:', e);
    }
  }

  if (!matchId) {
    return NextResponse.json({ error: 'Missing matchId' }, { status: 400 });
  }

  if (matchId === "837981") {
    matchId = "83798";
  }

  try {
    const result = await fetchFromApim(
      `/cricket/matches/${matchId}?include=true`,
      `/api/cricket/matches/${matchId}`,
    );

    if (result instanceof NextResponse) return result;

    return NextResponse.json(result.data);
  } catch (error) {
    console.error(`[API] /api/cricket/matches/${matchId} error:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
