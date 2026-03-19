"use client";

import React from "react";
import { MemoizedReactMarkdown } from "@/components/ui/markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";
import { AnswerDisplayProps } from "@/components/components.props.types";
import { useLanguage } from "@/contexts/language-context";

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({
  className,
  messages,
  isLoading,
}) => {
  const { language } = useLanguage();

  const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
    english: {
      processing: "Processing your question...",
      noResponse: "No response available for this question.",
      assistant: "Assistant",
    },
    hindi: {
      processing: "Processing your question...",
      noResponse: "No response available for this question.",
      assistant: "Assistant",
    },
    hinglish: {
      processing: "Processing your question...",
      noResponse: "No response available for this question.",
      assistant: "Assistant",
    },
    haryanvi: {
      processing: "Processing your question...",
      noResponse: "No response available for this question.",
      assistant: "Assistant",
    },
  };

  const getTranslatedText = (key: string, lang?: string) => {
    if (!lang) return UI_TRANSLATIONS.english[key] || key;
    const langKey = lang.toLowerCase();
    return (
      UI_TRANSLATIONS[langKey]?.[key] || UI_TRANSLATIONS.english[key] || key
    );
  };

  const validMessages = messages.filter(
    (msg) => msg.content && msg.content.trim().length > 0
  );

  if (isLoading) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <div className="flex flex-col items-center space-y-4 p-6">
          {/* Enhanced loading spinner */}
          <div className="relative">
            <div className="w-8 h-8 border-4 border-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          {/* Loading text with skeleton effect */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-foreground">
              {getTranslatedText("processing", language)}
            </p>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3].map((dot) => (
                <div
                  key={dot}
                  className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse"
                  style={{ animationDelay: `${dot * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (validMessages.length === 0) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <div className="text-center">
          <Bot className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            {getTranslatedText("noResponse", language)}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className={cn("space-y-3 pb-4 sm:space-y-6", className)}>
      {validMessages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex w-full",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <div
            className={cn("max-w-[95%] space-y-1 sm:max-w-[90%] sm:space-y-2")}
          >
            <div
              className={cn(
                "rounded-lg px-3 py-2 sm:px-4 sm:py-3",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <MemoizedReactMarkdown
                className={cn("max-w-none wrap-break-word")}
                remarkPlugins={[remarkGfm, remarkMath]}
                components={{
                  th: ({ children }) => (
                    <th className="px-2 py-1 text-left text-xs font-semibold sm:px-3 sm:py-2 sm:text-sm">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm">
                      {children}
                    </td>
                  ),
                }}
              >
                {message.content}
              </MemoizedReactMarkdown>
            </div>{" "}
            {message.role === "assistant" && (
              <div className="text-xs text-muted-foreground">
                {getTranslatedText("assistant", language)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnswerDisplay;
