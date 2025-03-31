import { Language } from '@/contexts/LanguageContext';
import { TransportRoute } from '@/types/transport-types';
import TransportRouteCard from './TransportRouteCard';
import { MTR_COLORS } from '@/util/mtr';

interface MtrRouteCardProps {
  route: TransportRoute;
  onPress: () => void;
  language?: Language;
}

export default function MtrRouteCard({ route, onPress, language = 'en' }: MtrRouteCardProps) {
  // Get the appropriate color for this MTR line
  const lineColor = route.color || MTR_COLORS[route.route as keyof typeof MTR_COLORS] || '#E60012';
  
  // MTR theme colors
  const colors = {
    light: lineColor,
    dark: lineColor,
    text: '#FFFFFF', // White text for contrast
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
