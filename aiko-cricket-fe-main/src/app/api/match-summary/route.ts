import { NextRequest, NextResponse } from "next/server";
import { resolveSubscriptionKey } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();

    const isTenantEnabled = process.env.ENABLE_TENANT === "true";

    const apiUrl = isTenantEnabled
      ? `${process.env.APIM_URL}${process.env.TIPS}/tenants/${process.env.TENANT_ID_MAPPING}/influencer`
      : `${process.env.APIM_URL}/${process.env.TIPS}/influencer`;

    const summaryResponse = await fetch(`${apiUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": resolveSubscriptionKey(request),
      },
      body: JSON.stringify(body),
    });

    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      let errorJson;
      try {
        errorJson = errorText ? JSON.parse(errorText) : null;
      } catch {
        errorJson = errorText;
      }
      console.error("Error fetching match summary:", errorJson);
      return NextResponse.json(
        { error: "Failed to fetch match summary", details: errorJson },
        { status: summaryResponse.status },
      );
    }
    const summary_data = await summaryResponse.json();
    return NextResponse.json(summary_data);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
