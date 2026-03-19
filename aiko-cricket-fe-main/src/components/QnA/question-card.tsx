import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StopCircle, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionCardProps } from "@/components/components.props.types";
import {
  QuestionStatus,
  getStatusIcon,
} from "@/components/components.functions";
import posthog from "posthog-js";
import { useLanguage } from "@/contexts/language-context";
import { useContext } from "react";
import { log } from "@/lib/debug-logger";
import { TenantContext } from "@/contexts/analytics-context";

export const getStatusBadgeVariant = (status: QuestionStatus) => {
  switch (status) {
    case "pending":
      return "secondary";
    case "processing":
      return "default";
    case "completed":
      return "default";
    case "error":
      return "outlineDestructive";
    default:
      return "secondary";
  }
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  active,
  onStop,
  onRetry,
  onRemove,
  onViewAnswer,
  sendFeedback,
  matchId,
}) => {
  const { language } = useLanguage();
  const analytics = useContext(TenantContext);

  const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
    english: {
      pending: "Waiting",
      processing: "In progress",
      completed: "Done",
      error: "Error",
      unknown: "Unknown",
      report: "Report",
      viewAnswer: "See Answer",
    },
    hindi: {
      pending: "Waiting",
      processing: "In progress",
      completed: "Done",
      error: "Error",
      unknown: "Unknown",
      report: "Report",
      viewAnswer: "See Answer",
    },
    hinglish: {
      pending: "Waiting",
      processing: "In progress",
      completed: "Done",
      error: "Error",
      unknown: "Unknown",
      report: "Report",
      viewAnswer: "See Answer",
    },
    haryanvi: {
      pending: "Waiting",
      processing: "In progress",
      completed: "Done",
      error: "Error",
      unknown: "Unknown",
      report: "Report",
      viewAnswer: "See Answer",
    }
  };

  const getTranslatedText = (key: string, lang?: string) => {
    if (!lang) return UI_TRANSLATIONS.english[key] || key;
    const langKey = lang.toLowerCase();
    return (
      UI_TRANSLATIONS[langKey]?.[key] || UI_TRANSLATIONS.english[key] || key
    );
  };

  const getLocalizedStatusText = (status: QuestionStatus) => {
    return getTranslatedText(status, language);
  };

  const handleViewAnswer = (questionId: string) => {
    // Track the impression event
    const impressionPayload = {
      question_id: question.id,
      question_text: question.text,
      question_status: question.status,
      conversation_id: question.conversation_id,
      tenant_id: analytics?.tenantId,
      language,
      question_index: index,
      has_error: !!question.error,
      messages_count: question.messages.length,
      match_id: matchId,
    };

    posthog.capture("qna_impression", impressionPayload);
    log({
      event_name: "qna_impression",
      payload: impressionPayload,
    });

    // Call the original onViewAnswer function
    onViewAnswer(questionId);
  };
  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        active && "ring-2 ring-primary"
      )}
    >
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Q{index + 1}
            </span>
            <Badge
              variant={getStatusBadgeVariant(question.status)}
              className="text-xs"
            >
              {getStatusIcon(question.status)}
              <span className="ml-1">
                {getLocalizedStatusText(question.status)}
              </span>
            </Badge>
          </div>
          <div className="flex gap-1">
            {question.status === "processing" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStop(question.id)}
                className="h-6 w-6 p-0"
              >
                <StopCircle className="h-3 w-3" />
              </Button>
            )}
            {question.status === "error" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRetry(question.id)}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(question.id)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <p className="mb-3 line-clamp-3 text-sm text-foreground">
          {question.text}
        </p>
        {question.error && (
          <div className="mb-2 rounded bg-red-100 p-3 text-xs text-red-600 dark:bg-red-800/20 dark:text-red-400 flex items-center justify-center gap-1.5">
            <div className="mb-2">
              {question.error}
            </div>
            {question.error_details && (
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => sendFeedback?.(question.id)}
                  disabled={question.feedbackSent}
                  className="text-xs"
                >
                  {getTranslatedText("report", language)}
                </Button>
              </div>
            )}
          </div>
        )}
        {question.status === "completed" && question.messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewAnswer(question.id)}
            className="w-full text-xs"
          >
            {getTranslatedText("viewAnswer", language)}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
