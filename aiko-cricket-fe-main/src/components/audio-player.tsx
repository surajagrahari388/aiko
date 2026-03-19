"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useAudioPlayback } from "@/contexts/audio-playback-context";
import { Button } from "@/components/ui/button";
import { Loader2, Pause, Play, StopCircle } from "lucide-react";
import { AudioPlayerProps } from "@/components/components.props.types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBase64,
  className,
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const instanceId = useRef<string>(
    `${Math.random().toString(36).slice(2)}-${Date.now()}`
  );
  const { currentInstanceId, setCurrentInstanceId } = useAudioPlayback();
  const isPlayingRef = useRef(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Effect to create and manage the audio element whenever audioBase64 changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = ""; // Detach the old source
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    setIsReady(false);

    if (audioBase64) {
      const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
      audioRef.current = audio;

      const handleReady = () => setIsReady(true);
      const handleError = () => {
        setIsPlaying(false);
        setError("An error occurred while loading the audio.");
      };

      // Use 'oncanplay' as a reliable event for readiness
      audio.addEventListener("canplay", handleReady);
      audio.addEventListener("ended", () => setIsPlaying(false));
      audio.addEventListener("error", handleError);

      // Preload the metadata to trigger the readiness events
      audio.load();

      // Cleanup function to remove event listeners
      return () => {
        if (audio) {
          audio.pause(); // Pause audio on cleanup to prevent continued playback
          audio.removeEventListener("canplay", handleReady);
          audio.removeEventListener("ended", () => setIsPlaying(false));
          audio.removeEventListener("error", handleError);
        }
      };
    }
  }, [audioBase64]);

  const playAudio = useCallback(() => {
    // Guards to prevent invalid state
    if (!isReady || !audioRef.current || !audioRef.current.paused) {
      return;
    }

    // Set this instance as the currently playing one
    setCurrentInstanceId(instanceId.current);
    setError(null);

    // Call .play() IMMEDIATELY. It returns a promise.
    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      setIsLoading(true); // Set loading state while waiting for the promise

      playPromise
        .then(() => {
          // Success! Playback has started.
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Audio playback error:", err);
          // Check for the specific error browsers throw for autoplay blocks
          if (err.name === "NotAllowedError") {
            setError("Playback blocked by browser. Please click again.");
          } else {
            setError("Failed to play audio.");
          }
          setIsPlaying(false);
        })
        .finally(() => {
          // Whether it succeeded or failed, it's no longer loading.
          setIsLoading(false);
        });
    }
  }, [isReady, setCurrentInstanceId]);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  // Pause if another instance starts playing
  useEffect(() => {
    if (
      isPlayingRef.current &&
      currentInstanceId !== null &&
      currentInstanceId !== instanceId.current
    ) {
      pauseAudio();
    }
  }, [currentInstanceId, pauseAudio]);

  const handleAudioToggle = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, pauseAudio, playAudio]);

  // Effect to handle autoPlay
  useEffect(() => {
    if (autoPlay && isReady) {
      playAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, isReady]);

  if (!audioBase64) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-0.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAudioToggle}
                disabled={isLoading || !isReady}
                className="h-6 px-2 flex items-center gap-0.5 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
                {/* <span>{isPlaying ? "Pause Audio" : "Play Audio"}</span> */}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPlaying ? "Pause Audio" : "Play Audio"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={stopAudio}
                disabled={isLoading || !isPlaying}
                className="h-6 px-2 flex items-center gap-0.5 text-xs font-medium text-primary hover:text-primary/80 hover:bg-primary/10 transition-all duration-200"
              >
                <StopCircle className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Stop Audio</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {error && (
        <div className="text-sm text-red-600 mt-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
