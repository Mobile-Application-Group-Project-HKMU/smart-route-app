import axios, { AxiosError } from 'axios';
import { appConfig } from './config';
import { isSafari } from './transport';
import { ClassifiedTransportETA } from '@/types/transport-types';

export interface ETA {
  co: 'HKKF';
  route?: string;
  eta: string;
  remark_en: string;
  remark_tc: string;
}

/**
 * Gets scheduled ferry departures
 * Note: HKKF doesn't provide a real-time API, so this returns scheduled times
 */
async function getScheduledDepartures(
  route: string, 
  direction: 'inbound' | 'outbound' = 'outbound'
): Promise<ETA[]> {
  try {
    // Note: This URL might need to be updated with the actual API endpoint
    const response = await axios.get(
      `https://www.hkkfeta.com/opendata/eta/${route}/${direction}`,
      {
        headers: isSafari ? {} : {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

    const { data } = response.data;
    if (!data) return [];
    
    return data.map((item: any) => ({
      co: 'HKKF' as const,
      route,
      eta: item.ETA,
      remark_en: "Scheduled",
      remark_tc: "預定班次",
    }));
  } catch (error) {
    console.error(`Failed to get HKKF schedule for route ${route}`, error);
    
    // Fallback to predefined schedule
    const now = new Date();
    const departureTime = new Date(now);
    departureTime.setHours(departureTime.getHours() + 1);
    departureTime.setMinutes(0);
    departureTime.setSeconds(0);
    
    return [{
      co: 'HKKF' as const,
      route,
      eta: departureTime.toISOString(),
      remark_en: "Estimated Schedule",
      remark_tc: "預計班次",
    }];
  }
}

/**
 * Organizes scheduled departures by routes
 */
async function classifyScheduledDepartures(routes: string[]): Promise<ClassifiedTransportETA[]> {
  try {
    const results: ClassifiedTransportETA[] = [];
    
    for (const route of routes) {
      const etas = await getScheduledDepartures(route);
      
      if (etas.length > 0) {
        results.push({
          route,
          direction: 'Outbound',
          serviceType: 'default',
          destination_en: '',
          destination_tc: '',
          etas: etas,
          company: 'HKKF',
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Failed to classify HKKF schedules`, error);
    return [];
  }
}

export {
  getScheduledDepartures,
  classifyScheduledDepartures,
}
