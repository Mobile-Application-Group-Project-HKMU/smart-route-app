import { Language } from '../contexts/LanguageContext';

const busTranslations: Record<string, Record<Language, string>> = {
  'bus.title': {
    'en': 'Bus Routes',
    'zh-Hant': '巴士路線',
    'zh-Hans': '巴士路线'
  },
  'bus.search.routes': {
    'en': 'Search by route number or destination',
    'zh-Hant': '按路線號碼或目的地搜尋',
    'zh-Hans': '按路线号码或目的地搜索'
  },
  'bus.search.stations': {
    'en': 'Search by station name or ID',
    'zh-Hant': '按站點名稱或ID搜尋',
    'zh-Hans': '按站点名称或ID搜索'
  },
  'bus.tab.routes': {
    'en': 'Routes',
    'zh-Hant': '路線',
    'zh-Hans': '路线'
  },
  'bus.tab.stations': {
    'en': 'Stations',
    'zh-Hant': '站點',
    'zh-Hans': '站点'
  },
  'bus.stationId': {
    'en': 'ID',
    'zh-Hant': '編號',
    'zh-Hans': '编号'
  },
  'bus.loading': {
    'en': 'Loading bus information...',
    'zh-Hant': '正在加載巴士信息...',
    'zh-Hans': '正在加载巴士信息...'
  },
  'bus.error': {
    'en': 'Failed to load bus information',
    'zh-Hant': '無法加載巴士信息',
    'zh-Hans': '无法加载巴士信息'
  },
  'bus.no.results': {
    'en': 'No routes found',
    'zh-Hant': '未找到路線',
    'zh-Hans': '未找到路线'
  }
};

export default busTranslations;
