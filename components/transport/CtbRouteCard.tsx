import { Language } from '@/contexts/LanguageContext';
import { TransportRoute } from '@/types/transport-types';
import TransportRouteCard from './TransportRouteCard';

interface CtbRouteCardProps {
  route: TransportRoute;
  onPress: () => void;
  language?: Language;
}

export default function CtbRouteCard({ route, onPress, language = 'en' }: CtbRouteCardProps) {
  // CTB theme colors (yellow)
  const colors = {
    light: '#FFDD00', // Light yellow
    dark: '#CC9900',  // Dark yellow
    text: '#000000',  // Black text for better contrast on yellow
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
