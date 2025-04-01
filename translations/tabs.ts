import { Language } from '../contexts/LanguageContext';

const tabsTranslations: Record<string, Record<Language, string>> = {
  'tabs.home': {
    'en': 'Home',
    'zh-Hant': '主頁',
    'zh-Hans': '主页'
  },
  'tabs.routes': {
    'en': 'Routes',
    'zh-Hant': '路線',
    'zh-Hans': '路线'
  },
  'tabs.nearby': {
    'en': 'Nearby',
    'zh-Hant': '附近',
    'zh-Hans': '附近'
  },
  'tabs.plan': {
    'en': 'Plan',
    'zh-Hant': '規劃',
    'zh-Hans': '规划'
  }
};

export default tabsTranslations;
