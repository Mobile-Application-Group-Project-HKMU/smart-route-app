import { Language } from '../contexts/LanguageContext';

const settingsTranslations: Record<string, Record<Language, string>> = {
  'settings.title': {
    'en': 'Settings',
    'zh-Hant': '設定',
    'zh-Hans': '设置'
  },
  'settings.language': {
    'en': 'Language',
    'zh-Hant': '語言',
    'zh-Hans': '语言'
  },
  'settings.return': {
    'en': 'Return to Home',
    'zh-Hant': '返回主頁',
    'zh-Hans': '返回主页'
  }
};

export default settingsTranslations;
