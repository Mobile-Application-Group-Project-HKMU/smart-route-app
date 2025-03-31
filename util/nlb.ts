import axios from 'axios';
import { appConfig } from './config';
import { isSafari } from './transport';
import { ClassifiedTransportETA } from '@/types/transport-types';

export interface ETA {
  co: 'NLB';
  route?: string;
  eta: string | null;
  remark_en?: string;
  remark_tc?: string;
  data_timestamp?: string;
}

const API_BASE = 'https://rt.data.gov.hk/v1/transport/nlb/stop.php';

// Cache system
const apiCache = new Map<string, { timestamp: number; data: unknown }>();
const CACHE_TTL = appConfig.apiCacheTTL;

/**
 * Gets ETAs for a specific stop and NLB route
 */
async function getStopETA(stopId: string, routeId: string, retries = 2): Promise<ETA[]> {
  try {
    const response = await axios.post(
      API_BASE,
      JSON.stringify({
        routeId,
        stopId,
        language: "zh",
      }),
      {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": isSafari ? "max-age=60" : "no-store",
        },
      }
    );

    const { estimatedArrivals } = response.data;
    if (!estimatedArrivals) return [];

    return estimatedArrivals
      .filter((eta: any) => eta.estimatedArrivalTime)
      .map((e: any) => ({
        co: 'NLB' as const,
        route: routeId,
        eta: e.estimatedArrivalTime.replace(" ", "T") + ".000+08:00",
        remark_en: "",
        remark_tc: "",
      }));
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying NLB ETA for stop ${stopId}, ${retries} retries left`);
      return getStopETA(stopId, routeId, retries - 1);
    }
    console.error(`Failed to get NLB ETAs for stop ${stopId}`, error);
    return [];
  }
}

/**
 * Organizes ETAs for a stop by routes
 */
async function classifyStopETAs(stopId: string, routeIds: string[]): Promise<ClassifiedTransportETA[]> {
  try {
    const results: ClassifiedTransportETA[] = [];
    
    for (const routeId of routeIds) {
      const etas = await getStopETA(stopId, routeId);
      
      if (etas.length > 0) {
        results.push({
          route: routeId,
          direction: 'Outbound', // NLB doesn't specify direction in API
          serviceType: 'default',
          destination_en: '',
          destination_tc: '',
          etas: etas,
          company: 'NLB',
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Failed to classify NLB ETAs for stop ${stopId}`, error);
    return [];
  }
}

/**
 * Clears the NLB API cache
 */
function clearCache(): void {
  apiCache.clear();
}

export {
  getStopETA,
  classifyStopETAs,
  clearCache,
}
