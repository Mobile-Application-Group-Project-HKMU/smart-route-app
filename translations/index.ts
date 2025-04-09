import homeTranslations from './home';
import { planTranslations } from './plan';
import stopTranslations from './stop';
import tabsTranslations from './tabs';
import mtrTranslations from './mtr';
import settingsTranslations from './settings';
import busTranslations from './bus';
import nearbyTranslations from './nearby';
import achievementsTranslations from './achievements';

// Merge all translations
export const translations = {
  ...homeTranslations,
  ...settingsTranslations,
  ...busTranslations,
  ...stopTranslations,
  ...nearbyTranslations,
  ...planTranslations,
  ...tabsTranslations,
  ...mtrTranslations,
  ...achievementsTranslations,

  
};

// Export types for type safety
export type TranslationKey = keyof typeof translations;
export type LanguageCode = 'en' | 'zh-Hant' | 'zh-Hans';
