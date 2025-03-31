import axios, { AxiosError } from 'axios';
import { appConfig } from './config';
import { isSafari } from './transport';
import { TransportETA, ClassifiedTransportETA } from '@/types/transport-types';

export interface Route {
  route: string;
  bound: string;
  service_type?: string;
  orig_en: string;
  orig_tc: string;
  dest_en: string;
  dest_tc: string;
  data_timestamp?: string;
}

export interface Stop {
  stop: string;
  name_en: string;
  name_tc: string;
  lat: number;
  long: number;
  data_timestamp?: string;
}

export interface RouteStop {
  route: string;
  bound: string;
  service_type?: string;
  seq: number;
  stop: string;
  data_timestamp?: string;
}

export interface ETA {
  co: 'CTB';
  route: string;
  dir: string;
  service_type?: string;
  seq?: number;
  stop: string;
  dest_en: string;
  dest_tc: string;
  eta: string | null;
  rmk_en: string;
  rmk_tc: string;
  data_timestamp?: string;
}

interface ApiResponse<T> {
  data: T;
}

const API_BASE = 'https://rt.data.gov.hk/v2/transport/citybus';

// Cache system
const apiCache = new Map<string, { timestamp: number; data: unknown }>();
const CACHE_TTL = appConfig.apiCacheTTL;

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
    const { data } = await axios.get<ApiResponse<T>>(url, {
      headers: {
        'Cache-Control': isSafari ? '' : 'no-cache',
        'Pragma': isSafari ? '' : 'no-cache',
      },
    });
    apiCache.set(url, { timestamp: now, data: data.data });
    return data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`CTB API request failed: ${url}`, axiosError);
    throw new Error(`CTB API request failed: ${axiosError.message}`);
  }
}

/**
 * Gets ETAs for a specific stop
 */
async function getStopETA(stopId: string, route?: string, retries = 2): Promise<ETA[]> {
  try {
    const url = route 
      ? `${API_BASE}/eta/CTB/${encodeURIComponent(stopId)}/${encodeURIComponent(route)}`
      : `${API_BASE}/eta/CTB/${encodeURIComponent(stopId)}`;
    
    const response = await cachedApiGet<{data: any[]}>(url);
    
    return response.data.map(e => ({
      co: 'CTB' as const,
      route: e.route,
      dir: e.dir,
      service_type: e.service_type,
      seq: e.seq,
      stop: e.stop,
      dest_en: e.dest_en,
      dest_tc: e.dest_tc,
      eta: e.eta,
      rmk_en: e.rmk_en,
      rmk_tc: e.rmk_tc,
      data_timestamp: e.data_timestamp,
    }));
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying CTB ETA for stop ${stopId}, ${retries} retries left`);
      return getStopETA(stopId, route, retries - 1);
    }
    console.error(`Failed to get CTB ETAs for stop ${stopId}`, error);
    return [];
  }
}

/**
 * Organizes ETAs for a stop by routes
 */
async function classifyStopETAs(stopId: string): Promise<ClassifiedTransportETA[]> {
  try {
    const etas = await getStopETA(stopId);
    
    return Object.values(
      etas.reduce((acc, eta) => {
        const key = `${eta.route}-${eta.dir}-${eta.service_type || 'default'}`;
        
        if (!acc[key]) {
          acc[key] = {
            route: eta.route,
            direction: eta.dir === 'I' ? 'Inbound' : 'Outbound',
            serviceType: eta.service_type || 'default',
            destination_en: eta.dest_en,
            destination_tc: eta.dest_tc,
            etas: [],
            company: 'CTB',
          };
        }
        
        acc[key].etas.push(eta);
        return acc;
      }, {} as Record<string, ClassifiedTransportETA>)
    );
  } catch (error) {
    console.error(`Failed to classify CTB ETAs for stop ${stopId}`, error);
    return [];
  }
}

/**
 * Clears the CTB API cache
 */
function clearCache(): void {
  apiCache.clear();
}

export {
  getStopETA,
  classifyStopETAs,
  clearCache,
}
