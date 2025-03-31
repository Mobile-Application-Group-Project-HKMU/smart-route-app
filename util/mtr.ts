import { appConfig } from './config';
import { isSafari } from './transport';
import { TransportRoute, TransportStop, TransportETA, ClassifiedTransportETA } from '@/types/transport-types';
import {getAllStations} from './mtrStations'
// MTR line colors
export const MTR_COLORS = {
  'AEL': '#00888E', // Airport Express
  'TCL': '#F3982D', // Tung Chung Line
  'TML': '#9C2E00', // Tuen Ma Line
  'TKL': '#7E3C99', // Tseung Kwan O Line
  'EAL': '#5EB7E8', // East Rail Line
  'TWL': '#C41E3A', // Tsuen Wan Line
  'ISL': '#0075C2', // Island Line
  'KTL': '#00A040', // Kwun Tong Line
  'SIL': '#CBD300', // South Island Line
  'DRL': '#B5A45D'  // Disneyland Resort Line (not included in API v1.6)
};

// MTR station information
export interface MtrStation extends TransportStop {
  line_codes: string[];
  is_interchange: boolean;
  facilities: string[];
  exit_info: {
    exit: string;
    destination_en: string;
    destination_tc: string;
  }[];
}

// API endpoints
const API_BASE = 'https://rt.data.gov.hk/v1/transport/mtr/';

// Cache system
const apiCache = new Map<string, { timestamp: number; data: unknown }>();
const CACHE_TTL = appConfig.apiCacheTTL || 60000; // Default to 60 seconds if not specified

/**
 * Makes a cached API request
 */
async function cachedApiGet<T>(url: string): Promise<T> {
  const now = Date.now();
  
  if (apiCache.has(url)) {
    const entry = apiCache.get(url)!;
    if (now - entry.timestamp < CACHE_TTL) {
      return entry.data as T;
    }
  }

  try {
    const response = await fetch(API_BASE + url, {
      cache: isSafari ? "default" : "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    apiCache.set(url, { timestamp: now, data });
    return data;
  } catch (error) {
    console.error(`MTR API request failed: ${url}`, error);
    throw error;
  }
}

/**
 * Gets all MTR lines (routes)
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
 * Calculate distance between two coordinates using the Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = 
    Math.sin(Δφ/2) * Math.sin(Δφ/2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ/2) * Math.sin(Δλ/2);
  
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/**
 * Gets train arrival times for a station 
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