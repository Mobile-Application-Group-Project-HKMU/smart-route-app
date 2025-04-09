// Import configuration settings from config utility
import { appConfig } from './config';
// Import browser detection utility
import { isSafari } from './transport';
// Import transport-related type definitions
import { TransportRoute, TransportStop, TransportETA, ClassifiedTransportETA } from '@/types/transport-types';
// Import MTR station data utility
import {getAllStations} from './mtrStations'
// Import utility for calculating distance between coordinates
import { calculateDistance } from './calculateDistance';
// MTR line colors - Color hex codes for each MTR line for UI display
// 港铁线路颜色 - 每条港铁线路的十六进制颜色代码，用于UI显示
export const MTR_COLORS = {
  'AEL': '#00888E', // Airport Express - 机场快线
  'TCL': '#F3982D', // Tung Chung Line - 东涌线
  'TML': '#9C2E00', // Tuen Ma Line - 屯马线
  'TKL': '#7E3C99', // Tseung Kwan O Line - 将军澳线
  'EAL': '#5EB7E8', // East Rail Line - 东铁线
  'TWL': '#C41E3A', // Tsuen Wan Line - 荃湾线
  'ISL': '#0075C2', // Island Line - 港岛线
  'KTL': '#00A040', // Kwun Tong Line - 观塘线
  'SIL': '#CBD300', // South Island Line - 南港岛线
  'DRL': '#B5A45D'  // Disneyland Resort Line - 迪士尼线 (not included in API v1.6)
};

// MTR station information interface - Extends TransportStop with MTR-specific properties
export interface MtrStation extends TransportStop {
  line_codes: string[];      // MTR line codes that serve this station
  is_interchange: boolean;   // Whether the station is an interchange between multiple lines
  facilities: string[];      // Available facilities at the station
  exit_info: {              // Information about station exits
    exit: string;            // Exit identifier
    destination_en: string;  // Destination in English
    destination_tc: string;  // Destination in Traditional Chinese
  }[];
}

// API endpoints - Base URL for MTR real-time data API
const API_BASE = 'https://rt.data.gov.hk/v1/transport/mtr/';

// Cache system - Stores API responses with timestamps to reduce repeated requests
const apiCache = new Map<string, { timestamp: number; data: unknown }>();
// Cache time-to-live in milliseconds - How long to keep responses in cache
const CACHE_TTL = appConfig.apiCacheTTL || 60000; // Default to 60 seconds if not specified

/**
 * Makes a cached API request
 * 发起带缓存的API请求
 * 
 * @param url - The API endpoint to call
 * @param url - 要调用的API端点
 * @returns Promise with the response data
 * @returns 包含响应数据的Promise
 * @description Fetches data from the MTR API with caching to reduce redundant requests
 * @description 从港铁API获取数据，带缓存以减少重复请求
 */
async function cachedApiGet<T>(url: string): Promise<T> {
  const now = Date.now();
  
  // Check if we have a valid cached response
  if (apiCache.has(url)) {
    const entry = apiCache.get(url)!;
    if (now - entry.timestamp < CACHE_TTL) {
      return entry.data as T;
    }
  }

  try {
    // Make a new request if cache is invalid or missing
    const response = await fetch(API_BASE + url, {
      cache: isSafari ? "default" : "no-store", // Safari has different caching behavior
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Store the new response in cache
    apiCache.set(url, { timestamp: now, data });
    return data;
  } catch (error) {
    console.error(`MTR API request failed: ${url}`, error);
    throw error;
  }
}

/**
 * Gets all MTR lines (routes)
 * 获取所有港铁线路（路线）
 * 
 * @param language - The language code for the response ('en', 'zh-Hant', 'zh-Hans')
 * @param language - 响应的语言代码（'en'英文, 'zh-Hant'繁体中文, 'zh-Hans'简体中文）
 * @returns Promise with an array of TransportRoute objects
 * @returns 包含TransportRoute对象数组的Promise
 * @description Fetches all MTR lines with route information in the specified language
 * @description 获取指定语言的所有港铁线路信息
 */
export async function getAllLines(language: 'en' | 'zh-Hant' | 'zh-Hans' = 'en'): Promise<TransportRoute[]> {
  if (language === 'zh-Hans') {
    return [
      { route: 'AEL', co: 'MTR', orig_en: 'Hong Kong', orig_tc: '香港', dest_en: 'AsiaWorld-Expo', dest_tc: '博览馆', mode: 'MTR', color: MTR_COLORS['AEL'] },
      { route: 'TCL', co: 'MTR', orig_en: 'Hong Kong', orig_tc: '香港', dest_en: 'Tung Chung', dest_tc: '东涌', mode: 'MTR', color: MTR_COLORS['TCL'] },
      { route: 'TML', co: 'MTR', orig_en: 'Wu Kai Sha', orig_tc: '乌溪沙', dest_en: 'Tuen Mun', dest_tc: '屯门', mode: 'MTR', color: MTR_COLORS['TML'] },
      { route: 'TKL', co: 'MTR', orig_en: 'North Point', orig_tc: '北角', dest_en: 'Po Lam', dest_tc: '宝琳', mode: 'MTR', color: MTR_COLORS['TKL'] },
      { route: 'EAL', co: 'MTR', orig_en: 'Admiralty', orig_tc: '金钟', dest_en: 'Lok Ma Chau', dest_tc: '落马洲', mode: 'MTR', color: MTR_COLORS['EAL'] },
      { route: 'SIL', co: 'MTR', orig_en: 'Admiralty', orig_tc: '金钟', dest_en: 'South Horizons', dest_tc: '海怡半岛', mode: 'MTR', color: MTR_COLORS['SIL'] },
      { route: 'TWL', co: 'MTR', orig_en: 'Central', orig_tc: '中环', dest_en: 'Tsuen Wan', dest_tc: '荃湾', mode: 'MTR', color: MTR_COLORS['TWL'] },
      { route: 'ISL', co: 'MTR', orig_en: 'Kennedy Town', orig_tc: '坚尼地城', dest_en: 'Chai Wan', dest_tc: '柴湾', mode: 'MTR', color: MTR_COLORS['ISL'] },
      { route: 'KTL', co: 'MTR', orig_en: 'Whampoa', orig_tc: '黄埔', dest_en: 'Tiu Keng Leng', dest_tc: '调景岭', mode: 'MTR', color: MTR_COLORS['KTL'] },
    ];
  } else if (language === 'zh-Hant') {
    return [
      { route: 'AEL', co: 'MTR', orig_en: 'Hong Kong', orig_tc: '香港', dest_en: 'AsiaWorld-Expo', dest_tc: '博覽館', mode: 'MTR', color: MTR_COLORS['AEL'] },
      { route: 'TCL', co: 'MTR', orig_en: 'Hong Kong', orig_tc: '香港', dest_en: 'Tung Chung', dest_tc: '東涌', mode: 'MTR', color: MTR_COLORS['TCL'] },
      { route: 'TML', co: 'MTR', orig_en: 'Wu Kai Sha', orig_tc: '烏溪沙', dest_en: 'Tuen Mun', dest_tc: '屯門', mode: 'MTR', color: MTR_COLORS['TML'] },
      { route: 'TKL', co: 'MTR', orig_en: 'North Point', orig_tc: '北角', dest_en: 'Po Lam', dest_tc: '寶琳', mode: 'MTR', color: MTR_COLORS['TKL'] },
      { route: 'EAL', co: 'MTR', orig_en: 'Admiralty', orig_tc: '金鐘', dest_en: 'Lok Ma Chau', dest_tc: '落馬洲', mode: 'MTR', color: MTR_COLORS['EAL'] },
      { route: 'SIL', co: 'MTR', orig_en: 'Admiralty', orig_tc: '金鐘', dest_en: 'South Horizons', dest_tc: '海怡半島', mode: 'MTR', color: MTR_COLORS['SIL'] },
      { route: 'TWL', co: 'MTR', orig_en: 'Central', orig_tc: '中環', dest_en: 'Tsuen Wan', dest_tc: '荃灣', mode: 'MTR', color: MTR_COLORS['TWL'] },
      { route: 'ISL', co: 'MTR', orig_en: 'Kennedy Town', orig_tc: '堅尼地城', dest_en: 'Chai Wan', dest_tc: '柴灣', mode: 'MTR', color: MTR_COLORS['ISL'] },
      { route: 'KTL', co: 'MTR', orig_en: 'Whampoa', orig_tc: '黃埔', dest_en: 'Tiu Keng Leng', dest_tc: '調景嶺', mode: 'MTR', color: MTR_COLORS['KTL'] },
    ];
  } else {
    // Default English
    return [
      { route: 'AEL', co: 'MTR', orig_en: 'Hong Kong', orig_tc: '香港', dest_en: 'AsiaWorld-Expo', dest_tc: '博覽館', mode: 'MTR', color: MTR_COLORS['AEL'] },
      { route: 'TCL', co: 'MTR', orig_en: 'Hong Kong', orig_tc: '香港', dest_en: 'Tung Chung', dest_tc: '東涌', mode: 'MTR', color: MTR_COLORS['TCL'] },
      { route: 'TML', co: 'MTR', orig_en: 'Wu Kai Sha', orig_tc: '烏溪沙', dest_en: 'Tuen Mun', dest_tc: '屯門', mode: 'MTR', color: MTR_COLORS['TML'] },
      { route: 'TKL', co: 'MTR', orig_en: 'North Point', orig_tc: '北角', dest_en: 'Po Lam', dest_tc: '寶琳', mode: 'MTR', color: MTR_COLORS['TKL'] },
      { route: 'EAL', co: 'MTR', orig_en: 'Admiralty', orig_tc: '金鐘', dest_en: 'Lok Ma Chau', dest_tc: '落馬洲', mode: 'MTR', color: MTR_COLORS['EAL'] },
      { route: 'SIL', co: 'MTR', orig_en: 'Admiralty', orig_tc: '金鐘', dest_en: 'South Horizons', dest_tc: '海怡半島', mode: 'MTR', color: MTR_COLORS['SIL'] },
      { route: 'TWL', co: 'MTR', orig_en: 'Central', orig_tc: '中環', dest_en: 'Tsuen Wan', dest_tc: '荃灣', mode: 'MTR', color: MTR_COLORS['TWL'] },
      { route: 'ISL', co: 'MTR', orig_en: 'Kennedy Town', orig_tc: '堅尼地城', dest_en: 'Chai Wan', dest_tc: '柴灣', mode: 'MTR', color: MTR_COLORS['ISL'] },
      { route: 'KTL', co: 'MTR', orig_en: 'Whampoa', orig_tc: '黃埔', dest_en: 'Tiu Keng Leng', dest_tc: '調景嶺', mode: 'MTR', color: MTR_COLORS['KTL'] },
    ];
  }
}

/**
 * Finds MTR stations near a specified location
 * 查找指定位置附近的港铁站
 * 
 * @param latitude - Latitude of the location
 * @param latitude - 位置的纬度
 * @param longitude - Longitude of the location
 * @param longitude - 位置的经度
 * @param radiusMeters - Search radius in meters (default: 500)
 * @param radiusMeters - 搜索半径，单位为米（默认：500）
 * @returns Promise with an array of nearby MtrStation objects with distance
 * @returns 包含附近MtrStation对象及距离信息的数组Promise
 * @description Finds MTR stations within a specified radius of a given location
 * @description 查找给定位置指定半径内的港铁站
 */
export async function findNearbyStations(
  latitude: number,
  longitude: number,
  radiusMeters = 500
): Promise<Array<MtrStation & { distance: number }>> {
  try {
    const allStations = await getAllStations();
    
    return allStations
      .map(station => {
        const distance = calculateDistance(
          latitude, 
          longitude, 
          station.lat, 
          station.long
        );
        
        return {
          ...station,
          distance
        };
      })
      .filter(station => station.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Failed to find nearby MTR stations', error);
    return [];
  }
}

/**
 * Gets train arrival times for a station 
 * @param stationId - The ID of the station
 * @returns Promise with an array of TransportETA objects
 * @description Fetches real-time train arrival times for a specified MTR station
 */
export async function getStationETAs(stationId: string): Promise<TransportETA[]> {
  try {
    const allStations = await getAllStations();
    const station = allStations.find(s => s.stop === stationId);
    
    if (!station) {
      throw new Error(`Station not found: ${stationId}`);
    }

    const etas: TransportETA[] = [];
    const allLines = await getAllLines();

    for (const line of station.line_codes) {
      const url = `getSchedule.php?line=${line}&sta=${stationId}&lang=EN`;
      const response = await cachedApiGet<any>(url);

      if (response.status === 0) {
        console.warn(`Station ${stationId} on line ${line} is suspended: ${response.message}`);
        continue;
      }

      const lineData = response.data[`${line}-${stationId}`];
      if (!lineData) {
        continue;
      }

      const lineInfo = allLines.find(l => l.route === line);
      const destMap = {
        'UP': lineInfo?.dest_en || '',
        'DOWN': lineInfo?.orig_en || ''
      };
      const destTcMap = {
        'UP': lineInfo?.dest_tc || '',
        'DOWN': lineInfo?.orig_tc || ''
      };

      // Parse UP direction
      if (lineData.UP) {
        lineData.UP.forEach((train: any) => {
          if (train.valid === 'Y') {
            etas.push({
              co: 'MTR',
              route: line,
              eta: train.time,
              dest_en: train.dest || destMap['UP'],
              dest_tc: destTcMap['UP'], // Placeholder, need mapping for TC
              platform: train.plat,
              rmk_en: train.source === '-' ? '' : train.source,
              rmk_tc: '',
              trainLength: 8 // Default value, not provided in API
            });
          }
        });
      }

      // Parse DOWN direction
      if (lineData.DOWN) {
        lineData.DOWN.forEach((train: any) => {
          if (train.valid === 'Y') {
            etas.push({
              co: 'MTR',
              route: line,
              eta: train.time,
              dest_en: train.dest || destMap['DOWN'],
              dest_tc: destTcMap['DOWN'], // Placeholder, need mapping for TC
              platform: train.plat,
              rmk_en: train.source === '-' ? '' : train.source,
              rmk_tc: '',
              trainLength: 8 // Default value, not provided in API
            });
          }
        });
      }
    }

    return etas;
  } catch (error) {
    console.error(`Failed to get ETAs for MTR station ${stationId}`, error);
    return [];
  }
}

/**
 * Organizes ETAs for a station by lines
 * @param stationId - The ID of the station
 * @returns Promise with an array of ClassifiedTransportETA objects
 * @description Classifies real-time train arrival times by line and direction for a specified MTR station
 */
export async function classifyStationETAs(stationId: string): Promise<ClassifiedTransportETA[]> {
  try {
    const etas = await getStationETAs(stationId);
    
    return Object.values(
      etas.reduce((acc, eta) => {
        const key = `${eta.route}-${eta.dest_en}`;
        
        if (!acc[key]) {
          acc[key] = {
            route: eta.route as string,
            direction: 'Outbound', // Default to Outbound for MTR, which typically uses UP/DOWN
            serviceType: 'Normal',
            destination_en: eta.dest_en || '',
            destination_tc: eta.dest_tc || '',
            etas: [],
            company: 'MTR'
          };
        }
        
        acc[key].etas.push(eta);
        return acc;
      }, {} as Record<string, ClassifiedTransportETA>)
    );
  } catch (error) {
    console.error(`Failed to classify ETAs for MTR station ${stationId}`, error);
    return [];
  }
}

/**
 * Clears the MTR API cache
 * @description Empties the cache of stored API responses
 */
export function clearCache(): void {
  apiCache.clear();
}

export {
  getAllLines as getAllRoutes,
  getAllStations as getAllStops,
  findNearbyStations as findNearbyStops,
  getStationETAs as getStopETA,
  classifyStationETAs as classifyStopETAs
};