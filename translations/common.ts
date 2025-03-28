import { Language } from '../contexts/LanguageContext';

const commonTranslations: Record<string, Record<Language, string>> = {
  'app.name': {
    'en': 'Smart KMB App',
    'zh-Hant': '智能九巴應用',
    'zh-Hans': '智能九巴应用'
  },
  'error.generic': {
    'en': 'Error',
    'zh-Hant': '錯誤',
    'zh-Hans': '错误'
  },
  'error.load.arrival': {
    'en': 'Failed to load arrival times',
    'zh-Hant': '無法加載到達時間',
    'zh-Hans': '无法加载到达时间'
  },
  'error.refresh.arrival': {
    'en': 'Failed to refresh arrival times',
    'zh-Hant': '無法刷新到達時間',
    'zh-Hans': '无法刷新到达时间'
  },
  'error.update.favorites': {
    'en': 'Failed to update favorites',
    'zh-Hant': '無法更新收藏',
    'zh-Hans': '无法更新收藏'
  },
  'button.retry': {
    'en': 'Retry',
    'zh-Hant': '重試',
    'zh-Hans': '重试'
  },
  'favorites.add': {
    'en': 'Added to Favorites',
    'zh-Hant': '已新增到收藏',
    'zh-Hans': '已添加到收藏'
  },
  'favorites.remove': {
    'en': 'Removed from Favorites',
    'zh-Hant': '已從收藏中移除',
    'zh-Hans': '已从收藏中移除'
  },
  'favorites.add.description': {
    'en': 'This item has been added to your favorites.',
    'zh-Hant': '此項目已新增至您的收藏。',
    'zh-Hans': '此项目已添加至您的收藏。'
  },
  'favorites.remove.description': {
    'en': 'This item has been removed from your favorites.',
    'zh-Hant': '此項目已從您的收藏中移除。',
    'zh-Hans': '此项目已从您的收藏中移除。'
  },
  'navigate': {
    'en': 'Navigate',
    'zh-Hant': '導航',
    'zh-Hans': '导航'
  },
};

export default commonTranslations;
