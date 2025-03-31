import { Language } from '../contexts/LanguageContext';
import homeTranslations from './home';
import busTranslations from './bus';
import tabsTranslations from './tabs';
import commonTranslations from './common';
import nearbyTranslations from './nearby';
import settingsTranslations from './settings';
import stopTranslations from './stop';
import transportTranslations from './transport';

// Merge all translations into a single object
const translations: Record<string, Record<Language, string>> = {
  ...homeTranslations,
  ...busTranslations,
  ...tabsTranslations,
  ...commonTranslations,
  ...nearbyTranslations,
  ...settingsTranslations,
  ...stopTranslations,
  ...transportTranslations,
};

export default translations;
