import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { resolveSubscriptionKey } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const hasCustomerKey = request.headers.has("ocp-apim-subscription-key");

    // Skip session check when a customer-provided subscription key is present (embed usage).
    // APIM validates the key server-side, so invalid keys get 401/403 from APIM.
    if (!hasCustomerKey) {
      const session = await auth();
      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const ttsLink = `${process.env.APIM_URL}/${process.env.TIPS}/tips/audio`;

    const requestBody = await request.json();
    const ttsResponse = await fetch(ttsLink, {
      method: "POST",
      body: JSON.stringify({
        match_id: Number(requestBody.match_id),
        tip_id: requestBody.tip_id,
        summary: requestBody.summary,
        language: requestBody.language,
      }),
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": resolveSubscriptionKey(request),
      },
    });

    if (!ttsResponse.ok) {
      const error = await ttsResponse.json();
      console.error("Error fetching TTS data:", error);

      // Return the specific message from the backend if available
      const errorMessage = error?.message || "Failed to fetch TTS data";
      return NextResponse.json(
        { error: errorMessage },
        { status: ttsResponse.status }
      );
    }

    const audio = await ttsResponse.json();

    return NextResponse.json({ audio: audio.audio }, { status: 200 });
  } catch (error) {
    console.error("API route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}