import { Language } from '../contexts/LanguageContext';

const transportTranslations: Record<string, Record<Language, string>> = {
  'transport.mode.all': {
    'en': 'All Transport',
    'zh-Hant': '所有交通',
    'zh-Hans': '所有交通'
  },
  'transport.mode.bus': {
    'en': 'Bus',
    'zh-Hant': '巴士',
    'zh-Hans': '巴士'
  },
  'transport.mode.minibus': {
    'en': 'Minibus',
    'zh-Hant': '小巴',
    'zh-Hans': '小巴'
  },
  'transport.mode.mtr': {
    'en': 'MTR',
    'zh-Hant': '港鐵',
    'zh-Hans': '港铁'
  },
  'transport.mode.ferry': {
    'en': 'Ferry',
    'zh-Hant': '渡輪',
    'zh-Hans': '渡轮'
  },
  'transport.info.fare': {
    'en': 'Fare',
    'zh-Hant': '車費',
    'zh-Hans': '车费'
  },
  'transport.info.frequency': {
    'en': 'Frequency',
    'zh-Hant': '班次',
    'zh-Hans': '班次'
  },
  'transport.info.platform': {
    'en': 'Platform',
    'zh-Hant': '月台',
    'zh-Hans': '月台'
  },
  'transport.station.id': {
    'en': 'Station ID',
    'zh-Hant': '車站編號',
    'zh-Hans': '车站编号'
  },
  'transport.station.interchange': {
    'en': 'This is an interchange station',
    'zh-Hant': '這是一個轉乘站',
    'zh-Hans': '这是一个转乘站'
  },
  'transport.station.facilities': {
    'en': 'Facilities',
    'zh-Hant': '設施',
    'zh-Hans': '设施'
  },
  'transport.station.exits': {
    'en': 'Station Exits',
    'zh-Hant': '車站出口',
    'zh-Hans': '车站出口'
  },
  'transport.station.exit': {
    'en': 'Exit',
    'zh-Hant': '出口',
    'zh-Hans': '出口'
  },
  'transport.station.arrivals': {
    'en': 'Upcoming Trains',
    'zh-Hant': '即將到達的列車',
    'zh-Hans': '即将到达的列车'
  },
  'transport.station.no.arrivals': {
    'en': 'No trains scheduled at this time',
    'zh-Hant': '當前沒有計劃到達的列車',
    'zh-Hans': '当前没有计划到达的列车'
  },
  'transport.line.stations': {
    'en': 'Stations on this line',
    'zh-Hant': '此線路上的車站',
    'zh-Hans': '此线路上的车站'
  },
  'error.station.not.found': {
    'en': 'Station information not found',
    'zh-Hant': '找不到車站信息',
    'zh-Hans': '找不到车站信息'
  },
  'error.line.not.found': {
    'en': 'Line information not found',
    'zh-Hant': '找不到線路信息',
    'zh-Hans': '找不到线路信息'
  },
  'navigate': {
    'en': 'Navigate',
    'zh-Hant': '導航',
    'zh-Hans': '导航'
  },
  'error.navigation': {
    'en': 'Navigation Error',
    'zh-Hant': '導航錯誤',
    'zh-Hans': '导航错误'
  },
  'error.open.maps': {
    'en': 'Could not open maps application',
    'zh-Hant': '無法打開地圖應用',
    'zh-Hans': '无法打开地图应用'
  },
  'transport.mtr.station': {
    'en': 'MTR Station',
    'zh-Hant': '港鐵站',
    'zh-Hans': '港铁站'
  },
  'transport.mtr.line': {
    'en': 'MTR Line',
    'zh-Hant': '港鐵綫路',
    'zh-Hans': '港铁线路'
  },
  'transport.mtr.system': {
    'en': 'MTR System',
    'zh-Hant': '港鐵系統',
    'zh-Hans': '港铁系统'
  }
};

export default transportTranslations;
