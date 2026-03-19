import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/language-context";

interface STTFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recognizedText: string;
  onSendFeedback: (userFeedback: string) => void;
  isLoading?: boolean;
}

const STTFeedbackDialog: React.FC<STTFeedbackDialogProps> = ({
  open,
  onOpenChange,
  recognizedText,
  onSendFeedback,
  isLoading = false,
}) => {
  const { language } = useLanguage();
  const [userFeedback, setUserFeedback] = useState("");

  const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
    english: {
      title: "Provide Speech to Text Feedback",
      description: "Help us improve our speech-to-text recognition by providing feedback on the recognized text.",
      recognizedText: "Recognized Text:",
      yourFeedback: "Your Feedback (Optional):",
      placeholder: "Tell us what was wrong with the recognition, or what you expected to hear...",
      cancel: "Cancel",
      sendFeedback: "Send Feedback",
      sending: "Sending...",
    },
    hindi: {
      title: "Provide Speech to Text Feedback",
      description: "Help us improve our speech-to-text recognition by providing feedback on the recognized text.",
      recognizedText: "Recognized Text:",
      yourFeedback: "Your Feedback (Optional):",
      placeholder: "Tell us what was wrong with the recognition, or what you expected to hear...",
      cancel: "Cancel",
      sendFeedback: "Send Feedback",
      sending: "Sending...",
    },
    hinglish: {
      title: "Provide Speech to Text Feedback",
      description: "Help us improve our speech-to-text recognition by providing feedback on the recognized text.",
      recognizedText: "Recognized Text:",
      yourFeedback: "Your Feedback (Optional):",
      placeholder: "Tell us what was wrong with the recognition, or what you expected to hear...",
      cancel: "Cancel",
      sendFeedback: "Send Feedback",
      sending: "Sending...",
    },
    haryanvi: {
      title: "Provide Speech to Text Feedback",
      description: "Help us improve our speech-to-text recognition by providing feedback on the recognized text.",
      recognizedText: "Recognized Text:",
      yourFeedback: "Your Feedback (Optional):",
      placeholder: "Tell us what was wrong with the recognition, or what you expected to hear...",
      cancel: "Cancel",
      sendFeedback: "Send Feedback",
      sending: "Sending...",
    }
  };

  const getTranslatedText = (key: string, lang?: string) => {
    if (!lang) return UI_TRANSLATIONS.english[key] || key;
    const langKey = lang.toLowerCase();
    return UI_TRANSLATIONS[langKey]?.[key] || UI_TRANSLATIONS.english[key] || key;
  };

  const handleSend = () => {
    onSendFeedback(userFeedback);
    setUserFeedback("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setUserFeedback("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTranslatedText('title', language)}</DialogTitle>
          <DialogDescription>
            {getTranslatedText('description', language)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="recognized-text" className="text-sm font-medium">
              {getTranslatedText('recognizedText', language)}
            </Label>
            <div className="mt-1 p-3 bg-muted rounded-md text-sm">
              {recognizedText}
            </div>
          </div>

          <div>
            <Label htmlFor="user-feedback" className="text-sm font-medium">
              {getTranslatedText('yourFeedback', language)}
            </Label>
            <Textarea
              id="user-feedback"
              placeholder={getTranslatedText('placeholder', language)}
              value={userFeedback}
              onChange={(e) => setUserFeedback(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            {getTranslatedText('cancel', language)}
          </Button>
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? getTranslatedText('sending', language) : getTranslatedText('sendFeedback', language)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default STTFeedbackDialog;
