"use client";

import React from "react";
import { X, Copy, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface AnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  answer: string;
  question?: string;
  onCopy?: () => void;
  onSpeak?: () => void;
}

export const AnswerModal: React.FC<AnswerModalProps> = ({
  isOpen,
  onClose,
  answer,
  question,
  onCopy,
  onSpeak,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      onCopy?.();
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div 
        className="bg-background border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <h2 className="text-lg font-semibold text-foreground">
              AI Assistant Answer
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Action buttons */}
            {onSpeak && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSpeak}
                className="h-8 w-8 p-0"
                title="Listen to answer"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0"
              title="Copy answer"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Question section (if provided) */}
        {question && (
          <div className="p-4 bg-muted/20 border-b">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">Q</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground font-medium mb-1">Your Question:</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {question}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Answer content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-medium text-green-600">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground font-medium mb-3">AI Answer:</p>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MarkdownRenderer 
                  content={answer}
                  style={{
                    lineHeight: '1.6',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/20">
          <div className="text-xs text-muted-foreground">
            Powered by Aiko
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
