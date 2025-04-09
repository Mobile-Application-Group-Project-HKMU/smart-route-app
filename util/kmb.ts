/**
 * KMB API utility module
 * Provides functions and interfaces for interacting with the KMB bus data API
 * 
 * 九巴API工具模块
 * 提供与九巴巴士数据API交互的函数和接口
 */
import axios, { AxiosError } from 'axios';
import { ReactNode } from 'react';
import { appConfig } from './config';
import { calculateDistance } from './calculateDistance';

/**
 * Represents a KMB bus route with origin, destination and route information
 * 表示九巴巴士路线，包含起点、终点和路线信息
 */
export interface Route {
  dest_tc: ReactNode;  // Destination in Traditional Chinese - 繁体中文目的地名称
  orig_tc: ReactNode;  // Origin in Traditional Chinese - 繁体中文起点名称
  co: 'KMB';           // Company identifier (KMB only) - 公司标识符（仅限九巴）
  route: string;       // Route number/code - 路线编号/代码
  bound: 'I' | 'O';    // Direction: 'I' for Inbound, 'O' for Outbound - 方向：'I'为入站，'O'为出站
  service_type: string; // Service type identifier - 服务类型标识符
  orig_en: string;     // Origin in English - 英文起点名称
  dest_en: string;     // Destination in English - 英文目的地名称
  data_timestamp: string; // Timestamp when data was generated - 数据生成的时间戳
}

/**
 * Represents a KMB bus stop with location and name information
 */
interface Stop {
  distance: number;    // Distance from a reference point (in meters)
  stop: string;        // Stop identifier
  name_en: string;     // Stop name in English
  name_tc: string;     // Stop name in Traditional Chinese
  name_sc: string;     // Stop name in Simplified Chinese
  lat: number;         // Latitude coordinate
  long: number;        // Longitude coordinate
  data_timestamp: string; // Timestamp when data was generated
}

/**
 * Represents a stop in a specific route with sequence information
 */
interface RouteStop {
  co: 'KMB';           // Company identifier (KMB only)
  route: string;       // Route number/code
  bound: 'I' | 'O';    // Direction: 'I' for Inbound, 'O' for Outbound
  service_type: string; // Service type identifier
  seq: number;         // Sequence number of the stop in the route
  stop: string;        // Stop identifier
  data_timestamp: string; // Timestamp when data was generated
}

/**
 * Represents Estimated Time of Arrival information for a bus at a stop
 */
export interface ETA {
  rmk_tc: ReactNode;   // Remarks in Traditional Chinese
  dest_tc: string;     // Destination in Traditional Chinese
  co: 'KMB';           // Company identifier (KMB only)
  route: string;       // Route number/code
  dir: 'I' | 'O';      // Direction: 'I' for Inbound, 'O' for Outbound
  service_type: string; // Service type identifier
  seq: number;         // Sequence number
  stop: string;        // Stop identifier
  dest_en: string;     // Destination in English
  eta_seq: number;     // ETA sequence number
  eta: string | null;  // Estimated arrival time (ISO format) or null if unavailable
  rmk_en: string;      // Remarks in English
  data_timestamp: string; // Timestamp when data was generated
}

/**
 * Standard response structure from the KMB API
 */
interface ApiResponse<T> {
  type: string;        // Response type
  version: string;     // API version
  generated_timestamp: string; // When the response was generated
  data: T;             // The actual data payload
}

/**
 * Base URL for the KMB API endpoints
 */
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
 * 在指定半径内查找靠近特定位置的巴士站
 * 
 * @param targetLat - Target latitude - 目标纬度
 * @param targetLon - Target longitude - 目标经度
 * @param radiusMeters - Search radius in meters (default: 500) - 搜索半径，单位为米（默认：500）
 * @returns Array of stops with distance information - 包含距离信息的巴士站数组
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
  dest_en: ReactNode;
  route: string;
  direction: 'Inbound' | 'Outbound';
  serviceType: string;
  destination_en: string;
  destination_tc: string;
  etas: ETA[];
}

/**
 * Organizes ETAs for a stop by routes
 * 按路线整理巴士站的预计到达时间
 * 
 * @param stopId - ID of the bus stop - 巴士站ID
 * @returns Array of classified ETAs grouped by route and direction - 按路线和方向分类的预计到达时间数组
 */
async function classifyStopETAs(stopId: string): Promise<ClassifiedETA[]> {
  try {
    const etas = await getStopETA(stopId);
    
    return Object.values(
      etas.reduce((acc, eta) => {
        const key = `${eta.route}-${eta.dir}-${eta.service_type}`;
        
        if (!acc[key]) {
          acc[key] = {
            dest_en: eta.dest_en,
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
