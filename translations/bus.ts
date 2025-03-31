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
  },
  // New translations for transport companies tabs
  'bus.transport.all': {
    'en': 'ALL',
    'zh-Hant': '全部',
    'zh-Hans': '全部'
  },
  'bus.transport.kmb': {
    'en': 'KMB',
    'zh-Hant': '九巴',
    'zh-Hans': '九巴'
  },
  'bus.transport.ctb': {
    'en': 'CTB',
    'zh-Hant': '城巴',
    'zh-Hans': '城巴'
  },
  'bus.transport.gmb': {
    'en': 'GMB',
    'zh-Hant': '專線小巴',
    'zh-Hans': '专线小巴'
  },
  'bus.transport.nlb': {
    'en': 'NLB',
    'zh-Hant': '新大嶼山巴士',
    'zh-Hans': '新大屿山巴士'
  },
  'bus.transport.hkkf': {
    'en': 'HKKF',
    'zh-Hant': '港九小輪',
    'zh-Hans': '港九小轮'
  },
  'bus.transport.mtr': {
    'en': 'MTR',
    'zh-Hant': '港鐵',
    'zh-Hans': '港铁'
  },
  // Additional necessary translations
  'bus.available.stations': {
    'en': 'Available stations',
    'zh-Hant': '可用站點',
    'zh-Hans': '可用站点'
  },
  'bus.station.company': {
    'en': 'Company',
    'zh-Hant': '營運商',
    'zh-Hans': '营运商'
  },
  'bus.no.routes.company': {
    'en': 'No routes found for this company',
    'zh-Hant': '找不到此營運商的路線',
    'zh-Hans': '找不到此营运商的路线'
  },
  'bus.no.stations.company': {
    'en': 'No stations found for this company',
    'zh-Hant': '找不到此營運商的站點',
    'zh-Hans': '找不到此营运商的站点'
  }
};

export default busTranslations;
