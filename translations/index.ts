import { Language } from '../contexts/LanguageContext';
import busTranslations from './bus';
import commonTranslations from './common';
import homeTranslations from './home';
import nearbyTranslations from './nearby';
import settingsTranslations from './settings';
import stopTranslations from './stop';


const translations: Record<string, Record<Language, string>> = {
  ...busTranslations,
  ...commonTranslations,
  ...homeTranslations,
  ...nearbyTranslations,
  ...settingsTranslations,
  ...stopTranslations,
};

export default translations;
