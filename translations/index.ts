
import busTranslations from './bus';
import homeTranslations from './home';
import nearbyTranslations from './nearby';
import { planTranslations } from './plan';
import settingsTranslations from './settings';
import stopTranslations from './stop';

// Merge all translations
export const translations = {
  ...homeTranslations,
  ...settingsTranslations,
  ...busTranslations,
  ...stopTranslations,
  ...nearbyTranslations,
  ...nearbyTranslations,
  ...planTranslations,
};

// Export types for type safety
export type TranslationKey = keyof typeof translations;
export type LanguageCode = 'en' | 'zh-Hant' | 'zh-Hans';
