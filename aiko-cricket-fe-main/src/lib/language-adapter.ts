/**
 * Centralized Language Adapter
 *
 * This is the single source of truth for all language configurations.
 * To add/remove languages, only modify this file.
 */

// Core language configuration interface
export interface LanguageConfig {
  value: string;
  label: string;
  nativeLabel?: string;
  category: "production" | "development";
  enabled: boolean;
  hasAudioSupport: boolean; // Flag to control audio/TTS button visibility
}

// Language categories for different environments
export type LanguageCategory = "production" | "development" | "all";

// Supported language type (auto-generated from config)
export type SupportedLanguage =
  | "english"
  | "hindi"
  | "hinglish"
  | "haryanvi"
  | "punjabi_hindi"
  | "punjabi_script"
  | "telugu"
  | "telugu_english"
  | "tamil"
  | "tamil_english"
  | "british_eng_m"
  | "british_eng_f";


// Central language configuration - MODIFY THIS TO ADD/REMOVE LANGUAGES
const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  // Production Languages
  english: {
    value: "english",
    label: "English",
    nativeLabel: "English",
    category: "production",
    enabled: true,
    hasAudioSupport: true, // English has full audio support
  },
  hindi: {
    value: "hindi",
    label: "Hindi (हिंदी)",
    nativeLabel: "हिंदी",
    category: "production",
    enabled: true,
    hasAudioSupport: true, // Hindi has audio support
  },
  hinglish: {
    value: "hinglish",
    label: "Hinglish",
    nativeLabel: "Hinglish",
    category: "production",
    enabled: false,
    hasAudioSupport: true, // Hinglish has audio support
  },
  haryanvi: {
    value: "haryanvi",
    label: "Haryanvi (हरियाणवी)",
    nativeLabel: "हरियाणवी",
    category: "production",
    enabled: false,
    hasAudioSupport: true, // Haryanvi does not have audio support
  },
  // Development Languages
  punjabi_hindi: {
    value: "punjabi_hindi",
    label: "Punjabi (पंजाबी)",
    nativeLabel: "पंजाबी",
    category: "development",
    enabled: false,
    hasAudioSupport: true, // Punjabi (Hindi) has audio support
  },
  punjabi_script: {
    value: "punjabi_script",
    label: "Punjabi (ਪੰਜਾਬੀ)",
    nativeLabel: "ਪੰਜਾਬੀ",
    category: "development",
    enabled: false,
    hasAudioSupport: true, // Punjabi (Script) has audio support
  },
  telugu: {
    value: "telugu",
    label: "Telugu (తెలుగు)",
    nativeLabel: "తెలుగు",
    category: "production",
    enabled: false,
    hasAudioSupport: true, // Telugu has audio support
  },
  telugu_english: {
    value: "telugu_english",
    label: "Telugu (English)",
    nativeLabel: "English",
    category: "production",
    enabled: false,
    hasAudioSupport: true, // Telugu English has audio support
  },
  tamil: {
    value: "tamil",
    label: "Tamil (தமிழ்)",
    nativeLabel: "தமிழ்",
    category: "production",
    enabled: false,
    hasAudioSupport: true, // Tamil has audio support
  },
  tamil_english: {
    value: "tamil_english",
    label: "Tamil (English)",
    nativeLabel: "English",
    category: "production",
    enabled: false,
    hasAudioSupport: true, // Tamil has audio support
  },
  british_eng_m: {
    value: "british_eng_m",
    label: "Eng (UK,Male)",
    nativeLabel: "English (UK, Male)",
    category: "development",
    enabled: false,
    hasAudioSupport: true, // British English Male has audio support
  },
  british_eng_f: {
    value: "british_eng_f",
    label: "Eng (UK,Female)",
    nativeLabel: "English (UK, Female)",
    category: "development",
    enabled: false,
    hasAudioSupport: true, // British English Female has audio support
  },
};

// Configuration constants
export const LANGUAGE_CONSTANTS = {
  COOKIE_NAME: "preferred-language",
  STORAGE_KEY: "preferred-language",
  DEFAULT_LANGUAGE: "english" as SupportedLanguage,
} as const;

/**
 * Language Adapter Class - Main interface for language operations
 */
export class LanguageAdapter {
  private static instance: LanguageAdapter;
  private configs: Record<SupportedLanguage, LanguageConfig>;

  private constructor() {
    this.configs = LANGUAGE_CONFIGS;
  }

  // Singleton pattern
  public static getInstance(): LanguageAdapter {
    if (!LanguageAdapter.instance) {
      LanguageAdapter.instance = new LanguageAdapter();
    }
    return LanguageAdapter.instance;
  }

  /**
   * Get all languages by category
   */
  getLanguages(
    category: LanguageCategory = "all",
    enabledOnly: boolean = true
  ): LanguageConfig[] {
    const allLanguages = Object.values(this.configs);

    let filtered = allLanguages;

    // Filter by enabled status
    if (enabledOnly) {
      filtered = filtered.filter((lang) => lang.enabled);
    }

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter((lang) => lang.category === category);
    }

    return filtered.sort((a, b) => {
      // Sort production languages first, then by label
      if (a.category !== b.category) {
        return a.category === "production" ? -1 : 1;
      }

      // Custom order for production languages: English, Hindi, Hinglish, Haryanvi
      if (a.category === "production" && b.category === "production") {
        const productionOrder = ["english", "hindi", "hinglish", "haryanvi"];
        const aIndex = productionOrder.indexOf(a.value);
        const bIndex = productionOrder.indexOf(b.value);

        // If both languages are in the custom order, sort by that order
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }

        // If only one is in custom order, prioritize it
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
      }

      // For debug languages or languages not in custom order, sort alphabetically
      return a.label.localeCompare(b.label);
    });
  }

  /**
   * Get production languages only
   */
  getProductionLanguages(enabledOnly: boolean = true): LanguageConfig[] {
    return this.getLanguages("production", enabledOnly);
  }

  /**
   * Get debug languages only
   */
  getDevelopmentLanguages(enabledOnly: boolean = true): LanguageConfig[] {
    return this.getLanguages("development", enabledOnly);
  }

  /**
   * Get language configuration by value
   */
  getLanguageConfig(language: SupportedLanguage): LanguageConfig | undefined {
    return this.configs[language];
  }

  /**
   * Get language label by value
   */
  getLanguageLabel(language: SupportedLanguage): string {
    return this.configs[language]?.label || language;
  }

  /**
   * Get language native label by value
   */
  getLanguageNativeLabel(language: SupportedLanguage): string {
    return (
      this.configs[language]?.nativeLabel || this.getLanguageLabel(language)
    );
  }

  /**
   * Check if language is valid and enabled
   */
  isValidLanguage(language: string): language is SupportedLanguage {
    return (
      language in this.configs &&
      this.configs[language as SupportedLanguage].enabled
    );
  }

  /**
   * Get all valid language values
   */
  getValidLanguageValues(): SupportedLanguage[] {
    return Object.keys(this.configs).filter(
      (lang) => this.configs[lang as SupportedLanguage].enabled
    ) as SupportedLanguage[];
  }

  /**
   * Get language select options for UI components
   */
  getLanguageSelectOptions(
    category: LanguageCategory = "all"
  ): Array<{ value: SupportedLanguage; label: string }> {
    return this.getLanguages(category).map((lang) => ({
      value: lang.value as SupportedLanguage,
      label: lang.label,
    }));
  }

  /**
   * Get language map for display purposes
   */
  getLanguageDisplayMap(
    category: LanguageCategory = "all"
  ): Record<string, string> {
    const languages = this.getLanguages(category);
    const map: Record<string, string> = {};
    for (const lang of languages) {
      map[lang.value] = lang.label;
    }
    return map;
  }

  /**
   * Get default language
   */
  getDefaultLanguage(): SupportedLanguage {
    return LANGUAGE_CONSTANTS.DEFAULT_LANGUAGE;
  }

  /**
   * Get language constants
   */
  getConstants() {
    return LANGUAGE_CONSTANTS;
  }

  /**
   * Get language by category with show all languages flag
   */
  getLanguagesForEnvironment(
    showAllLanguages: boolean = false
  ): LanguageConfig[] {
    if (showAllLanguages) {
      return this.getLanguages("all");
    }
    return this.getLanguages("production");
  }

  /**
   * Check if a language supports audio/TTS functionality
   */
  hasAudioSupport(language: SupportedLanguage): boolean {
    const config = this.getLanguageConfig(language);
    return config?.hasAudioSupport || false;
  }

  /**
   * Check if the current language supports audio (convenience method)
   */
  isAudioSupportedForLanguage(language: string): boolean {
    if (!this.isValidLanguage(language)) {
      return false;
    }
    return this.hasAudioSupport(language);
  }
}

// Export default instance for easy usage
export const languageAdapter = LanguageAdapter.getInstance();

// Re-export constants for backward compatibility
export { LANGUAGE_CONSTANTS as default };