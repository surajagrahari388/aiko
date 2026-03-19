"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { FC, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAction } from "next-safe-action/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { voteAction } from "@/server/vote";
import { toast } from "sonner";
import { EmailBasedFeedbackProps } from "@/components/components.props.types";
import { mailSchema } from "@/lib/schemas/qna";
import posthog from "posthog-js";
import { useLanguage } from "@/contexts/language-context";
import { useContext } from "react";
import { TenantContext } from "@/contexts/analytics-context";
import { log } from "@/lib/debug-logger";

const EmailBasedFeedback: FC<EmailBasedFeedbackProps> = ({
  index,
  messages,
  conversation_id,
  user_id,
  stats,
  hasAnyFeedback = false, // Default to false for backward compatibility
}) => {
  const { language } = useLanguage();
  const analytics = useContext(TenantContext);

  const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
    english: {
      feedbackTitle: "Give your feedback",
      feedbackDescription:
        "Help us improve our service by providing feedback on this message.",
      title: "Title",
      titlePlaceholder: "Quality | Accuracy",
      accuracy: "Accuracy",
      quality: "Quality",
      titleDescription: "Please provide a title for your feedback.",
      description: "Description",
      descriptionPlaceholder: "Virat Kohli data is incorrect",
      descriptionDescription: "Please provide a description for your feedback.",
      close: "Close",
      submit: "Submit",
      report: "Report",
    },
    hindi: {
      feedbackTitle: "Give your feedback",
      feedbackDescription:
        "Help us improve our service by providing feedback on this message.",
      title: "Title",
      titlePlaceholder: "Quality | Accuracy",
      accuracy: "Accuracy",
      quality: "Quality",
      titleDescription: "Please provide a title for your feedback.",
      description: "Description",
      descriptionPlaceholder: "Virat Kohli data is incorrect",
      descriptionDescription: "Please provide a description for your feedback.",
      close: "Close",
      submit: "Submit",
      report: "Report",
    },
    hinglish: {
      feedbackTitle: "Give your feedback",
      feedbackDescription:
        "Help us improve our service by providing feedback on this message.",
      title: "Title",
      titlePlaceholder: "Quality | Accuracy",
      accuracy: "Accuracy",
      quality: "Quality",
      titleDescription: "Please provide a title for your feedback.",
      description: "Description",
      descriptionPlaceholder: "Virat Kohli data is incorrect",
      descriptionDescription: "Please provide a description for your feedback.",
      close: "Close",
      submit: "Submit",
      report: "Report",
    },
    haryanvi: {
      feedbackTitle: "Give your feedback",
      feedbackDescription:
        "Help us improve our service by providing feedback on this message.",
      title: "Title",
      titlePlaceholder: "Quality | Accuracy",
      accuracy: "Accuracy",
      quality: "Quality",
      titleDescription: "Please provide a title for your feedback.",
      description: "Description",
      descriptionPlaceholder: "Virat Kohli data is incorrect",
      descriptionDescription: "Please provide a description for your feedback.",
      close: "Close",
      submit: "Submit",
      report: "Report",
    },
  };

  const getTranslatedText = (key: string, lang?: string) => {
    if (!lang) return UI_TRANSLATIONS.english[key] || key;
    const langKey = lang.toLowerCase();
    return (
      UI_TRANSLATIONS[langKey]?.[key] || UI_TRANSLATIONS.english[key] || key
    );
  };
  const { execute, status } = useAction(voteAction, {
    onSuccess: (response) => {
      const data = response?.data as { success?: boolean; message?: string };
      if (data?.success) {
        toast.success(`Feedback sent successfully`);
      } else {
        console.error("Error in sending email", data?.message);
        toast.error(`Error in sending feedback`);
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
        toast.error(`Validation Errors: ${errorDescription}`);
      } else {
        console.error("Error sending message", error);
        toast.error("Error sending message");
      }

      setOpen(false);
    },
  });
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof mailSchema>>({
    resolver: zodResolver(mailSchema),
    defaultValues: {
      title: "Accuracy",
      description: "",
    },
  });
  function onSubmit(values: z.infer<typeof mailSchema>) {
    // Track feedback event
    const feedbackPayload = {
      conversation_id, // This serves as the question identifier
      feedback_type: "custom",
      feedback_title: values.title,
      feedback_description: values.description,
      // TODO: Add question_id, is_faq, faq_category when question metadata is available
      match_id: stats?.matches?.[0]?.match_id?.toString(),
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
      title: values.title,
      description: values.description,
      messages,
      feedback: "custom",
      conversation_id,
      user_id,
      index,
      tournament: stats?.matches?.[0]?.competitions?.title || "others",
      match: stats?.matches?.[0]?.title || "others",
      subtitle_match: stats?.matches?.[0]?.subtitle || "others",
      date: stats?.matches?.[0]?.date_start_ist || "others",
    });
    form.reset();
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        asChild
        className="h-fit p-0"
        disabled={status === "executing" || hasAnyFeedback}
        aria-disabled={status === "executing" || hasAnyFeedback}
      >
        <Button
          variant={"ghost"}
          className="p-0"
          disabled={status === "executing" || hasAnyFeedback}
          aria-disabled={status === "executing" || hasAnyFeedback}
        >
          <Mail
            className="h-5 w-5 duration-200 ease-in-out hover:scale-110 active:scale-90"
            strokeWidth={1}
          />
          <span className="sr-only font-light">
            {getTranslatedText("report", language)}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {getTranslatedText("feedbackTitle", language)}
              </DialogTitle>
              <DialogDescription>
                {getTranslatedText("feedbackDescription", language)}
              </DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getTranslatedText("title", language)}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={getTranslatedText(
                              "titlePlaceholder",
                              language
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Accuracy">
                          {getTranslatedText("accuracy", language)}
                        </SelectItem>
                        <SelectItem value="Quality">
                          {getTranslatedText("quality", language)}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    {getTranslatedText("titleDescription", language)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {getTranslatedText("description", language)}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={getTranslatedText(
                        "descriptionPlaceholder",
                        language
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {getTranslatedText("descriptionDescription", language)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant={"outline"} type="button">
                  {getTranslatedText("close", language)}
                </Button>
              </DialogClose>
              <Button type="submit">
                {getTranslatedText("submit", language)}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailBasedFeedback;
