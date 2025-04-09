import { Language } from '../contexts/LanguageContext';

const settingsTranslations: Record<string, Record<Language, string>> = {
  'settings.title': {
    'en': 'Settings',
    'zh-Hant': '設置',
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
  },
  'settings.crowdPredictions.title': {
    'en': 'Show Crowd Predictions',
    'zh-Hant': '顯示人流預測',
    'zh-Hans': '显示人流预测'
  },
  'settings.crowdPredictions.description': {
    'en': 'Display estimated crowdedness level for buses',
    'zh-Hant': '顯示巴士的預計擠迫程度',
    'zh-Hans': '显示巴士的预计拥挤程度'
  }
};

export default settingsTranslations;
