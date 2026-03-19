import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAction } from "next-safe-action/hooks";
import { getStarredQuestionsAction } from "@/server/get-starred-questions";
import { UnstarQuestionAction } from "@/server/personalised-tip";
import { StarredQuestionsResponse } from "@/lib/types";
import { isQuestionStarred } from "@/lib/utils/starred-questions";
import { toast } from "sonner";

interface StarredQuestionsContextType {
  starredQuestions: StarredQuestionsResponse | null;
  isLoading: boolean;
  isQuestionStarred: (messageId: string) => boolean;
  refreshStarredQuestions: () => void;
  unstarQuestion: (conversation_id: string, message_id: string) => void;
  isUnstarring: boolean;
}

const StarredQuestionsContext = createContext<
  StarredQuestionsContextType | undefined
>(undefined);

export const useStarredQuestions = () => {
  const context = useContext(StarredQuestionsContext);
  if (context === undefined) {
    throw new Error(
      "useStarredQuestions must be used within a StarredQuestionsProvider"
    );
  }
  return context;
};

interface StarredQuestionsProviderProps {
  children: ReactNode;
  user_id: string;
  match_id: string;
}

export const StarredQuestionsProvider: React.FC<
  StarredQuestionsProviderProps
> = ({ children, user_id, match_id }) => {
  const [starredQuestions, setStarredQuestions] =
    useState<StarredQuestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUnstarring, setIsUnstarring] = useState(false);

  const { execute: executeGetStarredQuestions } = useAction(
    getStarredQuestionsAction,
    {
      onSuccess: (response) => {
        const starredQuestionsData = response?.data?.data;
        if (starredQuestionsData) {
          setStarredQuestions(starredQuestionsData);
        }
        setIsLoading(false);
      },
      onError: ({ error }) => {
        console.error("Error fetching starred questions:", error);
        setIsLoading(false);
      },
    }
  );

  const { execute: executeUnstarQuestion } = useAction(UnstarQuestionAction, {
    onSuccess: (response) => {
      const data = response?.data as {
        success?: boolean;
        message?: string;
      };
      if (data?.success) {
        toast.success("Removed from My Tips!");
        // Refresh starred questions to ensure consistency
        refreshStarredQuestions();
      } else {
        // Revert optimistic update by refreshing from server
        refreshStarredQuestions();
        toast.error("Failed to unstar question");
      }
      setIsUnstarring(false);
    },
    onError: ({ error }) => {
      console.error("Error unstarring question:", error);
      toast.error("Failed to unstar question");
      // Revert optimistic update by refreshing from server
      refreshStarredQuestions();
      setIsUnstarring(false);
    },
  });

  const refreshStarredQuestions = () => {
    if (user_id && match_id && !isLoading) {
      setIsLoading(true);
      executeGetStarredQuestions({ user_id, match_id });
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user_id && match_id) {
      refreshStarredQuestions();
    }
  }, [user_id, match_id]);

  const checkIsQuestionStarred = (messageId: string): boolean => {
    return isQuestionStarred(starredQuestions, messageId);
  };

  const unstarQuestion = (conversation_id: string, message_id: string) => {
    if (!isUnstarring && starredQuestions) {
      setIsUnstarring(true);
      
      // Optimistic update - immediately remove from local state
      const updatedData = {
        ...starredQuestions,
        data: starredQuestions.data.filter(item => item.message_id !== message_id),
        count: starredQuestions.count - 1
      };
      setStarredQuestions(updatedData);
      
      executeUnstarQuestion({
        conversation_id,
        match_id,
        message_id,
        user_id,
      });
    }
  };

  return (
    <StarredQuestionsContext.Provider
      value={{
        starredQuestions,
        isLoading,
        isQuestionStarred: checkIsQuestionStarred,
        refreshStarredQuestions,
        unstarQuestion,
        isUnstarring,
      }}
    >
      {children}
    </StarredQuestionsContext.Provider>
  );
};