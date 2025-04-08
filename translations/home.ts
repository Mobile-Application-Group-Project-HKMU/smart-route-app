import { Language } from '../contexts/LanguageContext';

const homeTranslations: Record<string, Record<Language, string>> = {
  'home.title': {
    'en': 'Smart Route App',
    'zh-Hant': '智能九巴應用',
    'zh-Hans': '智能九巴应用'
  },
  'home.favorites': {
    'en': 'Your Favorites',
    'zh-Hant': '您的收藏',
    'zh-Hans': '您的收藏'
  },
  'home.loading': {
    'en': 'Loading your favorites...',
    'zh-Hant': '正在加載您的收藏...',
    'zh-Hans': '正在加载您的收藏...'
  },
  'home.no.favorites': {
    'en': 'You don\'t have any favorites yet. Browse bus routes and stops to add favorites.',
    'zh-Hant': '您尚未添加任何收藏。瀏覽巴士路線和站點以添加收藏。',
    'zh-Hans': '您尚未添加任何收藏。浏览巴士路线和站点以添加收藏。'
  },
  'home.favorites.routes': {
    'en': 'Favorite Routes',
    'zh-Hant': '收藏路線',
    'zh-Hans': '收藏路线'
  },
  'home.favorites.stops': {
    'en': 'Favorite Stops',
    'zh-Hant': '收藏站點',
    'zh-Hans': '收藏站点'
  },
  'home.favorites.mtr.stations': {
    'en': 'Favorite MTR Stations',
    'zh-Hant': '收藏地鐵站',
    'zh-Hans': '收藏地铁站'
  },
  'home.about': {
    'en': 'About This App',
    'zh-Hant': '關於此應用',
    'zh-Hans': '关于此应用'
  }
};

export default homeTranslations;
