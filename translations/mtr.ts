import { Language } from '../contexts/LanguageContext';

export const mtrTranslations: Record<string, Record<Language, string>> = {
  // MTR Line Names
  'line.AEL': {
    'en': 'Airport Express Line',
    'zh-Hant': '機場快綫',
    'zh-Hans': '机场快线'
  },
  'line.TCL': {
    'en': 'Tung Chung Line',
    'zh-Hant': '東涌綫',
    'zh-Hans': '东涌线'
  },
  'line.TML': {
    'en': 'Tuen Ma Line',
    'zh-Hant': '屯馬綫',
    'zh-Hans': '屯马线'
  },
  'line.TKL': {
    'en': 'Tseung Kwan O Line',
    'zh-Hant': '將軍澳綫',
    'zh-Hans': '将军澳线'
  },
  'line.EAL': {
    'en': 'East Rail Line',
    'zh-Hant': '東鐵綫',
    'zh-Hans': '东铁线'
  },
  'line.TWL': {
    'en': 'Tsuen Wan Line',
    'zh-Hant': '荃灣綫',
    'zh-Hans': '荃湾线'
  },
  'line.ISL': {
    'en': 'Island Line',
    'zh-Hant': '港島綫',
    'zh-Hans': '港岛线'
  },
  'line.KTL': {
    'en': 'Kwun Tong Line',
    'zh-Hant': '觀塘綫',
    'zh-Hans': '观塘线'
  },
  'line.SIL': {
    'en': 'South Island Line',
    'zh-Hant': '南港島綫',
    'zh-Hans': '南港岛线'
  },
  'line.DRL': {
    'en': 'Disneyland Resort Line',
    'zh-Hant': '迪士尼綫',
    'zh-Hans': '迪士尼线'
  },

  // MTR Station-related terms
  'mtr.station.id': {
    'en': 'Station ID',
    'zh-Hant': '車站編號',
    'zh-Hans': '车站编号'
  },
  'mtr.station.info': {
    'en': 'Station Information',
    'zh-Hant': '車站資訊',
    'zh-Hans': '车站信息'
  },
  'mtr.station.platform': {
    'en': 'Platform',
    'zh-Hant': '月台',
    'zh-Hans': '月台'
  },
  'mtr.station.interchange': {
    'en': 'Interchange Station',
    'zh-Hant': '轉乘站',
    'zh-Hans': '转乘站'
  },
  'mtr.station.exits': {
    'en': 'Station Exits',
    'zh-Hant': '車站出口',
    'zh-Hans': '车站出口'
  },
  'mtr.station.facilities': {
    'en': 'Station Facilities',
    'zh-Hant': '車站設施',
    'zh-Hans': '车站设施'
  },
  'mtr.station.nextTrain': {
    'en': 'Next Train',
    'zh-Hant': '下一班列車',
    'zh-Hans': '下一班列车'
  },
  'mtr.station.destination': {
    'en': 'Destination',
    'zh-Hant': '目的地',
    'zh-Hans': '目的地'
  },  'mtr.station.stations': {
    'en': 'Stations on this line',
    'zh-Hant': '此線路上的車站',
    'zh-Hans': '此线路上的车站'
  },
};

export default mtrTranslations;
