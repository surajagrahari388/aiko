import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/debug-logger";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();

    // Compatibility mapping: when a client sends match_id 837981
    // the external tips service expects 83798 — remap here.
    try {
      const mid = body?.match_id;
      const midNum = typeof mid === "string" ? Number(mid) : mid;
      if (midNum === 837981) {
        body.match_id = 83798;
      }
    } catch (e) {
      log("Error in match_id remapping:", e);
      // ignore mapping errors
    }

    const tipsResponse = await fetch(
      `${process.env.APIM_URL}/${process.env.TIPS}/tips/players`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": process.env.APIM_SUBSCRIPTION_KEY!,
        },
        body: JSON.stringify(body),
      }
    );

    if (!tipsResponse.ok) {
      const errorText = await tipsResponse.text();
      let errorJson;
      try {
        errorJson = errorText ? JSON.parse(errorText) : null;
      } catch {
        errorJson = errorText;
      }
      console.error("Error fetching player tips data:", errorJson);

      return NextResponse.json(
        { error: "Failed to fetch player tips data", details: errorJson },
        { status: tipsResponse.status }
      );
    }

    const tips_data = await tipsResponse.json();
    return NextResponse.json(tips_data);
  } catch (error) {
    console.error("API route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}