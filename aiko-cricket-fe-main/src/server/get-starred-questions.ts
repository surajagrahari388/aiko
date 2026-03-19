"use server";

import { actionClient } from "@/lib/safe-action";
import { StarredQuestionsResponse } from "@/lib/types";
import { z } from "zod";

const GetStarredQuestionsSchema = z.object({
  user_id: z.string(),
  match_id: z.string(),
});

export const getStarredQuestionsAction = actionClient
  .inputSchema(GetStarredQuestionsSchema)
  .action(async ({ parsedInput: { user_id, match_id } }) => {
    const isTenantEnabled = process.env.ENABLE_TENANT === "true";
    const personalizedBase = isTenantEnabled
      ? `${process.env.PERSONALISED_TIP}/tenants/${process.env.TENANT_ID_MAPPING}`
      : process.env.PERSONALISED_TIP;
    const link = `${process.env.APIM_URL}${personalizedBase}/user/${user_id}/match/${match_id}`;

    const response = await fetch(link, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": `${process.env.APIM_SUBSCRIPTION_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: link,
      });
      throw new Error(
        `Failed to fetch starred questions: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const responseData: StarredQuestionsResponse = await response.json();
    return {
      success: true,
      data: responseData,
    };
  });