import { TransportRoute, TransportStop, TransportRouteStop, TransportETA, ClassifiedTransportETA, TransportApiResponse } from '@/types/transport-types';
import axios, { AxiosError } from 'axios';
import { isSafari } from './transport';
import { appConfig } from './config';

export type Route = TransportRoute;
export type Stop = TransportStop;
export type RouteStop = TransportRouteStop;
export type ETA = TransportETA;
export type ClassifiedETA = ClassifiedTransportETA;

const API_BASE = 'https://data.etagmb.gov.hk'; // GMB API base URL
const CACHE_TTL = appConfig.apiCacheTTL; // Use global cache TTL

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
    const { data } = await axios.get<TransportApiResponse<T>>(url, {
      headers: {
        'Cache-Control': isSafari ? 'max-age=3600' : 'no-cache',
        'Pragma': isSafari ? 'cache' : 'no-cache',
      },
    });
    apiCache.set(url, { timestamp: now, data: data.data });
    return data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`GMB API request failed: ${url}`, axiosError);
    throw new Error(`GMB API request failed: ${axiosError.message}`);
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
  try {
    // The GMB API doesn't have a direct /stop endpoint like KMB
    // Instead, we need to fetch stops by region
    const regions: ('HKI' | 'KLN' | 'NT')[] = ['HKI', 'KLN', 'NT'];
    let allStops: Stop[] = [];
    
    for (const region of regions) {
      try {
        // First get routes for the region
        const routes = await getAllRoutes(region);
        
        // Then for each route, get the route details which contain stop information
        for (const route of routes.slice(0, 5)) { // Limit to 5 routes per region to avoid too many requests
          try {
            const routeDetails = await getRouteDetails(region, route.route);
            
            if (routeDetails.route_id) {
              // Get stops for both directions (outbound and inbound)
              try {
                const outboundStops = await getRouteStops(routeDetails.route_id, '1');
                const inboundStops = await getRouteStops(routeDetails.route_id, '2');
                
                // Combine stops and remove duplicates
                const routeStops = [...outboundStops, ...inboundStops];
                
                // Add each unique stop
                for (const routeStop of routeStops) {
                  // Skip if we already have this stop
                  if (allStops.some(s => s.stop === routeStop.stop)) continue;
                  
                  // Add stop with location data if available
                  allStops.push({
                    stop: routeStop.stop,
                    name_en: routeStop.name_en || 'Unknown',
                    name_tc: routeStop.name_tc || '未知',
                    lat: 0, // We don't have lat/long from route stops
                    long: 0, // We would need another API call to get this
                    company: 'GMB',
                    mode: 'BUS'
                  });
                }
              } catch (error) {
                console.warn(`Failed to get stops for GMB route ${route.route} in ${region}:`, error);
              }
            }
          } catch (error) {
            console.warn(`Failed to get details for GMB route ${route.route} in ${region}:`, error);
          }
        }
      } catch (error) {
        console.warn(`Failed to get GMB routes for region ${region}:`, error);
      }
    }
    
    console.log(`Retrieved ${allStops.length} GMB stops`);
    return allStops;
  } catch (error) {
    console.error('Error fetching GMB stops:', error);
    return [];
  }
}

/**
 * Get ETA for a specific stop on a route, updated to match src/gmb.ts implementation
 * @param {string} gtfsId - Route ID (same as routeId)
 * @param {string} stopId - Stop ID
 * @param {string} bound - Direction (O for outbound, I for inbound)
 * @param {number} seq - Sequence number
 * @returns {Promise<ETA[]>} Array of ETAs
 */
async function getStopETA(
  gtfsId: string,  
  stopId: string, 
  bound: 'O' | 'I' = 'O', 
  seq: number = 0,
  retries = 2
): Promise<ETA[]> {
  try {
    // Use route-stop endpoint format from src/gmb.ts
    const url = `${API_BASE}/eta/route-stop/${encodeURIComponent(gtfsId)}/${encodeURIComponent(stopId)}`;
    const response = await cachedApiGet<any>(url);
    
    return response.data
      .filter((item: any) => 
        (bound === 'O' && item.route_seq === 1) || 
        (bound === 'I' && item.route_seq === 2)
      )
      .filter((item: any) => seq === 0 || item.stop_seq === seq + 1)
      .reduce((acc: ETA[], { enabled, eta, description_tc, description_en }: any) => [
        ...acc,
        ...(enabled
          ? eta.map((data: any) => ({
              co: 'GMB',
              route: gtfsId,
              dir: bound,
              eta: data.timestamp,
              diff: data.diff,
              rmk_en: data.remarks_en || '',
              rmk_tc: data.remarks_tc || '',
              remarks_en: data.remarks_en,
              remarks_tc: data.remarks_tc,
            }))
          : [{
              co: 'GMB',
              route: gtfsId,
              dir: bound,
              eta: null,
              rmk_en: description_en || '',
              rmk_tc: description_tc || '',
              remarks_en: description_en,
              remarks_tc: description_tc,
            }]
        ),
      ], []);
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying GMB ETA for route ${gtfsId}, stop ${stopId}, ${retries} retries left`);
      return getStopETA(gtfsId, stopId, bound, seq, retries - 1);
    }
    console.error('GMB ETA fetch error:', error);
    return [];
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

/**
 * Classify ETAs for a stop, updated to use the same pattern as src/gmb.ts
 */
async function classifyStopETAs(stopId: string, routeId?: string): Promise<ClassifiedETA[]> {
  try {
    if (!routeId) {
      // If no routeId is provided, try to get all routes for this stop
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
          rmk_en: eta.remarks_en || '',
          rmk_tc: eta.remarks_tc || '',
          remarks_en: eta.remarks_en,
          remarks_tc: eta.remarks_tc,
          co: 'GMB',
        })) : [],
        company: 'GMB',
      }));
    } else {
      // Fetch ETAs for specific route-stop combination (both outbound and inbound)
      const outboundETAs = await getStopETA(routeId, stopId, 'O');
      const inboundETAs = await getStopETA(routeId, stopId, 'I');
      
      const results: ClassifiedETA[] = [];
      
      if (outboundETAs.length > 0) {
        results.push({
          route: routeId,
          direction: 'Outbound',
          serviceType: 'Normal',
          destination_en: '',
          destination_tc: '',
          etas: outboundETAs,
          company: 'GMB',
        });
      }
      
      if (inboundETAs.length > 0) {
        results.push({
          route: routeId,
          direction: 'Inbound',
          serviceType: 'Normal',
          destination_en: '',
          destination_tc: '',
          etas: inboundETAs,
          company: 'GMB',
        });
      }
      
      return results;
    }
  } catch (error) {
    console.error('Failed to classify GMB ETAs:', error);
    return [];
  }
}

/**
 * Clears the GMB API cache
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
  isValidCoordinate,
  clearCache,
};