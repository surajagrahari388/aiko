"use client"
import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { type SupportedLanguage, DEFAULT_LANGUAGE, LANGUAGE_COOKIE } from "@/lib/language"
import { getLanguageFromStorage, setLanguageInStorage } from "@/lib/language-client"
import { languageAdapter } from "@/lib/language-adapter"

interface LanguageContextType {
  language: SupportedLanguage
  setLanguage: (language: SupportedLanguage) => void
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
  initialLanguage?: string
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE as SupportedLanguage)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize language from localStorage or server-side initial value
  useEffect(() => {
    const storedLanguage = getLanguageFromStorage()
    const candidate = storedLanguage !== DEFAULT_LANGUAGE ? storedLanguage : initialLanguage || DEFAULT_LANGUAGE
    const finalLanguage = languageAdapter.isValidLanguage(candidate)
      ? candidate
      : DEFAULT_LANGUAGE as SupportedLanguage

    setLanguageState(finalLanguage)
    setLanguageInStorage(finalLanguage)
    setIsLoading(false)
  }, [initialLanguage])

  // Debounced setter to prevent rapid changes
  const setLanguage = useCallback((newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage)
    setLanguageInStorage(newLanguage)

    // Also set cookie for server-side consistency
    if (typeof document !== 'undefined') {
      try {
        document.cookie = `${LANGUAGE_COOKIE}=${newLanguage}; max-age=${365 * 24 * 60 * 60}; path=/; samesite=lax${
          process.env.NODE_ENV === "production" ? "; secure" : ""
        }`
      } catch {
        // Ignore cookie errors
      }
    }
  }, [])

  const value = {
    language,
    setLanguage,
    isLoading,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

// Custom hook for easy language switching
export function useLanguageSwitch() {
  const { setLanguage } = useLanguage()
  return (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage)
    // Optional: You can also update URL searchParams here if needed
    // const url = new URL(window.location.href);
    // url.searchParams.set('language', newLanguage);
    // window.history.replaceState({}, '', url.toString());
  }
}
