import axios, { AxiosError } from 'axios';
import { ReactNode } from 'react';
import { appConfig } from './config';
import { calculateDistance } from './calculateDistance';

export interface Route {
  dest_tc: ReactNode;
  orig_tc: ReactNode;
  co: 'KMB';
  route: string;
  bound: 'I' | 'O';
  service_type: string;
  orig_en: string;
  dest_en: string;
  data_timestamp: string;
}

interface Stop {
  distance: number;
  stop: string;
  name_en: string;
  name_tc: string;
  name_sc: string;
  lat: number;
  long: number;
  data_timestamp: string;
}

interface RouteStop {
  co: 'KMB';
  route: string;
  bound: 'I' | 'O';
  service_type: string;
  seq: number;
  stop: string;
  data_timestamp: string;
}

export interface ETA {
  rmk_tc: ReactNode;
  dest_tc: string;
  co: 'KMB';
  route: string;
  dir: 'I' | 'O';
  service_type: string;
  seq: number;
  stop: string;
  dest_en: string;
  eta_seq: number;
  eta: string | null;
  rmk_en: string;
  data_timestamp: string;
}

interface ApiResponse<T> {
  type: string;
  version: string;
  generated_timestamp: string;
  data: T;
}

const API_BASE = 'https://data.etabus.gov.hk/v1/transport/kmb';

// Cache system with expiration
const apiCache = new Map<string, { timestamp: number; data: unknown }>();
const CACHE_TTL = appConfig.apiCacheTTL;

/**
 * Makes a cached API request - prevents redundant requests to the same URL
 * within the cache TTL period
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
    const { data } = await axios.get<ApiResponse<T>>(url);
    apiCache.set(url, { timestamp: now, data: data.data });
    return data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`KMB API request failed: ${url}`, axiosError);
    throw new Error(`KMB API request failed: ${axiosError.message}`);
  }
}

/**
 * Gets all KMB bus routes
 */
async function getAllRoutes(): Promise<Route[]> {
  return cachedApiGet<Route[]>(`${API_BASE}/route/`);
}

/**
 * Gets details for a specific route
 */
async function getRouteDetails(
  route: string,
  direction: 'inbound' | 'outbound',
  serviceType: string
): Promise<Route> {
  return cachedApiGet<Route>(
    `${API_BASE}/route/${encodeURIComponent(route)}/${direction}/${serviceType}`
  );
}

/**
 * Gets stops for a specific route
 */
async function getRouteStops(
  route: string,
  direction: 'inbound' | 'outbound',
  serviceType: string
): Promise<RouteStop[]> {
  const url = `${API_BASE}/route-stop/${encodeURIComponent(route)}/${direction}/${serviceType}`;
  console.log(`Fetching route stops: ${url}`);
  return cachedApiGet<RouteStop[]>(url);
}

/**
 * Gets all KMB bus stops
 */
async function getAllStops(): Promise<Stop[]> {
  const stops = await cachedApiGet<Stop[]>(`${API_BASE}/stop`);
  
  return stops.map(stop => ({
    ...stop,
    lat: Number(stop.lat),
    long: Number(stop.long),
  })).filter(stop => 
    !isNaN(stop.lat) && 
    !isNaN(stop.long) &&
    stop.lat >= 22.1 && stop.lat <= 22.6 && 
    stop.long >= 113.8 && stop.long <= 114.4 
  );
}

/**
 * Gets ETAs for a specific stop with retry mechanism
 */
async function getStopETA(stopId: string, retries = 2): Promise<ETA[]> {
  try {
    return await cachedApiGet<ETA[]>(
      `${API_BASE}/stop-eta/${encodeURIComponent(stopId)}`
    );
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying ETA for stop ${stopId}, ${retries} retries left`);
      return getStopETA(stopId, retries - 1);
    }
    throw error;
  }
}



/**
 * Finds stops near a specified location within a radius
 */
async function findNearbyStops(
  targetLat: number,
  targetLon: number,
  radiusMeters = 500
): Promise<Array<Stop & { distance: number }>> {
  if (!isValidCoordinate(targetLat, targetLon)) {
    throw new Error('Invalid coordinate parameters');
  }

  const allStops = await getAllStops();
  
  return allStops
    .map(stop => ({
      ...stop,
      distance: calculateDistance(targetLat, targetLon, stop.lat, stop.long)
    }))
    .filter(stop => stop.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Validates geographic coordinates
 */
function isValidCoordinate(lat: number, lon: number): boolean {
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

export interface ClassifiedETA {
  route: string;
  direction: 'Inbound' | 'Outbound';
  serviceType: string;
  destination_en: string;
  destination_tc: string;
  etas: ETA[];
}

/**
 * Organizes ETAs for a stop by routes
 */
async function classifyStopETAs(stopId: string): Promise<ClassifiedETA[]> {
  try {
    const etas = await getStopETA(stopId);
    
    return Object.values(
      etas.reduce((acc, eta) => {
        const key = `${eta.route}-${eta.dir}-${eta.service_type}`;
        
        if (!acc[key]) {
          acc[key] = {
            route: eta.route,
            direction: eta.dir === 'I' ? 'Inbound' : 'Outbound',
            serviceType: eta.service_type,
            destination_en: eta.dest_en,
            destination_tc: eta.dest_tc,
            etas: []
          };
        }
        
        acc[key].etas.push(eta);
        return acc;
      }, {} as Record<string, ClassifiedETA>)
    );
  } catch (error) {
    console.error(`Failed to classify ETAs for stop ${stopId}`, error);
    return [];
  }
}

/**
 * Clears the KMB API cache
 */
function clearCache(): void {
  apiCache.clear();
}

export {
  classifyStopETAs,
  getAllRoutes,
  getRouteDetails,
  getRouteStops,
  getAllStops,
  getStopETA,
  calculateDistance,
  findNearbyStops,
  clearCache,
  isValidCoordinate,
  type Stop, 
  type RouteStop
};
