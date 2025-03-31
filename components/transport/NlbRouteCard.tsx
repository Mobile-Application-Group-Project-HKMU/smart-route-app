import { Language } from '@/contexts/LanguageContext';
import { TransportRoute } from '@/types/transport-types';
import TransportRouteCard from './TransportRouteCard';

interface NlbRouteCardProps {
  route: TransportRoute;
  onPress: () => void;
  language?: Language;
}

export default function NlbRouteCard({ route, onPress, language = 'en' }: NlbRouteCardProps) {
  // NLB theme colors (cyan/turquoise)
  const colors = {
    light: '#00CCCC', // Light cyan
    dark: '#008888',  // Dark cyan
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
