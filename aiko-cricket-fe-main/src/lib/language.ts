// Re-export everything from language adapter for backward compatibility
export * from './language-adapter';
export { languageAdapter } from './language-adapter';

// Legacy exports (now using adapter)
import { LANGUAGE_CONSTANTS } from './language-adapter';

export const LANGUAGE_COOKIE = LANGUAGE_CONSTANTS.COOKIE_NAME;
export const LANGUAGE_STORAGE_KEY = LANGUAGE_CONSTANTS.STORAGE_KEY;
export const DEFAULT_LANGUAGE = LANGUAGE_CONSTANTS.DEFAULT_LANGUAGE;
