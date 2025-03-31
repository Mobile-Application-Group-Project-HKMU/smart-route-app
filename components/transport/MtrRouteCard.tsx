import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TransportRoute } from '@/types/transport-types';
import { MTR_COLORS } from '@/util/mtr';
import { Language } from '@/contexts/LanguageContext';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface MtrRouteCardProps {
  route: TransportRoute;
  onPress: () => void;
  language: Language;
}

export function MtrRouteCard({ route, onPress, language }: MtrRouteCardProps) {
  // Display proper line name based on language
  const getLineName = () => {
    if (language === "en") {
      return `${route.route} Line`;
    } else if (language === "zh-Hans") {
      // Map line codes to simplified Chinese names
      const lineNames: Record<string, string> = {
        'AEL': '机场快线',
        'TCL': '东涌线',
        'TML': '屯马线',
        'TKL': '将军澳线',
        'EAL': '东铁线',
        'TWL': '荃湾线',
        'ISL': '港岛线',
        'KTL': '观塘线',
        'SIL': '南港岛线',
        'DRL': '迪士尼线'
      };
      return lineNames[route.route] || `${route.route}线`;
    } else {
      // Traditional Chinese names
      const lineNames: Record<string, string> = {
        'AEL': '機場快線',
        'TCL': '東涌綫',
        'TML': '屯馬綫',
        'TKL': '將軍澳綫',
        'EAL': '東鐵綫',
        'TWL': '荃灣綫',
        'ISL': '港島綫',
        'KTL': '觀塘綫',
        'SIL': '南港島綫',
        'DRL': '迪士尼綫'
      };
      return lineNames[route.route] || `${route.route}綫`;
    }
  };

  const getRouteColor = () => MTR_COLORS[route.route as keyof typeof MTR_COLORS] || '#666666';

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.routeInfoContainer}>
        <ThemedView style={[styles.routeChip, { backgroundColor: getRouteColor() }]}>
          <ThemedText style={styles.routeCode}>{route.route}</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.routeDetails}>
          <ThemedText style={styles.routeName}>{getLineName()}</ThemedText>
          <ThemedText style={styles.routePath}>
            {language === 'en' ? route.orig_en : route.orig_tc} → {language === 'en' ? route.dest_en : route.dest_tc}
          </ThemedText>
        </ThemedView>
      </View>
      
      <IconSymbol name="chevron.right" size={20} color="#808080" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  routeInfoContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  routeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeCode: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  routeDetails: {
    marginLeft: 12,
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  routePath: {
    fontSize: 14,
    opacity: 0.7,
  },
});

export default MtrRouteCard;
