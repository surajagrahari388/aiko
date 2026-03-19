import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAction } from "next-safe-action/hooks";
import { voteAction } from "@/server/vote";
import { PersonalizedTipAction } from "@/server/personalised-tip";
import { useStarredQuestions } from "@/contexts/starred-questions-context";
import EmailBasedFeedback from "@/components/QnA/email-based-feedback";
import { toast } from "sonner";
import { SportsMatches } from "@/lib/types";
import { Message } from "@/lib/schemas/qna";
import posthog from "posthog-js";
import { useLanguage } from "@/contexts/language-context";
import { useContext } from "react";
import { TenantContext } from "@/contexts/analytics-context";
import { log } from "@/lib/debug-logger";

const UI_TRANSLATIONS = {
  upvote: {
    english: "Upvote",
    hindi: "Upvote",
    hinglish: "Upvote",
    haryanvi: "Upvote"
  },
  downvote: {
    english: "Downvote",
    hindi: "Downvote",
    hinglish: "Downvote",
    haryanvi: "Downvote"
  },
  starQuestion: {
    english: "Click to star question",
    hindi: "Click to star question",
    hinglish: "Click to star question",
    haryanvi: "Click to star question"
  },
  unstarQuestion: {
    english: "Click to unstar question",
    hindi: "Click to unstar question",
    hinglish: "Click to unstar question",
    haryanvi: "Click to unstar question"
  },
  feedbackSentSuccess: {
    english: "Feedback sent successfully",
    hindi: "Feedback sent successfully",
    hinglish: "Feedback sent successfully",
    haryanvi: "Feedback sent successfully"
  },
  errorSendingFeedback: {
    english: "Error in sending feedback",
    hindi: "Error in sending feedback",
    hinglish: "Error in sending feedback",
    haryanvi: "Error in sending feedback"
  },
  questionFavoritedSuccess: {
    english: "Added to My Tips!",
    hindi: "Added to My Tips!",
    hinglish: "Added to My Tips!",
    haryanvi: "Added to My Tips!"
  },
  questionAlreadyFavorited: {
    english: "This question is already in your favorites!",
    hindi: "This question is already in your favorites!",
    hinglish: "This question is already in your favorites!",
    haryanvi: "This question is already in your favorites!"
  },
  errorFavoritingQuestion: {
    english: "Error in favoriting question",
    hindi: "Error in favoriting question",
    hinglish: "Error in favoriting question",
    haryanvi: "Error in favoriting question"
  },
  errorSendingMessage: {
    english: "Error sending message",
    hindi: "Error sending message",
    hinglish: "Error sending message",
    haryanvi: "Error sending message"
  },
  validationErrors: {
    english: "Validation errors:",
    hindi: "Validation errors:",
    hinglish: "Validation errors:",
    haryanvi: "Validation errors:"
  }
};

const Feedback = ({
  className,
  messages,
  index,
  conversation_id,
  user_id,
  stats,
  SHOW_FAVOURITE_TIPS,
}: {
  className?: string;
  messages: Message[];
  index: number;
  conversation_id: string;
  user_id: string;
  stats?: SportsMatches;
  SHOW_FAVOURITE_TIPS?: boolean;
}) => {
  const { language } = useLanguage();
  const analytics = useContext(TenantContext);
  
  // Helper function to get translated text
  const getTranslatedText = (key: string, lang?: string) => {
    const currentLang = lang || language;
    return UI_TRANSLATIONS[key as keyof typeof UI_TRANSLATIONS]?.[currentLang as keyof typeof UI_TRANSLATIONS.upvote] || 
           UI_TRANSLATIONS[key as keyof typeof UI_TRANSLATIONS]?.english || key;
  };
  const { 
    isQuestionStarred: checkIsQuestionStarred, 
    refreshStarredQuestions,
    unstarQuestion,
    isUnstarring
  } = useStarredQuestions();

  const [vote, setVote] = useState<boolean | null>(
    messages[index]?.feedback === true
      ? true
      : messages[index]?.feedback === false
      ? false
      : null
  );

  const [hasVotedLocally, setHasVotedLocally] = useState<boolean>(false);
  const currentMessageId = messages[index]?.id;

  // Favorite state management
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [isProcessingFavorite, setIsProcessingFavorite] = useState<boolean>(false);

  // Check if current question is starred when component mounts or messages change
  useEffect(() => {
    const userMessage = index > 0 ? messages[index - 1] : null;
    if (userMessage && userMessage.role === "user") {
      const isStarred = checkIsQuestionStarred(userMessage.id);
      setIsFavorited(isStarred);
    }
  }, [messages, index, checkIsQuestionStarred]);

  // Toggle favorite function - now supports both starring and unstarring
  const toggleFavorite = () => {
    // Prevent multiple clicks while processing
    if (isProcessingFavorite || isFavoritePending || isUnstarring) return;

    const userMessage = index > 0 ? messages[index - 1] : null;
    if (!userMessage || userMessage.role !== "user") return;

    // Set local processing state immediately
    setIsProcessingFavorite(true);

    if (isFavorited) {
      // Optimistically update local state immediately
      setIsFavorited(false);
      
      // Unstar the question
      unstarQuestion(conversation_id, userMessage.id);
      
      // Track unstar event
      const unstarPayload = {
        conversation_id,
        question_text: userMessage.content,
        question_id: userMessage.id,
        match_id: stats?.matches?.[0]?.match_id,
        match_title: stats?.matches?.[0]?.title,
        tournament_title: stats?.matches?.[0]?.competitions?.title,
        language,
        tenant_id: analytics?.tenantId,
        timestamp: Date.now(),
      };
      posthog.capture("qna_unstar", unstarPayload);
      log({
        event_name: "qna_unstar",
        payload: unstarPayload,
      });
    } else {
      // Optimistically update local state immediately
      setIsFavorited(true);
      
      // Star the question
      executeFavorite({
        conversation_id,
        match_id: stats?.matches?.[0]?.match_id || "",
        message_id: userMessage.id,
        question: userMessage.content,
        user_id,
      });

      // Track star event
      const starPayload = {
        conversation_id,
        question_text: userMessage.content,
        question_id: userMessage.id,
        match_id: stats?.matches?.[0]?.match_id,
        match_title: stats?.matches?.[0]?.title,
        tournament_title: stats?.matches?.[0]?.competitions?.title,
        language,
        tenant_id: analytics?.tenantId,
        timestamp: Date.now(),
      };
      posthog.capture("qna_favorite", starPayload);
      log({
        event_name: "qna_favorite",
        payload: starPayload,
      });
    }
  };

  // Check if feedback already exists in the feedbacks array
  const currentMessage = messages[index];
  const feedbacksArray = Array.isArray(currentMessage?.feedbacks) ? currentMessage.feedbacks : [];
  const hasFeedbacks = feedbacksArray.length > 0;
  const hasUpvoteFeedback = hasFeedbacks && feedbacksArray.some(feedback => feedback?.type === 'upvote');
  const hasDownvoteFeedback = hasFeedbacks && feedbacksArray.some(feedback => feedback?.type === 'downvote');
  const hasAnyFeedback = hasUpvoteFeedback || hasDownvoteFeedback;

  // Update vote state when the message changes, but preserve local votes
  useEffect(() => {
    if (!hasVotedLocally) {
      // First check the new feedbacks array
      if (hasUpvoteFeedback) {
        setVote(true);
      } else if (hasDownvoteFeedback) {
        setVote(false);
      } else {
        // Fallback to the old feedback boolean field for backward compatibility
        const currentFeedback = messages[index]?.feedback;
        setVote(
          currentFeedback === true
            ? true
            : currentFeedback === false
            ? false
            : null
        );
      }
    }
  }, [currentMessageId, hasVotedLocally, messages, index, hasUpvoteFeedback, hasDownvoteFeedback]);

  // Clear local processing state when unstarring completes
  useEffect(() => {
    if (!isUnstarring && isProcessingFavorite) {
      setIsProcessingFavorite(false);
    }
  }, [isUnstarring, isProcessingFavorite]);

  // console.log(messages, index, conversation_id, user_id, stats);

  const { execute, isPending } = useAction(voteAction, {
    onSuccess: (response) => {
      const data = response?.data as {
        success?: boolean;
        message?: string;
        vote?: string;
      };
      if (data?.success) {
        toast.success(getTranslatedText('feedbackSentSuccess', language));
        const newVote =
          data.vote === "custom" ? null : data.vote === "upvote" ? true : false;
        setVote(newVote);
        setHasVotedLocally(true);
      } else {
        console.error("Error in sending feedback", data?.message);
        toast.error(getTranslatedText('errorSendingFeedback', language));
      }
    },
    onError: ({ error }) => {
      if (error.validationErrors) {
        console.error("Validation error", error.validationErrors);
        let errorDescription = "";
        const uniqueErrorMessages = new Set<string>();

        for (const key in error.validationErrors) {
          const errorMessages = (
            error.validationErrors as Record<string, { _errors: string[] }>
          )[key]._errors;
          errorMessages.forEach((message) =>
            uniqueErrorMessages.add(key + ": " + message)
          );
        }

        errorDescription = Array.from(uniqueErrorMessages).join(", \n");
        toast.error(`${getTranslatedText('validationErrors', language)} ${errorDescription}`);
      } else {
        console.error("Error sending message", error);
        toast.error(getTranslatedText('errorSendingMessage', language));
      }
    },
  });

  const { execute: executeFavorite, isPending: isFavoritePending } = useAction(
    PersonalizedTipAction,
    {
      onSuccess: (response) => {
        const data = response?.data as {
          success?: boolean;
          message?: string;
          record_id?: string;
        };
        if (data?.success) {
          setIsFavorited(true); // Set favorited state after successful server call
          toast.success(getTranslatedText('questionFavoritedSuccess', language));
          // Refresh starred questions to keep state in sync
          refreshStarredQuestions();
        } else {
          console.error("Error in favoriting question", data?.message);
          toast.error(getTranslatedText('errorFavoritingQuestion', language));
          // Revert optimistic update
          setIsFavorited(false);
        }
        // Clear local processing state
        setIsProcessingFavorite(false);
      },
      onError: ({ error }) => {
        if (error.validationErrors) {
          console.error("Validation error", error.validationErrors);
          let errorDescription = "";
          const uniqueErrorMessages = new Set<string>();

          for (const key in error.validationErrors) {
            const errorMessages = (
              error.validationErrors as Record<string, { _errors: string[] }>
            )[key]._errors;
            errorMessages.forEach((message) =>
              uniqueErrorMessages.add(key + ": " + message)
            );
          }

          errorDescription = Array.from(uniqueErrorMessages).join(", \n");
          toast.error(`${getTranslatedText('validationErrors', language)} ${errorDescription}`);
        } else {      
          // Check if this is a 409 conflict error for already favorited question
          const errorMessage = error?.serverError || JSON.stringify(error) || '';
          const isAlreadyFavorited = errorMessage.includes('409 Conflict') || 
                                   errorMessage.includes('FAVORITE_QUESTION_ALREADY_EXISTS') ||
                                   errorMessage.includes('already marked as favorite') ||
                                   errorMessage.includes('409') ||
                                   errorMessage.includes('already exists');
          
          if (isAlreadyFavorited) {
            // Question is already favorited, so set the state correctly and show appropriate message
            setIsFavorited(true);
            toast.success(getTranslatedText('questionAlreadyFavorited', language));
            // Refresh starred questions to keep state in sync
            refreshStarredQuestions();
          } else {
            toast.error(getTranslatedText('errorFavoritingQuestion', language));
            // Revert optimistic update
            setIsFavorited(false);
          }
        }
        // Clear local processing state
        setIsProcessingFavorite(false);
      },
    }
  );

  return (
    <div
      className={cn(
        "-mt-1 ml-11 flex w-fit items-center justify-center space-x-2",
        messages[index].role === "assistant" ? "block" : "hidden",
        className
      )}
    >
      <Button
        className={cn(
          "h-fit p-0 duration-200 ease-in-out hover:scale-110 active:scale-90",
          vote ? "fill-foreground disabled:opacity-100" : "fill-none"
        )}
        variant={"ghost"}
        onClick={() => {
          // Track feedback event
          const feedbackPayload = {
            conversation_id, // This serves as the question identifier
            feedback_type: "upvote",
            // TODO: Add question_id, is_faq, faq_category when question metadata is available
            match_id: stats?.matches?.[0]?.match_id,
            match_title: stats?.matches?.[0]?.title,
            tournament_title: stats?.matches?.[0]?.competitions?.title,
            language,
            tenant_id: analytics?.tenantId,
            timestamp: Date.now(),
          };
          posthog.capture("qna_feedback", feedbackPayload);
          log({
            event_name: "qna_feedback",
            payload: feedbackPayload,
          });

          execute({
            messages,
            feedback: "upvote" as const,
            title: "Upvoted",
            description: "User upvoted the message",
            conversation_id,
            user_id,
            index,
            tournament:
              stats?.matches?.[0]?.competitions?.title || "others",
            match: stats?.matches?.[0]?.title || "others",
            subtitle_match: stats?.matches?.[0]?.subtitle || "others",
            date: stats?.matches?.[0]?.date_start_ist || "others",
          });
        }}
        disabled={isPending || vote !== null || hasAnyFeedback}
        aria-label={getTranslatedText('upvote', language)}
        aria-disabled={isPending || vote !== null || hasAnyFeedback}
      >
        <ThumbsUp
          className={cn(
            "h-5 w-5",
            vote ? "fill-foreground disabled:opacity-100" : "fill-none"
          )}
          strokeWidth={1}
        />
      </Button>
      <Button
        variant={"ghost"}
        className={cn(
          "h-fit p-0 duration-200 ease-in-out hover:scale-110 active:scale-90",
          vote === false ? "fill-foreground disabled:opacity-100" : "fill-none"
        )}
        onClick={() => {
          // Track feedback event
          const feedbackPayload = {
            conversation_id, // This serves as the question identifier
            feedback_type: "downvote",
            // TODO: Add question_id, is_faq, faq_category when question metadata is available
            match_id: stats?.matches?.[0]?.match_id,
            match_title: stats?.matches?.[0]?.title,
            tournament_title: stats?.matches?.[0]?.competitions?.title,
            language,
            tenant_id: analytics?.tenantId,
            timestamp: Date.now(),
          };
          posthog.capture("qna_feedback", feedbackPayload);
          log({
            event_name: "qna_feedback",
            payload: feedbackPayload,
          });

          execute({
            messages,
            feedback: "downvote" as const,
            title: "Downvoted",
            description: "User downvote the message",
            conversation_id,
            user_id,
            index,
            tournament:
              stats?.matches?.[0]?.competitions?.title || "others",
            match: stats?.matches?.[0]?.title || "others",
            subtitle_match: stats?.matches?.[0]?.subtitle || "others",
            date: stats?.matches?.[0]?.date_start_ist || "others",
          });
        }}
        disabled={isPending || vote !== null || hasAnyFeedback}
        aria-label={getTranslatedText('downvote', language)}
        aria-disabled={isPending || vote !== null || hasAnyFeedback}
      >
        <ThumbsDown
          className={cn(
            "h-5 w-5",
            vote === false
              ? "fill-foreground disabled:opacity-100"
              : "fill-none"
          )}
          strokeWidth={1}
        />
      </Button>
      <EmailBasedFeedback
        messages={messages}
        index={index}
        conversation_id={conversation_id}
        user_id={user_id}
        stats={stats}
        hasAnyFeedback={hasAnyFeedback}
      />
      {SHOW_FAVOURITE_TIPS && (
        <Button
          variant={"ghost"}
          className={cn(
            "h-fit p-0 duration-200 ease-in-out hover:scale-110 active:scale-90",
            isFavorited ? "fill-yellow-500 text-yellow-500" : "fill-none"
          )}
          onClick={toggleFavorite}
          disabled={isProcessingFavorite || isFavoritePending || isUnstarring}
          aria-label={
            isFavorited 
              ? getTranslatedText('unstarQuestion', language)
              : getTranslatedText('starQuestion', language)
          }
          aria-disabled={isProcessingFavorite || isFavoritePending || isUnstarring}
        >
          <Star
            className={cn(
              "h-5 w-5",
              isFavorited ? "fill-yellow-500 text-yellow-500" : "fill-none"
            )}
            strokeWidth={1}
          />
        </Button>
      )}
    </div>
  );
};

export default Feedback;







