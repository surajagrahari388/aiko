// Client-side language utilities
export const LANGUAGE_STORAGE_KEY = "preferred-language";
export const DEFAULT_LANGUAGE = "english";

export type SupportedLanguage =
  | "english"
  | "hindi"
  | "hinglish"
  | "haryanvi"
  | "punjabi_hindi"
  | "punjabi_script"
  | "telugu"
  | "british_eng_m"
  | "british_eng_f";

// Client-side functions
export function getLanguageFromStorage(): string {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  try {
    const stored = localStorage?.getItem(LANGUAGE_STORAGE_KEY);
    return stored || DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function setLanguageInStorage(language: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage?.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage errors
  }
}

export function removeLanguageFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage?.removeItem(LANGUAGE_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
