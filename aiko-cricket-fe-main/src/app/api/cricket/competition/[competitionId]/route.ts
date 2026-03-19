import { NextResponse } from "next/server";
import { fetchFromApim, injectTenantId } from "@/lib/api-helpers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ competitionId: string }> },
) {
  try {
    const { competitionId } = await params;

    const result = await fetchFromApim(
      `/cricket/competitions/${competitionId}/matches`,
      "/api/cricket/competition",
    );

    if (result instanceof NextResponse) return result;

    const data = injectTenantId(result.data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] /api/cricket/competition error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
