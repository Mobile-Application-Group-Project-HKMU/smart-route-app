// transport-types.ts

/**
 * Common interfaces for all transport providers
 */

// The type of transport company
export type TransportCompany = 
  | 'KMB' 
  | 'CTB' 
  | 'NLB' 
  | 'GMB' 
  | 'MTR' 
  | 'LR' // Light Rail
  | 'LRF' // Light Rail Feeder
  | 'SF' // Sun Ferry
  | 'FF' // Fortune Ferry
  | 'HKKF'; // Hong Kong & Kowloon Ferry

// Basic route information
export interface TransportRoute {
  route: string;
  co: TransportCompany | string;
  bound?: 'I' | 'O' | string;
  service_type?: string;
  orig_en?: string;
  orig_tc?: string;
  dest_en?: string;
  dest_tc?: string;
  data_timestamp?: string;
  region?: 'HKI' | 'KLN' | 'NT';
  route_id?: string;
  description_en?: string;
  description_tc?: string;
  directions?: {
    route_seq: string;
    orig_en: string;
    orig_tc: string;
    dest_en: string;
    dest_tc: string;
  }[];
}

// Stop information
export interface TransportStop {
  stop: string;
  name_en: string;
  name_tc: string;
  name_sc?: string;
  lat: number;
  long: number;
  data_timestamp?: string;
  distance?: number;
  company?: TransportCompany | string; // Add company property
}

// Route-stop mapping
export interface TransportRouteStop {
  co?: TransportCompany | string;
  route?: string;
  bound?: 'I' | 'O' | string;
  service_type?: string;
  seq: number;
  stop: string;
  name_en?: string;
  name_tc?: string;
  data_timestamp?: string;
}

// ETA (Estimated Time of Arrival) information
export interface TransportETA {
  co?: TransportCompany | string;
  route?: string;
  dir?: 'I' | 'O' | string;
  service_type?: string;
  seq?: number;
  stop?: string;
  dest_en?: string;
  dest_tc?: string;
  eta_seq?: number;
  eta: string | null;
  rmk_en?: string;
  rmk_tc?: string;
  remarks_en?: string;
  remarks_tc?: string;
  data_timestamp?: string;
  diff?: number;
}

// Classified ETAs grouped by route
export interface ClassifiedTransportETA {
  route: string;
  direction: 'Inbound' | 'Outbound';
  serviceType: string;
  destination_en: string;
  destination_tc: string;
  etas: TransportETA[];
  company?: TransportCompany | string;
}

// Response format for transport APIs
export interface TransportApiResponse<T> {
  type?: string;
  version?: string;
  generated_timestamp?: string;
  data: T;
}
