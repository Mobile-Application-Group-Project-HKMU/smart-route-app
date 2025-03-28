import { Language } from '../contexts/LanguageContext';

const stopTranslations: Record<string, Record<Language, string>> = {
  'stop.title': {
    'en': 'Bus Stop',
    'zh-Hant': '巴士站',
    'zh-Hans': '巴士站'
  },
  'stop.id': {
    'en': 'Stop ID',
    'zh-Hant': '站點ID',
    'zh-Hans': '站点ID'
  },
  'stop.map.available': {
    'en': 'Stop map is available on mobile devices',
    'zh-Hant': '站點地圖在移動設備上可用',
    'zh-Hans': '站点地图在移动设备上可用'
  },
  'stop.location': {
    'en': 'Location',
    'zh-Hant': '位置',
    'zh-Hans': '位置'
  },
  'stop.open.maps': {
    'en': 'Open in Google Maps',
    'zh-Hant': '在Google地圖中打開',
    'zh-Hans': '在Google地图中打开'
  },
  'stop.arrivals': {
    'en': 'Upcoming Arrivals',
    'zh-Hant': '即將到達',
    'zh-Hans': '即将到达'
  },
  'stop.no.arrivals': {
    'en': 'No bus arrivals scheduled at this time',
    'zh-Hant': '當前沒有計劃到達的巴士',
    'zh-Hans': '当前没有计划到达的巴士'
  },
  'stop.service.type': {
    'en': 'Service Type',
    'zh-Hant': '服務類型',
    'zh-Hans': '服务类型'
  },
  'stop.direction.inbound': {
    'en': 'Inbound',
    'zh-Hant': '入站',
    'zh-Hans': '入站'
  },
  'stop.direction.outbound': {
    'en': 'Outbound',
    'zh-Hant': '出站',
    'zh-Hans': '出站'
  },
  'stop.view.route': {
    'en': 'View Route',
    'zh-Hant': '查看路線',
    'zh-Hans': '查看路线'
  },
  'stop.navigate': {
    'en': 'Navigate',
    'zh-Hant': '導航',
    'zh-Hans': '导航'
  },
  'stop.no.data': {
    'en': 'No data',
    'zh-Hant': '無數據',
    'zh-Hans': '无数据'
  },
};

export default stopTranslations;
