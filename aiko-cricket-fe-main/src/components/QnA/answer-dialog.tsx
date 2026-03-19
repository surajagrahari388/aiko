"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AnswerDisplay from "@/components/QnA/answer-display";
import Feedback from "@/components/QnA//feedback";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnswerDialogProps } from "@/components/components.props.types";
import { useLanguage } from "@/contexts/language-context";

const AnswerDialog: React.FC<AnswerDialogProps> = ({
  open,
  onOpenChange,
  questions,
  activeQuestionId,
  user_id,
  stats,
  navigateToPrevQuestion,
  navigateToNextQuestion,
  SHOW_FAVOURITE_TIPS,
}) => {
  const { language } = useLanguage();

  const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
    english: {
      answer: "Answer",
      of: "of",
    },
    hindi: {
      answer: "Answer",
      of: "of",
    },
    hinglish: {
      answer: "Answer",
      of: "of",
    },
    haryanvi: {
      answer: "Answer",
      of: "of",
    }
  };

  const getTranslatedText = (key: string, lang?: string) => {
    if (!lang) return UI_TRANSLATIONS.english[key] || key;
    const langKey = lang.toLowerCase();
    return UI_TRANSLATIONS[langKey]?.[key] || UI_TRANSLATIONS.english[key] || key;
  };

  const activeQuestion = questions.find((q) => q.id === activeQuestionId);
  const completedQuestions = questions.filter(
    (q) => q.status === "completed" && q.messages.length > 0
  );
  const currentIndex = completedQuestions.findIndex(
    (q) => q.id === activeQuestionId
  );
  const showNavigation = completedQuestions.length > 1 && currentIndex !== -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mx-2 flex h-[85vh] max-h-[85vh] flex-col overflow-hidden p-0 sm:mx-4 lg:h-[90vh] lg:max-h-[90vh] max-w-7xl sm:max-w-3xl w-[95%]">
        <DialogHeader className="flex-shrink-0 border-b p-4 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-semibold sm:text-lg">
                  {activeQuestion
                    ? `Q${
                        questions.findIndex((q) => q.id === activeQuestionId) +
                        1
                      }: ${getTranslatedText('answer', language)}`
                    : getTranslatedText('answer', language)}
                </DialogTitle>
                {showNavigation && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={navigateToPrevQuestion}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {currentIndex + 1} of {completedQuestions.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={navigateToNextQuestion}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              {activeQuestion && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                  {activeQuestion.text}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden p-4 sm:p-6">
          {activeQuestion && (
            <div className="h-full overflow-auto">
              <AnswerDisplay
                key={`answer-${activeQuestion.id}-${activeQuestion.conversation_id}`}
                className="h-full"
                messages={activeQuestion.messages || []}
                isLoading={activeQuestion.status === "processing"}
              />
            </div>
          )}
        </div>
        {activeQuestion &&
          activeQuestion.status !== "processing" &&
          activeQuestion.messages.length >= 2 && (
            <DialogFooter className="flex-shrink-0 border-t p-4 sm:p-6">
              <div className="flex w-full justify-center">
                <Feedback
                  key={`feedback-${activeQuestion.id}-${activeQuestion.conversation_id}`}
                  className="ml-0"
                  conversation_id={activeQuestion.conversation_id || ""}
                  user_id={user_id}
                  messages={activeQuestion.messages}
                  index={activeQuestion.messages.length - 1}
                  stats={stats}
                  SHOW_FAVOURITE_TIPS={SHOW_FAVOURITE_TIPS}
                />
              </div>
            </DialogFooter>
          )}
      </DialogContent>
    </Dialog>
  );
};

export default AnswerDialog;
