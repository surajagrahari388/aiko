import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.user_id || !/^[\w-]+$/.test(String(body.user_id))) {
      return NextResponse.json(
        { error: "Invalid user_id parameter" },
        { status: 400 }
      );
    }

    const personalisedtipsResponse = await fetch(
      `${process.env.APIM_URL}/${process.env.PERSONALISED_TIP}/user/${body.user_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": process.env.APIM_SUBSCRIPTION_KEY!,
        },
        body: JSON.stringify(body),
      }
    );

    if (!personalisedtipsResponse.ok) {
      const errorText = await personalisedtipsResponse.text();
      let errorJson;
      try {
        errorJson = errorText ? JSON.parse(errorText) : null;
      } catch {
        errorJson = errorText;
      }
      console.error("Error fetching tips data:", errorJson);
      return NextResponse.json(
        { error: "Failed to fetch tips data", details: errorJson },
        { status: personalisedtipsResponse.status }
      );
    }

    const tips_personalised_data = await personalisedtipsResponse.json();
    return NextResponse.json(tips_personalised_data);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}