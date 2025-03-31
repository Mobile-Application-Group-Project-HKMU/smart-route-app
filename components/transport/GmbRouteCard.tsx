import { Language } from '@/contexts/LanguageContext';
import { TransportRoute } from '@/types/transport-types';
import TransportRouteCard from './TransportRouteCard';

interface GmbRouteCardProps {
  route: TransportRoute;
  onPress: () => void;
  language?: Language;
}

export default function GmbRouteCard({ route, onPress, language = 'en' }: GmbRouteCardProps) {
  // GMB theme colors (green)
  const colors = {
    light: '#66CC66', // Light green
    dark: '#009900',  // Dark green
    text: '#FFFFFF',  // White text
  };
  
  return (
    <TransportRouteCard 
      route={route} 
      onPress={onPress} 
      language={language}
      colors={colors}
    />
  );
}
