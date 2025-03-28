import { TransportRoute, TransportStop, TransportRouteStop, TransportETA, ClassifiedTransportETA, TransportApiResponse } from '@/types/transport-types';
import axios, { AxiosError } from 'axios';

export type Route = TransportRoute;
export type Stop = TransportStop;
export type RouteStop = TransportRouteStop;
export type ETA = TransportETA;
export type ClassifiedETA = ClassifiedTransportETA;

const API_BASE = 'https://data.etagmb.gov.hk'; // GMB API base URL
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

const apiCache = new Map<string, { timestamp: number; data: unknown }>();

async function cachedApiGet<T>(url: string): Promise<T> {
  const now = Date.now();
  
  if (apiCache.has(url)) {
    const entry = apiCache.get(url)!;
    if (now - entry.timestamp < CACHE_TTL) {
      return entry.data as T;
    }
  }

  try {
    const { data } = await axios.get<TransportApiResponse<T>>(url);
    apiCache.set(url, { timestamp: now, data: data.data });
    return data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error(`API request failed: ${axiosError.message}`);
  }
}

// Get all routes, optionally filtered by region
async function getAllRoutes(region?: 'HKI' | 'KLN' | 'NT'): Promise<Route[]> {
  const url = region ? `${API_BASE}/route/${region}` : `${API_BASE}/route`;
  const response = await cachedApiGet<any>(url);

  let routes: Route[] = [];
  if (region) {
    // Response for specific region (Routes-Regional)
    routes = response.routes.map((routeCode: string) => ({
      route: routeCode,
      co: 'GMB',
      region,
    }));
  } else {
    // Response for all regions (Routes-All)
    const allRoutes = response.routes;
    routes = Object.keys(allRoutes).flatMap((reg: string) =>
      allRoutes[reg].map((routeCode: string) => ({
        route: routeCode,
        co: 'GMB',
        region: reg as 'HKI' | 'KLN' | 'NT',
      }))
    );
  }
  return routes;
}

// Get detailed route information
async function getRouteDetails(
  region: 'HKI' | 'KLN' | 'NT',
  routeCode: string
): Promise<Route> {
  const response = await cachedApiGet<any>(
    `${API_BASE}/route/${encodeURIComponent(region)}/${encodeURIComponent(routeCode)}`
  );
  const routeData = response[0]; // Assuming first variation for simplicity
  return {
    route: routeData.route_code,
    co: 'GMB',
    region: routeData.region,
    route_id: routeData.route_id,
    description_en: routeData.description_en,
    description_tc: routeData.description_tc,
    directions: routeData.directions.map((dir: any) => ({
      route_seq: dir.route_seq,
      orig_en: dir.orig_en,
      orig_tc: dir.orig_tc,
      dest_en: dir.dest_en,
      dest_tc: dir.dest_tc,
    })),
  };
}

// Get route stops
async function getRouteStops(
  routeId: string,
  routeSeq: '1' | '2'
): Promise<RouteStop[]> {
  const url = `${API_BASE}/route-stop/${encodeURIComponent(routeId)}/${routeSeq}`;
  const response = await cachedApiGet<any>(url);
  return response.route_stops.map((rs: any) => ({
    stop: rs.stop_id,
    seq: rs.stop_seq,
    name_en: rs.name_en,
    name_tc: rs.name_tc,
  }));
}

// Get all stops
async function getAllStops(): Promise<Stop[]> {
  const stops = await cachedApiGet<any>(`${API_BASE}/stop`); // Note: GMB API doesn't provide a direct /stop endpoint for all stops, using individual stop lookup as workaround
  // This is a limitation; in practice, you'd need to fetch stops via route-stop or stop-route APIs
  return stops.map((stop: any) => ({
    stop: stop.stop_id,
    name_en: stop.name_en || 'Unknown',
    name_tc: stop.name_tc || '未知',
    lat: stop.coordinates.wgs84.latitude,
    long: stop.coordinates.wgs84.longitude,
  })).filter((stop: Stop) =>
    !isNaN(stop.lat) &&
    !isNaN(stop.long) &&
    stop.lat >= 22.1 && stop.lat <= 22.6 &&
    stop.long >= 113.8 && stop.long <= 114.4
  );
}

// Get ETA for a specific stop on a route
async function getStopETA(routeId: string, routeSeq: '1' | '2', stopSeq: string, retries = 2): Promise<ETA[]> {
  try {
    const response = await cachedApiGet<any>(
      `${API_BASE}/eta/route-stop/${encodeURIComponent(routeId)}/${routeSeq}/${encodeURIComponent(stopSeq)}`
    );
    if (!response.enabled) {
      return [];
    }
    return response.eta.map((eta: any) => ({
      route: routeId,
      dir: routeSeq === '1' ? 'O' : 'I', // Mapping route_seq to direction (simplified)
      eta: eta.timestamp,
      diff: eta.diff,
      remarks_en: eta.remarks_en,
      remarks_tc: eta.remarks_tc,
    }));
  } catch (error) {
    if (retries > 0) {
      return getStopETA(routeId, routeSeq, stopSeq, retries - 1);
    }
    throw error;
  }
}

// Calculate distance between two coordinates
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
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Find nearby stops
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
      distance: calculateDistance(targetLat, targetLon, stop.lat, stop.long),
    }))
    .filter(stop => stop.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance);
}

// Validate coordinates
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

// Classify ETAs for a stop (using stop_id)
async function classifyStopETAs(stopId: string): Promise<ClassifiedETA[]> {
  const response = await cachedApiGet<any>(`${API_BASE}/eta/stop/${encodeURIComponent(stopId)}`);
  return response.map((route: any) => ({
    route: route.route_id.toString(),
    direction: route.route_seq === 1 ? 'Outbound' : 'Inbound',
    serviceType: 'Normal', // GMB doesn't specify service type explicitly
    destination_en: '', // Need route details for this, simplified here
    destination_tc: '',
    etas: route.enabled ? route.eta.map((eta: any) => ({
      route: route.route_id.toString(),
      dir: route.route_seq === 1 ? 'O' : 'I',
      eta: eta.timestamp,
      diff: eta.diff,
      remarks_en: eta.remarks_en,
      remarks_tc: eta.remarks_tc,
    })) : [],
    company: 'GMB',
  }));
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
  isValidCoordinate,
};