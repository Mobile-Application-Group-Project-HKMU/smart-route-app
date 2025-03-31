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

  // Common
  'route': {
    'en': 'Route',
    'zh-Hant': '路線',
    'zh-Hans': '路线'
  },
  'stops': {
    'en': 'Stops',
    'zh-Hant': '站點',
    'zh-Hans': '站点'
  },
  'yourLocation': {
    'en': 'Your Location',
    'zh-Hant': '您的位置',
    'zh-Hans': '您的位置'
  },
  'error': {
    'en': 'Error',
    'zh-Hant': '錯誤',
    'zh-Hans': '错误'
  },
  'sequence': {
    'en': 'Sequence',
    'zh-Hant': '序號',
    'zh-Hans': '序号'
  },
  
  // Service direction
  'inbound': {
    'en': 'Inbound',
    'zh-Hant': '往程',
    'zh-Hans': '往程'
  },
  'outbound': {
    'en': 'Outbound',
    'zh-Hant': '回程',
    'zh-Hans': '回程'
  },
  
  // Service type
  'serviceType': {
    'en': 'Service Type',
    'zh-Hant': '服務類型',
    'zh-Hans': '服务类型'
  },
  
  // Favorites
  'addedToFavorites': {
    'en': 'Added to Favorites',
    'zh-Hant': '已加入收藏',
    'zh-Hans': '已加入收藏'
  },
  'removedFromFavorites': {
    'en': 'Removed from Favorites',
    'zh-Hant': '已從收藏中移除',
    'zh-Hans': '已从收藏中移除'
  },
  'routeAddedToFavorites': {
    'en': 'This route has been added to your favorites.',
    'zh-Hant': '此路線已加入您的收藏。',
    'zh-Hans': '此路线已加入您的收藏。'
  },
  'routeRemovedFromFavorites': {
    'en': 'This route has been removed from your favorites.',
    'zh-Hant': '此路線已從您的收藏中移除。',
    'zh-Hans': '此路线已从您的收藏中移除。'
  },
  'failedToUpdateFavorites': {
    'en': 'Failed to update favorites',
    'zh-Hant': '更新收藏失敗',
    'zh-Hans': '更新收藏失败'
  },
};

export default translations;
