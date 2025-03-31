import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Language } from '@/contexts/LanguageContext';
import { TransportRoute } from '@/types/transport-types';

export interface TransportRouteCardProps {
  route: TransportRoute;
  onPress: () => void;
  language?: Language;
  colors: {
    light: string;
    dark: string;
    text: string;
  };
}

export default function TransportRouteCard({ 
  route, 
  onPress, 
  language = 'en',
  colors 
}: TransportRouteCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  
  const getTranslatedOrigin = () => {
    if (language === 'en') return route.orig_en || '';
    return route.orig_tc || '';
  };
  
  const getTranslatedDestination = () => {
    if (language === 'en') return route.dest_en || '';
    return route.dest_tc || '';
  };
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView 
        style={styles.card}
        lightColor="#f5f5f5"
        darkColor="#333333"
      >
        <ThemedView style={styles.routeNumberContainer} lightColor={colors.light} darkColor={colors.dark}>
          <ThemedText style={[styles.routeNumber, { color: colors.text }]}>{route.route}</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.routeInfo}>
          <ThemedText style={styles.direction}>
            {route.bound === 'I' ? 'Inbound' : 'Outbound'} • {route.co}
          </ThemedText>
          
          <ThemedView style={styles.destinations}>
            <ThemedText style={styles.destination} numberOfLines={1}>
              From: {getTranslatedOrigin()}
            </ThemedText>
            <ThemedText style={styles.destination} numberOfLines={1}>
              To: {getTranslatedDestination()}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    flexDirection: 'row',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
    marginBottom: 10,
  },
  routeNumberContainer: {
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
    height: 60,
  },
  routeNumber: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  routeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  direction: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  destinations: {
    gap: 4,
  },
  destination: {
    fontSize: 14,
  },
});
