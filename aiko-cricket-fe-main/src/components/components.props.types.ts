import { QuestionItem, useMultiQuestionChat } from "@/hooks/use-multi-question-chat";
import { DataPlayer, Message } from "@/lib/schemas/qna";
import {
  SportsMatches,
} from "@/lib/types";

export interface AnswerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: QuestionItem[];
  activeQuestionId: string | null;
  user_id: string;
  stats?: SportsMatches;
  navigateToPrevQuestion: () => void;
  navigateToNextQuestion: () => void;
  SHOW_FAVOURITE_TIPS?: boolean;
}

export type AnswerDisplayProps = {
  className?: string;
  messages: Message[];
  isLoading: boolean;
};

export interface AskQuestionProps {
  user_id: string;
  oddsData?: SportsMatches;
  players?: DataPlayer | null;
  playersLoading: boolean;
  playersError?: string | null;
  qnaState: ReturnType<typeof useMultiQuestionChat>;
  apim_key: string;
  base_conversation_url: string;
  apim_url: string;
  conversation_id: string;
  showFAQ?: boolean;
  SHOW_FEEDBACK: boolean | undefined;
  SHOW_FAVOURITE_TIPS?: boolean;
}

export type EmailBasedFeedbackProps = {
  messages: Message[];
  index: number;
  conversation_id: string;
  user_id: string;
  stats?: SportsMatches;
  hasAnyFeedback?: boolean; // Add prop to disable when feedback already exists
};

export interface QuestionCardProps {
  question: QuestionItem;
  index: number;
  active: boolean;
  onStop: (id: string) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
  onViewAnswer: (id: string) => void;
  // called when user requests to send detailed feedback for this question
  sendFeedback?: (id: string) => void;
  matchId?: string;
}

export interface QuestionInputProps {
  text: string;
  setText: (text: string) => void;
  isListening: boolean;
  isLoading: boolean;
  onMicClick: () => void;
  onAddQuestion: () => void;
  onClearAllQuestions: () => void;
  questionsLength: number;
  sendSTTFeedback?: (
    apiUrl: string,
    apimKey: string,
    userId: string,
    userFeedback?: string
  ) => void;
  apim_url?: string;
  apim_key?: string;
  user_id?: string;
  textFromSpeech?: boolean;
  lastRecognizedText?: string | null;
  SHOW_FEEDBACK: boolean | undefined;
  isEmbedded?: boolean;
  oddsData?: SportsMatches; // For FAQ suggestions
  onAskFAQQuestion?: (question: string, faqId?: string) => void;
  showFAQ?: boolean;
}

export interface AudioPlayerProps {
  audioBase64?: string;
  className?: string;
  autoPlay?: boolean;
}