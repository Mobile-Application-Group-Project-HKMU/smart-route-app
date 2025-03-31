import { Language } from '@/contexts/LanguageContext';
import { TransportRoute } from '@/types/transport-types';
import TransportRouteCard from './TransportRouteCard';

interface HkkfRouteCardProps {
  route: TransportRoute;
  onPress: () => void;
  language?: Language;
}

export default function HkkfRouteCard({ route, onPress, language = 'en' }: HkkfRouteCardProps) {
  // HKKF theme colors (blue)
  const colors = {
    light: '#4D94FF', // Light blue
    dark: '#0066CC',  // Dark blue
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
