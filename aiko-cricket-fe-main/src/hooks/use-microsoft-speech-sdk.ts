import { useState, useEffect } from "react";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { toast } from "sonner";
import { log } from "@/lib/debug-logger";

type PlayerType = {
  mute: boolean;
  p: sdk.SpeakerAudioDestination | undefined;
};

type UseMicrosoftSpeechSdkOptions = {
  tipId?: string;
  onMicStart?: (tipId: string) => void;
  onMicStop?: () => void;
};

export function useMicrosoftSpeechSdk(options?: UseMicrosoftSpeechSdkOptions) {
  const { tipId, onMicStart, onMicStop } = options || {};
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRecognizedText, setLastRecognizedText] = useState<string | null>(
    null
  );
  const [player, updatePlayer] = useState<PlayerType>({
    mute: false,
    p: undefined,
  });

  useEffect(() => {
    if (!player.p) return;
    player.p.onAudioEnd = () => {
      log("audio ended");
      updatePlayer((p) => ({ ...p, mute: false }));
      log("calling sttl");
    }; 
  }, [player.p]);

  async function getSpeechToken() {
    const res = await fetch("/api/speechsdk");
    const tokenObj = await res.json();
    return tokenObj;
  }

  async function sttl_no_translation(
    callback: (text: string, language: string) => Promise<void>
  ) {
    if (tipId && onMicStart) {
      onMicStart(tipId);
    }
    setIsListening(true);
    const tokenObj = await getSpeechToken();

    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(
      tokenObj.token,
      tokenObj.region
    );
    const autoDetectSourceLanguageConfig =
      sdk.AutoDetectSourceLanguageConfig.fromLanguages([
        "en-US",
        "en-IN",
        "hi-IN",
        "pa-IN",
      ]);

    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    const speechRecognizer = sdk.SpeechRecognizer.FromConfig(
      speechConfig,
      autoDetectSourceLanguageConfig,
      audioConfig
    );

    speechRecognizer.recognizeOnceAsync(async (result) => {
      setIsListening(false);
      if (onMicStop) {
        onMicStop();
      }
      switch (result.reason) {
        case sdk.ResultReason.RecognizedSpeech:
          log(`RECOGNIZED: Text=${result.text}`);

          // Extract detected language from result object
          let detectedLanguage = "unknown";

          try {
            // Check for direct language property on result
            if (result.language) {
              detectedLanguage = result.language;
              log("Detected language from result.language:", detectedLanguage);
            } else {
              // Fallback to properties-based detection
              detectedLanguage = result.properties?.getProperty(sdk.PropertyId.SpeechServiceConnection_RecoLanguage) ||
                                 result.properties?.getProperty("Language") ||
                                 "unknown";

              // Try JSON result parsing as additional fallback
              const jsonResult = result.properties?.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult);
              if (jsonResult && detectedLanguage === "unknown") {
                const parsed = JSON.parse(jsonResult);
                if (parsed.primaryLanguage?.language) {
                  detectedLanguage = parsed.primaryLanguage.language;
                }
              }
            }

            log("Final detected language:", detectedLanguage);
          } catch (error) {
            console.error("Error getting detected language:", error);
          }

          setLastRecognizedText(result.text);
          await callback(result.text, detectedLanguage);
          break;
        case sdk.ResultReason.NoMatch:
          console.error("NOMATCH: Speech could not be recognized.");
          toast.error(
            "Speech recognition failed: Speech could not be recognized."
          );
          break;
        case sdk.ResultReason.Canceled:
          const cancellation = sdk.CancellationDetails.fromResult(result);
          console.error(`CANCELED: Reason=${cancellation.reason}`);

          if (cancellation.reason === sdk.CancellationReason.Error) {
            console.error(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
            console.error(
              `CANCELED: ErrorDetails=${cancellation.errorDetails}`
            );
            console.error(
              "CANCELED: Did you set the speech resource key and region values?"
            );
            toast.error(
              "Speech recognition failed: Did you set the speech resource key and region values?"
            );
          }
          break;
      }
      speechRecognizer.close();
    });
  }

  async function sttl(
    callback: (text: string, language: string) => Promise<void>
  ) {
    if (tipId && onMicStart) {
      onMicStart(tipId);
    }
    setIsListening(true);
    const tokenObj = await getSpeechToken();

    const speechTranslationConfig =
      sdk.SpeechTranslationConfig.fromAuthorizationToken(
        tokenObj.token,
        tokenObj.region
      );
    speechTranslationConfig.speechRecognitionLanguage = "hi-IN";

    const language = "en";
    speechTranslationConfig.addTargetLanguage(language);

    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
    const translationRecognizer = new sdk.TranslationRecognizer(
      speechTranslationConfig,
      audioConfig
    );

    translationRecognizer.recognizeOnceAsync(async (result) => {
      setIsListening(false);
      if (onMicStop) {
        onMicStop();
      }
      switch (result.reason) {
        case sdk.ResultReason.TranslatedSpeech:
          log(`RECOGNIZED: Text=${result.text}`);
          log(`Translated into [${language}]: ${result.translations.get(language)}`);

          await callback(result.translations.get(language), language);
          break;
        case sdk.ResultReason.NoMatch:
          console.error("NOMATCH: Speech could not be recognized.");
          toast.error(
            "Speech recognition failed: Speech could not be recognized."
          );
          break;
        case sdk.ResultReason.Canceled:
          const cancellation = sdk.CancellationDetails.fromResult(result);
          console.error(`CANCELED: Reason=${cancellation.reason}`);

          if (cancellation.reason === sdk.CancellationReason.Error) {
            console.error(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
            console.error(
              `CANCELED: ErrorDetails=${cancellation.errorDetails}`
            );
            console.error(
              "CANCELED: Did you set the speech resource key and region values?"
            );
            toast.error(
              "Speech recognition failed: Did you set the speech resource key and region values?"
            );
          }
          break;
      }
      translationRecognizer.close();
    });
  }

  async function textToSpeech(textToSpeak: string) {
    const res = await fetch("/api/speechsdk");
    const tokenObj = await res.json();
    const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(
      tokenObj.token,
      tokenObj.region
    );
    const myPlayer = new sdk.SpeakerAudioDestination();
    updatePlayer({ p: myPlayer, mute: true });
    const audioConfig = sdk.AudioConfig.fromSpeakerOutput(myPlayer);
    speechConfig.speechSynthesisLanguage = "hi-IN";

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    synthesizer.speakTextAsync(
      textToSpeak,
      (result) => {
        let text;
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          text = `synthesis finished for "${textToSpeak}".\n`;
          log(text);
        } else if (result.reason === sdk.ResultReason.Canceled) {
          text = `synthesis failed. Error detail: ${result.errorDetails}.\n`;
        }
        synthesizer.close();
      },
      function (err) {
        console.error("Error synthesizing text: ", err);
        synthesizer.close();
      }
    );
  }

  async function handleMute() {
    if (!player.p) return;
    if (player.mute) {
      log("pausing");
      player.p.pause();
      updatePlayer((p) => ({ ...p, mute: false }));
    } else {
      player.p.resume();
      updatePlayer((p) => ({ ...p, mute: true }));
    }
  }

  async function sendSTTFeedback(
    apiUrl: string,
    apimKey: string,
    userId: string,
    userFeedback?: string
  ) {
    if (!lastRecognizedText) {
      toast.error("No speech-to-text result to feedback on.");
      return;
    }

    try {
      const feedbackUrl = `${apiUrl}/feedback/stt`;
      const payload = {
        user_id: userId,
        type: "stt_feedback",
        recognized_text: lastRecognizedText,
        user_feedback: userFeedback || "",
        timestamp: new Date().toISOString(),
      };

      await fetch(feedbackUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": apimKey,
        },
        body: JSON.stringify(payload),
      });

      toast.success("STT feedback sent successfully.");
    } catch (err) {
      console.error("Failed to send STT feedback:", err);
      toast.error("Failed to send STT feedback. Please try again later.");
    }
  }

  return {
    isListening,
    isLoading,
    lastRecognizedText,
    player,
    sttl,
    sttl_no_translation,
    textToSpeech,
    handleMute,
    sendSTTFeedback,
    setIsListening,
    setIsLoading,
  };
}