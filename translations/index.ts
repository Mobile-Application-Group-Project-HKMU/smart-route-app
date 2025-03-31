import { Language } from '../contexts/LanguageContext';
import busTranslations from './bus';
import commonTranslations from './common';
import homeTranslations from './home';
import nearbyTranslations from './nearby';
import settingsTranslations from './settings';
import stopTranslations from './stop';
import transportTranslations from './transport';

const translations: Record<string, Record<Language, string>> = {
  ...busTranslations,
  ...commonTranslations,
  ...homeTranslations,
  ...nearbyTranslations,
  ...settingsTranslations,
  ...stopTranslations,
  ...transportTranslations,
};

export default translations;
