"use client";

import React from "react";
import { RefreshCw, Clock, CheckCircle } from "lucide-react";
import { useMicrosoftSpeechSdk } from "@/hooks/use-microsoft-speech-sdk";
import { toast } from "sonner";
import QuestionInput from "@/components/QnA/question-input";
import QuestionCard from "@/components/QnA/question-card";
import AnswerDialog from "@/components/QnA/answer-dialog";
import { ConversationHistory } from "@/components/QnA/conversation-history";
import { StarredQuestionsProvider } from "@/contexts/starred-questions-context";
import { AskQuestionProps } from "../components.props.types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import FAQSection from "./faq-section";
import posthog from "posthog-js";
import { useLanguage } from "@/contexts/language-context";
import { useContext } from "react";
import { TenantContext } from "@/contexts/analytics-context";
import { log } from "@/lib/debug-logger";
import { Separator } from "../ui/separator";
import { AskQuestionSkeleton } from "@/components/QnA/qna-skeleton";

export default function AskQuestion({
  user_id,
  oddsData,
  players,
  playersLoading,
  playersError,
  qnaState: initialQnaState,
  apim_key,
  apim_url,
  base_conversation_url,
  SHOW_FEEDBACK,
  SHOW_FAVOURITE_TIPS,
  showFAQ = true,
}: AskQuestionProps) {
  const [text, setText] = React.useState("");

  const qnaState = initialQnaState;
  const queueRef = React.useRef<HTMLDivElement | null>(null);
  const [activeQuestionId, setActiveQuestionId] = React.useState<string | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [textFromSpeech, setTextFromSpeech] = React.useState(false);
  const { language } = useLanguage();
  const analytics = useContext(TenantContext);

  const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
    english: {
      emptyQuestion:
        "Empty Question: Please enter a question before adding it to the queue.",
      playersDataUnavailable: "Players data unavailable",
      playersDataMessage:
        "We couldn't load player information right now. Try refreshing the page or check your connection.",
      refresh: "Refresh",
      askMultipleQuestionsMatch: "Ask Multiple Questions",
      askMultipleQuestions: "Ask Multiple Questions",
      addQuestionsToQueue:
        "Add questions to the queue and get answers in the background",
      questionQueue: "Question Queue",
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      noQuestionsYet:
        "No questions in the queue yet. Add your first question above!",
    },
    hindi: {
      emptyQuestion:
        "Empty Question: Please enter a question before adding it to the queue.",
      playersDataUnavailable: "Players data unavailable",
      playersDataMessage:
        "We couldn't load player information right now. Try refreshing the page or check your connection.",
      refresh: "Refresh",
      askMultipleQuestionsMatch: "Ask Multiple Questions",
      askMultipleQuestions: "Ask Multiple Questions",
      addQuestionsToQueue:
        "Add questions to the queue and get answers in the background",
      questionQueue: "Question Queue",
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      noQuestionsYet:
        "No questions in the queue yet. Add your first question above!",
    },
    hinglish: {
      emptyQuestion:
        "Empty Question: Please enter a question before adding it to the queue.",
      playersDataUnavailable: "Players data unavailable",
      playersDataMessage:
        "We couldn't load player information right now. Try refreshing the page or check your connection.",
      refresh: "Refresh",
      askMultipleQuestionsMatch: "Ask Multiple Questions",
      askMultipleQuestions: "Ask Multiple Questions",
      addQuestionsToQueue:
        "Add questions to the queue and get answers in the background",
      questionQueue: "Question Queue",
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      noQuestionsYet:
        "No questions in the queue yet. Add your first question above!",
    },
    haryanvi: {
      emptyQuestion:
        "Empty Question: Please enter a question before adding it to the queue.",
      playersDataUnavailable: "Players data unavailable",
      playersDataMessage:
        "We couldn't load player information right now. Try refreshing the page or check your connection.",
      refresh: "Refresh",
      askMultipleQuestionsMatch: "Ask Multiple Questions",
      askMultipleQuestions: "Ask Multiple Questions",
      addQuestionsToQueue:
        "Add questions to the queue and get answers in the background",
      questionQueue: "Question Queue",
      pending: "Pending",
      processing: "Processing",
      completed: "Completed",
      noQuestionsYet:
        "No questions in the queue yet. Add your first question above!",
    },
  };

  const getTranslatedText = (key: string, lang?: string) => {
    if (!lang) return UI_TRANSLATIONS.english[key] || key;
    const langKey = lang.toLowerCase();
    return (
      UI_TRANSLATIONS[langKey]?.[key] || UI_TRANSLATIONS.english[key] || key
    );
  };

  const {
    isListening,
    isLoading,
    sttl_no_translation,
    setIsListening,
    sendSTTFeedback,
    lastRecognizedText,
  } = useMicrosoftSpeechSdk();

  const {
    questions,
    addQuestion,
    removeQuestion,
    retryQuestion,
    clearAllQuestions,
    stopQuestion,
  } = qnaState;
  const handleAddQuestion = (
    questionText?: string,
    isFaq?: boolean,
    faqCategory?: string,
    textSource?: "typed" | "voice"
  ) => {
    const questionToAdd = questionText || text;

    if (!questionToAdd.trim()) {
      toast.error(getTranslatedText("emptyQuestion", language));
      return;
    }

    const questionId = addQuestion(
      questionToAdd,
      undefined,
      isFaq,
      faqCategory,
      textSource || (textFromSpeech ? "voice" : "typed")
    );
    setText("");
    setTextFromSpeech(false);

    if (questionId) {
      setActiveQuestionId(questionId);
      // scroll to the queue container smoothly when a question is added
      try {
        queueRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        // then try to scroll to the exact question card
        setTimeout(() => {
          const el = document.getElementById(`question-${questionId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            // focus for accessibility
            (el as HTMLElement).focus?.();
          }
        }, 300);
      } catch (e) {
        // ignore
        console.error(e);
      }
    }
  };

  const handleAskFAQQuestion = (question: string, faqId?: string) => {
    setTextFromSpeech(false);
    handleAddQuestion(question, true, faqId, "typed");
  };

  const handleRemoveQuestion = (questionId: string) => {
    // Close dialog if removing the currently active question
    if (activeQuestionId === questionId) {
      setIsDialogOpen(false);
      setActiveQuestionId(null);
    }
    removeQuestion(questionId);
  };
  const handleClearAllQuestions = () => {
    setIsDialogOpen(false);
    setActiveQuestionId(null);
    clearAllQuestions();
  };

  const navigateToNextQuestion = React.useCallback(() => {
    const completedQuestions = questions.filter(
      (q) => q.status === "completed" && q.messages.length > 0
    );
    const currentIndex = completedQuestions.findIndex(
      (q) => q.id === activeQuestionId
    );
    const nextIndex = (currentIndex + 1) % completedQuestions.length;
    setActiveQuestionId(completedQuestions[nextIndex]?.id || null);
  }, [questions, activeQuestionId]);

  const navigateToPrevQuestion = React.useCallback(() => {
    const completedQuestions = questions.filter(
      (q) => q.status === "completed" && q.messages.length > 0
    );
    const currentIndex = completedQuestions.findIndex(
      (q) => q.id === activeQuestionId
    );
    const prevIndex =
      currentIndex === 0 ? completedQuestions.length - 1 : currentIndex - 1;
    setActiveQuestionId(completedQuestions[prevIndex]?.id || null);
  }, [questions, activeQuestionId]);

  const handleListening = async (
    recognizedText: string,
    detectedLanguage: string
  ) => {
    setIsListening((prev) => !prev);
    setText(recognizedText);
    setTextFromSpeech(true);
    setIsListening((prev) => !prev);

    // Track successful speech recognition with full match context
    const speechEventPayload = {
      recognized_text: recognizedText,
      recognized_text_length: recognizedText.length,
      word_count: recognizedText
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length,
      detected_speech_language: detectedLanguage,
      match_id: oddsData?.matches?.[0]?.match_id,
      match_title: oddsData?.matches?.[0]?.title,
      tournament_title: oddsData?.matches?.[0]?.competitions?.title,
      tournament_season: oddsData?.matches?.[0]?.competitions?.season,
      tournament_type: oddsData?.matches?.[0]?.format_str,
      team1_name: oddsData?.matches?.[0]?.teams?.[0]?.name,
      team2_name: oddsData?.matches?.[0]?.teams?.[1]?.name,
      venue_name: oddsData?.matches?.[0]?.venues?.name,
      venue_country: oddsData?.matches?.[0]?.venues?.country,
      venue_location: oddsData?.matches?.[0]?.venues?.location,
      date_start_ist: oddsData?.matches?.[0]?.date_start_ist,
      pitch_condition: oddsData?.matches?.[0]?.pitch_type,
      weather: oddsData?.matches?.[0]?.weather,
      match_status: oddsData?.matches?.[0]?.status_str,
      language,
      tenant_id: analytics?.tenantId,
      timestamp: Date.now(),
    };
    posthog.capture("speech_recognition_success", speechEventPayload);
    log({
      event_name: "speech_recognition_success",
      payload: speechEventPayload,
    });
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (newText !== text) {
      setTextFromSpeech(false);
    }
  };

  if (oddsData && playersLoading) {
    return <AskQuestionSkeleton />;
  }
  if (oddsData && (playersError || !players)) {
    return (
      <div className="py-8 text-center">
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="bg-card text-card-foreground flex flex-col rounded-xl border py-3 shadow-sm">
            <div className="px-6 py-4">
              <h4 className="text-lg font-semibold">
                {getTranslatedText("playersDataUnavailable", language)}
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {getTranslatedText("playersDataMessage", language)}
              </p>
            </div>
            <div className="px-6 pb-3">
              <Button onClick={() => window.location.reload()}>
                {getTranslatedText("refresh", language)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StarredQuestionsProvider
      user_id={user_id}
      match_id={oddsData?.matches?.[0]?.match_id || ""}
    >
      <section className="relative flex flex-col justify-center gap-4 overflow-hidden bg-background px-3 py-3 md:py-6">
        <div className="absolute left-0 top-3.5 h-6 w-1 rounded-full bg-primary md:top-7" />
        <div className="flex-grow">
          <h4 className="text-lg font-bold text-foreground md:text-xl 2xl:text-2xl">
            {oddsData
              ? getTranslatedText("askMultipleQuestionsMatch", language)
              : getTranslatedText("askMultipleQuestions", language)}
          </h4>
          <p className="text-xs text-muted-foreground md:text-sm 2xl:text-base">
            {getTranslatedText("addQuestionsToQueue", language)}
          </p>
        </div>
        {/* Unified FAQ + Question Input Card */}
        <Card className="w-full">
          {/* FAQ Section (optional) */}
          {showFAQ && (
            <>
              <FAQSection
                oddsData={oddsData}
                onAskQuestion={handleAskFAQQuestion}
                isEmbedded={true}
              />
              <div className="flex justify-center w-4/5 mx-auto">
                <Separator />
              </div>
            </>
          )}

          {/* Question Input Section */}
          <QuestionInput
            text={text}
            setText={handleTextChange}
            isListening={isListening}
            isLoading={isLoading}
            onMicClick={() => sttl_no_translation(handleListening)}
            onAddQuestion={handleAddQuestion}
            onClearAllQuestions={handleClearAllQuestions}
            questionsLength={questions.length}
            sendSTTFeedback={sendSTTFeedback}
            apim_url={apim_url}
            apim_key={apim_key}
            user_id={user_id}
            textFromSpeech={textFromSpeech}
            lastRecognizedText={lastRecognizedText}
            SHOW_FEEDBACK={SHOW_FEEDBACK}
            isEmbedded={true}
            oddsData={oddsData}
            onAskFAQQuestion={handleAskFAQQuestion}
            showFAQ={showFAQ}
          />
        </Card>
        {/* Questions Queue */}
        {questions.length > 0 && (
          <div className="space-y-4" ref={queueRef}>
            <div className="flex items-center justify-between">
              <h5 className="text-lg font-semibold">
                {getTranslatedText("questionQueue", language)} (
                {questions.length})
              </h5>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {questions.filter((q) => q.status === "pending").length}{" "}
                  <span className="hidden sm:inline">
                    {getTranslatedText("pending", language)}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  {
                    questions.filter((q) => q.status === "processing").length
                  }{" "}
                  <span className="hidden sm:inline">
                    {getTranslatedText("processing", language)}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {
                    questions.filter((q) => q.status === "completed").length
                  }{" "}
                  <span className="hidden sm:inline">
                    {getTranslatedText("completed", language)}
                  </span>
                </span>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mx-auto px-2">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  data-question-id={question.id}
                  id={`question-${question.id}`}
                  tabIndex={-1}
                  className={""}
                >
                  <QuestionCard
                    question={question}
                    index={index}
                    active={activeQuestionId === question.id}
                    onStop={stopQuestion}
                    onRetry={retryQuestion}
                    onRemove={handleRemoveQuestion}
                    onViewAnswer={(id: string) => {
                      setActiveQuestionId(id);
                      setIsDialogOpen(true);
                    }}
                    sendFeedback={qnaState.sendFeedback}
                    matchId={oddsData?.matches?.[0]?.match_id}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Answer Modal Dialog */}
        <AnswerDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          questions={questions}
          activeQuestionId={activeQuestionId}
          user_id={user_id}
          stats={oddsData}
          navigateToPrevQuestion={navigateToPrevQuestion}
          navigateToNextQuestion={navigateToNextQuestion}
          SHOW_FAVOURITE_TIPS={SHOW_FAVOURITE_TIPS}
        />
        {/* Conversation History */}
        <div className="mt-4">
          <ConversationHistory
            user_id={user_id}
            match_id={
              oddsData?.matches?.[0]?.match_id || ""
            }
            apim_key={apim_key}
            apim_url={apim_url}
            base_conversation_url={base_conversation_url}
            stats={oddsData}
            SHOW_FAVOURITE_TIPS={SHOW_FAVOURITE_TIPS}
          />
        </div>
      </section>
    </StarredQuestionsProvider>
  );
}
