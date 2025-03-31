import { Route } from '@/util/kmb';
import { Language } from '@/contexts/LanguageContext';
import { TransportRoute } from '@/types/transport-types';
import TransportRouteCard from './TransportRouteCard';

// Update to accept either Route or TransportRoute
interface KmbRouteCardProps {
  route: Route | TransportRoute;
  onPress: () => void;
  language?: Language;
}

export default function KmbRouteCard({ route, onPress, language = 'en' }: KmbRouteCardProps) {
  // KMB theme colors (red)
  const colors = {
    light: '#FF5151', // Light red
    dark: '#B30000',  // Dark red
    text: '#FFFFFF',  // White text
  };
  
  // We need to ensure the route has the necessary properties for TransportRoute
  const transportRoute: TransportRoute = {
    route: route.route,
    co: route.co || 'KMB',
    bound: route.bound,
    service_type: route.service_type,
    orig_en: route.orig_en || '',
    dest_en: route.dest_en || '',
    orig_tc: typeof route.orig_tc === 'string' ? route.orig_tc : 
             route.orig_tc ? String(route.orig_tc) : undefined,
    dest_tc: typeof route.dest_tc === 'string' ? route.dest_tc : 
             route.dest_tc ? String(route.dest_tc) : undefined,
    data_timestamp: route.data_timestamp
  };

  return (
    <TransportRouteCard 
      route={transportRoute} 
      onPress={onPress} 
      language={language}
      colors={colors}
    />
  );
}
