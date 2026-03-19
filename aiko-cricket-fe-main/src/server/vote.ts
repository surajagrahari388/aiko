"use server";

import { actionClient } from "@/lib/safe-action";
import { voteSchema } from "@/lib/schemas/qna";

export const voteAction = actionClient
  .inputSchema(voteSchema)
  .action(
    async ({
      parsedInput: {
        messages,
        feedback,
        conversation_id,
        description,
        title,
        user_id,
        index,
        date,
        match,
        tournament,
        subtitle_match,
      },
    }) => {
      const isTenantEnabled = process.env.ENABLE_TENANT === "true";
      const conversationBase = isTenantEnabled
        ? `${process.env.CONVERSATION}/tenants/${process.env.TENANT_ID_MAPPING}`
        : process.env.CONVERSATION;
      const link = `${process.env.APIM_URL}${conversationBase}/feedback/user/${user_id}/conversation/${conversation_id}/message`;

      const slicedMessages = messages.slice(0, index + 1);

      const body = {
        type: feedback,
        title,
        description,
        messages: slicedMessages,
        date,
        match,
        tournament,
        subtitle_match,
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
          `Failed to send feedback: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      return {
        success: true,
        message: "Feedback sent successfully",
        vote: feedback,
      };
    }
  );