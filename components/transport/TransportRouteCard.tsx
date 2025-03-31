import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Language, useLanguage } from '@/contexts/LanguageContext';
import { TransportRoute } from '@/types/transport-types';
import { Colors } from '@/constants/Colors';



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
  const { t } = useLanguage();
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
        lightColor={Colors.light.card}
        darkColor={Colors.dark.card}
      >
        <ThemedView 
          style={styles.routeNumberContainer} 
          lightColor={colors.light} 
          darkColor={colors.dark}
        >
          <ThemedText 
            style={[
              styles.routeNumber, 
              { color: colors.text }
            ]}
          >
            {route.route}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.routeDetails}>
          <ThemedText style={styles.routeDestination}>
            {getTranslatedDestination()}
          </ThemedText>
          <ThemedText style={styles.routeOrigin}>
            {t('bus.from')} {getTranslatedOrigin()}
          </ThemedText>
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
  routeDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  routeDestination: {
    fontSize: 14,
    marginBottom: 4,
  },
  routeOrigin: {
    fontSize: 12,
    opacity: 0.7,
  },
});
