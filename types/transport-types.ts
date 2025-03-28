// transport-types.ts

// Generic API response wrapper based on GMB API structure
export interface TransportApiResponse<T> {
    type: string; // e.g., "Route", "Stop", "ETA-Route-Stop"
    version: string; // e.g., "1.0"
    generated_timestamp: string; // ISO timestamp in HKT, e.g., "2020-12-28T15:14:08.595+08:00"
    data: T; // The actual payload data
  }
  
  // Route information
  export interface TransportRoute {
    route: string; // Route code (e.g., "69")
    co: string; // Company identifier (e.g., "GMB")
    region?: 'HKI' | 'KLN' | 'NT'; // Region abbreviation
    route_id?: string; // Unique route ID (e.g., "2000410")
    description_en?: string; // English description (e.g., "Normal Schedule")
    description_tc?: string; // Traditional Chinese description
    description_sc?: string; // Simplified Chinese description (optional)
    directions?: Array<{
      route_seq: number; // Route sequence (1 or 2)
      orig_en: string; // Origin in English
      orig_tc: string; // Origin in Traditional Chinese
      orig_sc?: string; // Origin in Simplified Chinese (optional)
      dest_en: string; // Destination in English
      dest_tc: string; // Destination in Traditional Chinese
      dest_sc?: string; // Destination in Simplified Chinese (optional)
      remarks_en?: string | null; // Remarks in English
      remarks_tc?: string | null; // Remarks in Traditional Chinese
      remarks_sc?: string | null; // Remarks in Simplified Chinese (optional)
    }>;
  }
  
  // Stop information
  export interface TransportStop {
    stop: string; // Stop ID (e.g., "20003337")
    name_en: string; // Stop name in English
    name_tc: string; // Stop name in Traditional Chinese
    name_sc?: string; // Stop name in Simplified Chinese (optional)
    lat: number; // Latitude (WGS84)
    long: number; // Longitude (WGS84)
    enabled?: boolean; // Whether the stop is in service
    remarks_en?: string | null; // Remarks in English
    remarks_tc?: string | null; // Remarks in Traditional Chinese
    remarks_sc?: string | null; // Remarks in Simplified Chinese (optional)
  }
  
  // Route-Stop association
  export interface TransportRouteStop {
    stop: string; // Stop ID
    seq: number; // Stop sequence in the route
    name_en: string; // Stop name in English
    name_tc: string; // Stop name in Traditional Chinese
    name_sc?: string; // Stop name in Simplified Chinese (optional)
  }
  
  // ETA information
  export interface TransportETA {
    route: string; // Route ID or code
    dir: 'O' | 'I'; // Direction (Outbound/Inbound, mapped from route_seq)
    eta?: string; // Absolute ETA timestamp (e.g., "2020-12-28T15:20:00.000+08:00")
    diff?: number; // Relative ETA in minutes
    remarks_en?: string | null; // Remarks in English
    remarks_tc?: string | null; // Remarks in Traditional Chinese
    remarks_sc?: string | null; // Remarks in Simplified Chinese (optional)
  }
  
  // Classified ETA (grouped by route and direction)
  export interface ClassifiedTransportETA {
    route: string; // Route ID or code
    direction: 'Outbound' | 'Inbound'; // Human-readable direction
    serviceType: string; // e.g., "Normal" (GMB doesn't specify this explicitly)
    destination_en: string; // Destination in English
    destination_tc: string; // Destination in Traditional Chinese
    destination_sc?: string; // Destination in Simplified Chinese (optional)
    etas: TransportETA[]; // Array of ETA entries
    company: string; // e.g., "GMB"
  }
  