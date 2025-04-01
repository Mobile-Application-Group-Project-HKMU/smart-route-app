// transport-types.ts

/**
 * Common interfaces for all transport providers
 */

// Transport mode type
export type TransportMode = 'BUS' | 'MINIBUS' | 'MTR' | 'FERRY' | 'WALK';

// Enhanced TransportCompany type
export type TransportCompany = 
  | 'KMB' 
  | 'CTB' 
  | 'NWFB'
  | 'GMB' 
  | 'MTR' 
  | 'LR'
  | 'LRF'
  | 'HKKF'
  | 'SF'
  | 'FF'
  | 'NLB'; // Add NLB to the valid transport companies

// Enhanced TransportRoute
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
  mode?: TransportMode;
  fares?: number[];
  frequency?: string;
  platform?: string;
  interchange?: boolean;
  color?: string; // For MTR lines
}

// Enhanced TransportStop
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
  mode: TransportMode;
  facilities?: string[];
  exitInfo?: {
    exit: string;
    destination: string;
  }[];
  interchange?: string[];
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
  lat?: number;
  long?: number;
  

}

// Enhanced TransportETA
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
  platform?: string;
  trainLength?: number;
  firstCar?: string;
  lastCar?: string;
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
