import { StarredQuestionsResponse } from "@/lib/types";

/**
 * Checks if a specific message/question is starred by the user
 * @param starredQuestions - The response from the starred questions API
 * @param messageId - The message ID to check
 * @returns boolean indicating if the question is starred
 */
export function isQuestionStarred(
  starredQuestions: StarredQuestionsResponse | null,
  messageId: string
): boolean {
  if (!starredQuestions || !starredQuestions.data) {
    return false;
  }

  return starredQuestions.data.some(
    (starredQuestion) => starredQuestion.message_id === messageId
  );
}

/**
 * Checks if a specific conversation has any starred questions
 * @param starredQuestions - The response from the starred questions API
 * @param conversationId - The conversation ID to check
 * @returns boolean indicating if the conversation has starred questions
 */
export function hasStarredQuestionsInConversation(
  starredQuestions: StarredQuestionsResponse | null,
  conversationId: string
): boolean {
  if (!starredQuestions || !starredQuestions.data) {
    return false;
  }

  return starredQuestions.data.some(
    (starredQuestion) => starredQuestion.conversation_id === conversationId
  );
}