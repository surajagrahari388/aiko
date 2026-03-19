import { NextRequest, NextResponse } from "next/server";
import { log } from "@/lib/debug-logger";
import { resolveSubscriptionKey } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();

    // Check if tenant functionality is enabled
    const isTenantEnabled = process.env.ENABLE_TENANT === "true";

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

    // Modify request body based on tenant toggle
    if (!isTenantEnabled) {
      // Remove tenant-specific fields when tenant is disabled
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { tenant_id: _tenant_id, ...bodyWithoutTenant } = body;
      body = bodyWithoutTenant;
    }

    // Construct endpoint URL based on tenant toggle
    const endpoint = isTenantEnabled
      ? `${process.env.APIM_URL}${process.env.TIPS}/tenants/${process.env.TENANT_ID_MAPPING}/tips`
      : `${process.env.APIM_URL}${process.env.TIPS}/tips`;

    const tipsResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": resolveSubscriptionKey(request),
      },
      body: JSON.stringify(body),
    });

    // Forward 202 "tips generating" status so the frontend can distinguish it from 200
    if (tipsResponse.status === 202) {
      const tips_data = await tipsResponse.json();
      return NextResponse.json(tips_data, { status: 202 });
    }

    if (!tipsResponse.ok) {
      const errorText = await tipsResponse.text();
      let errorJson;
      try {
        errorJson = errorText ? JSON.parse(errorText) : null;
      } catch {
        errorJson = errorText;
      }
      console.error("Error fetching tips data:", errorJson);

      return NextResponse.json(
        { error: "Failed to fetch tips data", details: errorJson },
        { status: tipsResponse.status },
      );
    }

    const tips_data = await tipsResponse.json();
    return NextResponse.json(tips_data);
  } catch (error) {
    console.error("API route error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
