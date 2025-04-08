import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { WeatherData, getWeatherIcon } from '@/util/weather';
import { useLanguage } from '@/contexts/LanguageContext';


interface WeatherInfoProps {
  weatherData: WeatherData;
  compact?: boolean;
}

export function WeatherInfo({ weatherData, compact = false }: WeatherInfoProps) {
  const { t } = useLanguage();
  
  if (!weatherData || !weatherData.current) {
    return null;
  }
  
  const current = weatherData.current;
  const iconCode = current.weather[0]?.icon || '01d';
  const iconName = getWeatherIcon(iconCode) as any; // Type assertion to bypass the type check
  const temperature = Math.round(current.temp);
  const description = current.weather[0]?.description || '';
  const rainChance = weatherData.hourly[0]?.pop || 0;
  
  if (compact) {
    return (
      <ThemedView style={styles.compactContainer}>
        <IconSymbol name={iconName} size={24} color="#0a7ea4" />
        <ThemedText style={styles.compactTemp}>{temperature}°C</ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol name={iconName} size={36} color="#0a7ea4" />
        <ThemedText style={styles.temperature}>{temperature}°C</ThemedText>
      </View>
      
      <ThemedText style={styles.description}>
        {description.charAt(0).toUpperCase() + description.slice(1)}
      </ThemedText>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <IconSymbol name="humidity" size={16} color="#0a7ea4" />
          <ThemedText style={styles.detailText}>
            {current.humidity}% {t('humidity')}
          </ThemedText>
        </View>
        
        <View style={styles.detailItem}>
          <IconSymbol name="drop.fill" size={16} color="#0a7ea4" />
          <ThemedText style={styles.detailText}>
            {Math.round(rainChance * 100)}% {t('rainChance')}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  compactTemp: {
    marginLeft: 4,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  temperature: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
  },
});
