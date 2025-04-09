import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';
import { appConfig } from './config';
import * as kmbUtil from './kmb';
import { getAllRoutes as getAllKmbRoutes } from './kmb';
import * as gmbUtil from './gmb';
import * as ctbUtil from './ctb';
import * as mtrUtil from './mtr';
import { formatTransportTime } from './datetime';
import { 
  TransportRoute, 
  TransportStop, 

  ClassifiedTransportETA, 

  TransportCompany,
  TransportMode
} from '@/types/transport-types';

/**
 * API cache system to reduce redundant network requests.
 * Stores API responses with timestamps for TTL-based expiration.
 */
const apiCache = new Map<string, { timestamp: number; data: unknown }>();

/**
 * Makes a cached API request - prevents redundant requests to the same URL
 * within the cache TTL period. Improves performance and reduces API load.
 * 
 * @param url - The URL to request
 * @param ttl - Time to live for the cache in milliseconds
 * @returns The API response data
 */
export async function cachedApiGet<T>(url: string, ttl = appConfig.apiCacheTTL): Promise<T> {
  const now = Date.now();
  
  if (apiCache.has(url)) {
    const entry = apiCache.get(url)!;
    if (now - entry.timestamp < ttl) {
      return entry.data as T;
    }
  }

  try {
    const { data } = await axios.get<T>(url);
    apiCache.set(url, { timestamp: now, data });
    return data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error(`API request failed: ${axiosError.message}`);
  }
}

/**
 * Clears the API cache.
 * Useful when forcing fresh data retrieval or managing memory usage.
 */
export function clearApiCache(): void {
  apiCache.clear();
}



/**
 * Determines if coordinates are valid geographic coordinates.
 * Verifies that latitude and longitude values are within acceptable ranges.
 * 
 * @param lat - Latitude to validate
 * @param lon - Longitude to validate
 * @returns True if coordinates are valid
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Detects if the current browser is Safari.
 * Safari requires different caching strategies for optimal performance.
 */
export const isSafari = (() => {
  try {
    if (Platform.OS !== 'web') return false;
    
    return Boolean(
      navigator &&
      navigator.userAgent &&
      navigator.userAgent.includes("Safari/") &&
      !(
        navigator.userAgent.includes("Chrome/") ||
        navigator.userAgent.includes("Chromium/")
      )
    );
  } catch {
    return false;
  }
})();

/**
 * Finds nearby stops from multiple transport providers.
 * Combines results from different providers and sorts by distance.
 * 
 * @param latitude - Current latitude
 * @param longitude - Current longitude
 * @param radiusMeters - Search radius in meters
 * @returns Array of nearby stops with distance information
 */
export async function findAllNearbyStops(
  latitude: number,
  longitude: number,
  radiusMeters = 500
): Promise<Array<TransportStop & { distance: number; company: string }>> {
  try {
    // Get stops from KMB
    const kmbStops = await kmbUtil.findNearbyStops(latitude, longitude, radiusMeters);
    const kmbStopsWithCompany = kmbStops.map(stop => ({ ...stop, company: 'KMB' }));
    
    // Get stops from GMB (if available)
    let gmbStops: any[] = [];
    try {
      gmbStops = await gmbUtil.findNearbyStops(latitude, longitude, radiusMeters);
      gmbStops = gmbStops.map(stop => ({ ...stop, company: 'GMB' }));
    } catch (error) {
      console.warn('Failed to get GMB stops:', error);
    }
    
    // Combine all stops and sort by distance
    return [...kmbStopsWithCompany, ...gmbStops].sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error finding nearby stops:', error);
    throw error;
  }
}

/**
 * Formats ETA (Estimated Time of Arrival) as a user-friendly string.
 * Supports multiple languages for internationalization.
 * 
 * @param eta - ISO timestamp string or null
 * @param language - Language for the formatted output
 * @returns User-friendly ETA string
 */
export function formatETA(
  eta: string | null, 
  language: 'en' | 'zh-Hant' | 'zh-Hans' = 'en'
): string {
  if (!eta) {
    return language === 'en' ? 'Not available' : '沒有服務';
  }
  
  return formatTransportTime(eta, language, 'relative');
}

/**
 * Gets ETAs for a stop from multiple transport providers.
 * Combines and sorts results for unified presentation.
 * 
 * @param stopId - ID of the stop
 * @param companies - Array of transport companies to query
 * @returns Classified ETAs sorted by arrival time
 */
export async function getStopETAs(
  stopId: string,
  companies: TransportCompany[] = ['KMB', 'CTB']
): Promise<ClassifiedTransportETA[]> {
  const results: ClassifiedTransportETA[] = [];
  
  try {
    // Get KMB ETAs
    if (companies.includes('KMB')) {
      const kmbETAs = await kmbUtil.classifyStopETAs(stopId);
      results.push(...kmbETAs.map(eta => ({ 
              ...eta, 
              company: 'KMB',
              etas: eta.etas.map(e => ({
                ...e,
                rmk_tc: e.rmk_tc === null ? undefined : typeof e.rmk_tc === 'string' ? e.rmk_tc : String(e.rmk_tc),
              }))
            })));
    }
    
    // Get CTB ETAs
    if (companies.includes('CTB')) {
      const ctbETAs = await ctbUtil.classifyStopETAs(stopId);
      results.push(...ctbETAs);
    }
    
    // Sort by arrival time
    return results.sort((a, b) => {
      const aFirstEta = a.etas[0]?.eta;
      const bFirstEta = b.etas[0]?.eta;
      
      if (!aFirstEta && !bFirstEta) return 0;
      if (!aFirstEta) return 1;
      if (!bFirstEta) return -1;
      
      return new Date(aFirstEta).getTime() - new Date(bFirstEta).getTime();
    });
  } catch (error) {
    console.error(`Failed to get combined ETAs for stop ${stopId}`, error);
    return results;
  }
}

/**
 * Gets CTB (Citybus) routes.
 * Currently a placeholder implementation.
 * 
 * @returns Array of CTB routes
 */
async function getCtbRoutes(): Promise<TransportRoute[]> {
  // Placeholder implementation - replace with actual CTB API call
  return [];
}

/**
 * Gets MTR (Mass Transit Railway) routes.
 * Retrieves and formats MTR line information.
 * 
 * @returns Array of MTR routes
 */
async function getMtrRoutes(): Promise<TransportRoute[]> {
  try {
    const mtrLines = await mtrUtil.getAllRoutes();
    return mtrLines.map(line => ({
      ...line,
      mode: 'MTR' as TransportMode
    }));
  } catch (error) {
    console.error('Failed to get MTR routes:', error);
    return [];
  }
}

/**
 * Finds nearby KMB (Kowloon Motor Bus) stops.
 * Uses the KMB utility to find stops and adds mode information.
 * 
 * @param latitude - Current latitude
 * @param longitude - Current longitude
 * @param radiusMeters - Search radius in meters
 * @returns Array of nearby KMB stops with distance information
 */
async function findNearbyKmbStops(
  latitude: number,
  longitude: number,
  radiusMeters = 500
): Promise<Array<TransportStop & { distance: number }>> {
  const stops = await kmbUtil.findNearbyStops(latitude, longitude, radiusMeters);
  return stops.map(stop => ({
    ...stop,
    mode: 'BUS' as TransportMode
  }));
}

/**
 * Finds nearby MTR stations.
 * Uses the MTR utility to find stations and adds mode information.
 * 
 * @param latitude - Current latitude
 * @param longitude - Current longitude
 * @param radiusMeters - Search radius in meters
 * @returns Array of nearby MTR stations with distance information
 */
async function findNearbyMtrStations(
  latitude: number,
  longitude: number,
  radiusMeters = 500
): Promise<Array<TransportStop & { distance: number }>> {
  try {
    const mtrStations = await mtrUtil.findNearbyStops(latitude, longitude, radiusMeters);
    return mtrStations.map(station => ({
      ...station,
      mode: 'MTR' as TransportMode
    }));
  } catch (error) {
    console.error('Failed to find nearby MTR stations:', error);
    return [];
  }
}

/**
 * Gets combined transport data from multiple providers.
 * Allows filtering by mode and company for flexible data retrieval.
 * 
 * @param modes - Array of transport modes to include
 * @param companies - Array of transport companies to include
 * @returns Combined array of transport routes
 */
export async function getUnifiedTransportData(
  modes: TransportMode[] = ['BUS'], 
  companies?: TransportCompany[]
): Promise<TransportRoute[]> {
  const results: TransportRoute[] = [];
  
  for (const mode of modes) {
    switch (mode) {
      case 'BUS':
        if (!companies || companies.includes('KMB')) {
          const kmbRoutes = await getAllKmbRoutes();
          results.push(...kmbRoutes.map(route => ({
            ...route, 
            mode: 'BUS' as TransportMode,
            orig_tc: route.orig_tc ? String(route.orig_tc) : undefined,
            dest_tc: route.dest_tc ? String(route.dest_tc) : undefined
          })));
        }
        if (!companies || companies.includes('CTB')) {
          const ctbRoutes = await getCtbRoutes();
          results.push(...ctbRoutes.map(route => ({...route, mode: 'BUS' as TransportMode })));
        }
        break;
        
      case 'MTR':
        if (!companies || companies.includes('MTR')) {
          const mtrRoutes = await getMtrRoutes();
          results.push(...mtrRoutes.map(route => ({...route, mode: 'MTR' as TransportMode })));
        }
        break;
    }
  }
  
  return results;
}

/**
 * Enhanced nearby stops search across multiple transport modes.
 * Combines results from different modes and providers, sorting by distance.
 * 
 * @param latitude - Current latitude
 * @param longitude - Current longitude
 * @param radiusMeters - Search radius in meters
 * @param modes - Array of transport modes to include
 * @returns Combined array of nearby stops with distance information
 */
export async function findUnifiedNearbyStops(
  latitude: number,
  longitude: number,
  radiusMeters = 500,
  modes: TransportMode[] = ['BUS']
): Promise<Array<TransportStop & { distance: number }>> {
  const results: Array<TransportStop & { distance: number }> = [];
  
  for (const mode of modes) {
    switch (mode) {
      case 'BUS':
        const kmbStops = await findNearbyKmbStops(latitude, longitude, radiusMeters);
        results.push(...kmbStops.map(stop => ({
          ...stop, 
          mode: 'BUS' as TransportMode 
        })));
        break;
        
      case 'MTR':
        const mtrStops = await findNearbyMtrStations(latitude, longitude, radiusMeters);
        results.push(...mtrStops.map(stop => ({
          ...stop, 
          mode: 'MTR' as TransportMode 
        })));
        break;
    }
  }
  
  return results.sort((a, b) => a.distance - b.distance);
}

/**
 * Re-exports from various transport utility modules.
 * Provides a unified interface for accessing transport-specific functions.
 * 从各种交通工具模块重新导出函数，提供统一的接口来访问特定交通工具的功能。
 */
export { 
  // Re-export from KMB utilities
  // 从九巴（KMB）工具重新导出功能
  getAllRoutes as getAllKmbRoutes,       // 获取所有九巴路线
  getRouteDetails as getKmbRouteDetails, // 获取九巴路线详情
  getRouteStops as getKmbRouteStops,     // 获取九巴路线站点
  getAllStops as getAllKmbStops,         // 获取所有九巴站点
  getStopETA as getKmbStopETA,           // 获取九巴站点到达时间预估
  classifyStopETAs as classifyKmbStopETAs, // 分类九巴站点到达时间预估
} from './kmb';

export {
  // Re-export from GMB utilities
  // 从绿色小巴（GMB）工具重新导出功能
  getAllRoutes as getAllGmbRoutes,       // 获取所有绿色小巴路线
  getRouteDetails as getGmbRouteDetails, // 获取绿色小巴路线详情
  getRouteStops as getGmbRouteStops,     // 获取绿色小巴路线站点
  getAllStops as getAllGmbStops,         // 获取所有绿色小巴站点
  getStopETA as getGmbStopETA,           // 获取绿色小巴站点到达时间预估
  classifyStopETAs as classifyGmbStopETAs, // 分类绿色小巴站点到达时间预估
} from './gmb';

export {
  // Re-export from CTB utilities
  // 从城巴（CTB）工具重新导出功能
  getStopETA as getCtbStopETA,           // 获取城巴站点到达时间预估
  classifyStopETAs as classifyCtbStopETAs, // 分类城巴站点到达时间预估
} from './ctb';

// export {
//   getStopETA as getNlbStopETA,           // 获取新大屿山巴士站点到达时间预估
//   classifyStopETAs as classifyNlbStopETAs, // 分类新大屿山巴士站点到达时间预估
// } from './nlb';

// export {

//   getScheduledDepartures as getHkkfScheduledDepartures, // 获取香港街渡计划出发时间
//   classifyScheduledDepartures as classifyHkkfScheduledDepartures, // 分类香港街渡计划出发时间
// } from './hkkf';

// Re-export from MTR utilities using proper naming 
// 从港铁（MTR）工具重新导出功能，使用恰当的命名
export {
  getAllRoutes as getAllMtrRoutes,       // 获取所有港铁路线
  getAllStops as getAllMtrStops,         // 获取所有港铁站点
  getStopETA as getMtrStopETA,           // 获取港铁站点到达时间预估
  classifyStopETAs as classifyMtrStopETAs, // 分类港铁站点到达时间预估
} from './mtr';
