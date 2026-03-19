"use server";

import { actionClient } from "@/lib/safe-action";
import {
  PersonalizedTipSchema,
  UnstarQuestionSchema,
  GetFavouriteTipsSchema,
} from "@/lib/types";
import { revalidateTag } from "next/cache";

export const PersonalizedTipAction = actionClient
  .inputSchema(PersonalizedTipSchema)
  .action(
    async ({
      parsedInput: { conversation_id, match_id, message_id, question, user_id },
    }) => {
      const isTenantEnabled = process.env.ENABLE_TENANT === "true";
      const personalizedBase = isTenantEnabled
        ? `${process.env.PERSONALISED_TIP}/tenants/${process.env.TENANT_ID_MAPPING}`
        : process.env.PERSONALISED_TIP;
      const link = `${process.env.APIM_URL}${personalizedBase}/favorite-question`;

      const body = {
        conversation_id,
        match_id,
        message_id,
        question,
        user_id,
      };

      const response = await fetch(link, {
        method: "POST",
        body: JSON.stringify(body),
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
          `Failed to create favorite question record: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      revalidateTag("favourite_tips");
      const responseData = await response.json();

      return {
        success: true,
        message: "Favorite question record created successfully",
        record_id: responseData.record_id,
      };
    }
  );

export const UnstarQuestionAction = actionClient
  .inputSchema(UnstarQuestionSchema)
  .action(
    async ({
      parsedInput: { conversation_id, message_id, user_id },
    }) => {
      const isTenantEnabled = process.env.ENABLE_TENANT === "true";
      const personalizedBase = isTenantEnabled
        ? `${process.env.PERSONALISED_TIP}/tenants/${process.env.TENANT_ID_MAPPING}`
        : process.env.PERSONALISED_TIP;
      const link = `${process.env.APIM_URL}${personalizedBase}/favorite-question/user/${user_id}/conversation/${conversation_id}/message/${message_id}`;

      const response = await fetch(link, {
        method: "PATCH",
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
          `Failed to unstar question: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      revalidateTag("favourite_tips");

      return {
        success: true,
        message: "Question unstarred successfully",
      };
    }
  );

export const GetFavouriteTipsAction = actionClient
  .inputSchema(GetFavouriteTipsSchema)
  .action(async ({ parsedInput: { user_id } }) => {
    const isTenantEnabled = process.env.ENABLE_TENANT === "true";
    const personalizedBase = isTenantEnabled
      ? `${process.env.PERSONALISED_TIP}/tenants/${process.env.TENANT_ID_MAPPING}`
      : process.env.PERSONALISED_TIP;
    const link = `${process.env.APIM_URL}${personalizedBase}/user/${user_id}`;

    const response = await fetch(link, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": `${process.env.APIM_SUBSCRIPTION_KEY}`,
      },
      next: { tags: ["favourite_tips"] },
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
        `Failed to fetch favourite tips: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const responseData = await response.json();

    return responseData;
  });