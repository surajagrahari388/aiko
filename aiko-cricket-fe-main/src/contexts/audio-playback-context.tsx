"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";

interface AudioPlaybackContextType {
  currentInstanceId: string | null;
  setCurrentInstanceId: (id: string | null) => void;
  stopAllAudio: () => void;
}

const AudioPlaybackContext = createContext<
  AudioPlaybackContextType | undefined
>(undefined);

export const useAudioPlayback = () => {
  const context = useContext(AudioPlaybackContext);
  if (!context) {
    throw new Error(
      "useAudioPlayback must be used within an AudioPlaybackProvider"
    );
  }
  return context;
};

export const AudioPlaybackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentInstanceId, setCurrentInstanceId] = useState<string | null>(
    null
  );

  const stopAllAudio = useCallback(() => {
    setCurrentInstanceId(null);
  }, []);

  const { language } = useLanguage();

  useEffect(() => {
    // Stop all audio when language changes
    stopAllAudio();
  }, [language, stopAllAudio]);

  return (
    <AudioPlaybackContext.Provider
      value={{ currentInstanceId, setCurrentInstanceId, stopAllAudio }}
    >
      {children}
    </AudioPlaybackContext.Provider>
  );
};
