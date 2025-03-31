import { Route } from '@/util/kmb';
import { Language } from '@/contexts/LanguageContext';
import TransportRouteCard, { TransportRouteCardProps } from './TransportRouteCard';

interface KmbRouteCardProps {
  route: Route;
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
  
  // Convert Route to TransportRoute, ensuring orig_tc is string | undefined, not null
  const transportRoute = {
    ...route,
    orig_tc: typeof route.orig_tc === 'string' ? route.orig_tc : undefined,
    dest_tc: typeof route.dest_tc === 'string' ? route.dest_tc : undefined
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
