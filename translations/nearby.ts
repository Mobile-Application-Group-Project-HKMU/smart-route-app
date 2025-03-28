import { Language } from '../contexts/LanguageContext';

const nearbyTranslations: Record<string, Record<Language, string>> = {
  'nearby.title': {
    'en': 'Nearby Stops',
    'zh-Hant': '附近站點',
    'zh-Hans': '附近站点'
  },
  'nearby.find.stops': {
    'en': 'Find Nearby Stops',
    'zh-Hant': '尋找附近站點',
    'zh-Hans': '寻找附近站点'
  },
  'nearby.tap.instruction': {
    'en': 'Tap the location button to find bus stops near you',
    'zh-Hant': '點擊位置按鈕尋找您附近的巴士站',
    'zh-Hans': '点击位置按钮寻找您附近的巴士站'
  },
  'nearby.no.stops': {
    'en': 'No bus stops found within {0}m of your location',
    'zh-Hant': '在您位置{0}米範圍內未找到巴士站',
    'zh-Hans': '在您位置{0}米范围内未找到巴士站'
  },
  'nearby.meters.away': {
    'en': '{0}m away',
    'zh-Hant': '距離{0}米',
    'zh-Hans': '距离{0}米'
  },
  'nearby.open.maps': {
    'en': 'Open in Google Maps',
    'zh-Hant': '在Google地圖中打開',
    'zh-Hans': '在Google地图中打开'
  },
  'nearby.map.mobile.only': {
    'en': 'Interactive map is available on mobile devices',
    'zh-Hant': '互動地圖僅在移動設備上可用',
    'zh-Hans': '互动地图仅在移动设备上可用'
  },
  'nearby.your.location': {
    'en': 'Your location: {0}, {1}',
    'zh-Hant': '您的位置: {0}, {1}',
    'zh-Hans': '您的位置: {0}, {1}'
  },
  'nearby.error.find': {
    'en': 'Failed to find nearby stops. Please try again.',
    'zh-Hant': '無法尋找附近站點。請重試。',
    'zh-Hans': '无法寻找附近站点。请重试。'
  },
  'nearby.error.location': {
    'en': 'Unable to retrieve your location. Please allow location access.',
    'zh-Hant': '無法獲取您的位置。請允許位置存取。',
    'zh-Hans': '无法获取您的位置。请允许位置访问。'
  },
  'nearby.retry': {
    'en': 'Retry',
    'zh-Hant': '重試',
    'zh-Hans': '重试'
  },
  'nearby.permission.required': {
    'en': 'Location permission is required to find nearby stops',
    'zh-Hant': '需要位置權限才能尋找附近站點',
    'zh-Hans': '需要位置权限才能寻找附近站点'
  },
  'nearby.stops.count': {
    'en': 'Nearby Stops ({0})',
    'zh-Hant': '附近站點 ({0})',
    'zh-Hans': '附近站点 ({0})'
  },
  'nearby.radius.250m': {
    'en': '250m',
    'zh-Hant': '250米',
    'zh-Hans': '250米'
  },
  'nearby.radius.500m': {
    'en': '500m',
    'zh-Hant': '500米',
    'zh-Hans': '500米'
  },
  'nearby.radius.1km': {
    'en': '1km',
    'zh-Hant': '1公里',
    'zh-Hans': '1公里'
  }
};

export default nearbyTranslations;
