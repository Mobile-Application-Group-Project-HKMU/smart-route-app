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

// Cache management
const apiCache = new Map<string, { timestamp: number; data: unknown }>();

/**
 * Makes a cached API request - prevents redundant requests to the same URL
 * within the cache TTL period
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
 * Clears the API cache
 */
export function clearApiCache(): void {
  apiCache.clear();
}

/**
 * Calculate distance between two geographic coordinates
 */
export function calculateDistance(
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
 * Determines if coordinates are valid
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
 * Detect if the current browser is Safari
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
 * Find nearby stops from multiple transport providers
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
 * Format ETA as a user-friendly string
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
 * Get ETAs for a stop from multiple transport providers
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
 * Get CTB routes
 */
async function getCtbRoutes(): Promise<TransportRoute[]> {
  // Placeholder implementation - replace with actual CTB API call
  return [];
}

/**
 * Get MTR routes
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
 * Find nearby KMB stops
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
 * Find nearby MTR stations
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
 * Get combined transport data from multiple providers
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
 * Enhanced nearby stops search
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
 * Export existing transport utilities
 */
export { 
  // Re-export from KMB utilities
  getAllRoutes as getAllKmbRoutes,
  getRouteDetails as getKmbRouteDetails,
  getRouteStops as getKmbRouteStops,
  getAllStops as getAllKmbStops,
  getStopETA as getKmbStopETA,
  classifyStopETAs as classifyKmbStopETAs,
} from './kmb';

export {
  // Re-export from GMB utilities
  getAllRoutes as getAllGmbRoutes,
  getRouteDetails as getGmbRouteDetails,
  getRouteStops as getGmbRouteStops,
  getAllStops as getAllGmbStops,
  getStopETA as getGmbStopETA,
  classifyStopETAs as classifyGmbStopETAs,
} from './gmb';

export {
  // Re-export from CTB utilities
  getStopETA as getCtbStopETA,
  classifyStopETAs as classifyCtbStopETAs,
} from './ctb';

export {
  // Re-export from NLB utilities
  getStopETA as getNlbStopETA,
  classifyStopETAs as classifyNlbStopETAs,
} from './nlb';

export {
  // Re-export from HKKF utilities
  getScheduledDepartures as getHkkfScheduledDepartures,
  classifyScheduledDepartures as classifyHkkfScheduledDepartures,
} from './hkkf';

// Re-export from MTR utilities using proper naming 
export {
  getAllRoutes as getAllMtrRoutes,
  getAllStops as getAllMtrStops,
  getStopETA as getMtrStopETA,
  classifyStopETAs as classifyMtrStopETAs,
} from './mtr';
