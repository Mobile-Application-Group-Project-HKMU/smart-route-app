import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { TransportMode, TransportRoute } from '@/types/transport-types';
import { useLanguage } from '@/contexts/LanguageContext';
import { calculateJourneyImpact } from '@/util/impactCalculator';
import { saveJourneyImpact } from '@/util/impactStorage';

interface TripImpactRecorderProps {
  mode: TransportMode;
  route?: TransportRoute;
  distance?: number;
  duration?: number;
  onImpactRecorded?: () => void;
}

export default function TripImpactRecorder({ 
  mode, 
  route, 
  distance, 
  duration,
  onImpactRecorded 
}: TripImpactRecorderProps) {
  const { t } = useLanguage();
  const [recording, setRecording] = useState(false);
  
  const handleRecordImpact = async () => {
    try {
      setRecording(true);
      
      // Use provided distance/duration or estimate based on route
      const tripDistance = distance || (route ? estimateRouteDistance(route) : 5);
      const tripDuration = duration || (route ? estimateRouteDuration(route) : 15);
      
      // Calculate the impact
      const impact = calculateJourneyImpact(
        mode,
        tripDistance,
        tripDuration
      );
      
      // Save the impact data
      await saveJourneyImpact(impact);
      
      // Show success alert
      Alert.alert(
        t('impact.recorded.title'),
        t('impact.recorded.message', {
          co2: impact.co2Saved.toFixed(2),
          calories: Math.round(impact.caloriesBurned)
        }),
        [{ text: t('common.ok'), onPress: () => {
          if (onImpactRecorded) onImpactRecorded();
        }}]
      );
    } catch (error) {
      console.error('Failed to record impact:', error);
      Alert.alert(
        t('impact.error.title'),
        t('impact.error.message'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setRecording(false);
    }
  };
  
  // Helper function to estimate route distance based on origin/destination
  const estimateRouteDistance = (route: TransportRoute): number => {
    // In a real app, this would use route data or API
    // For now, return a reasonable default
    return 5; // 5km default
  };
  
  // Helper function to estimate route duration
  const estimateRouteDuration = (route: TransportRoute): number => {
    // In a real app, this would use route data or API
    // For now, return a reasonable default
    return 15; // 15 minutes default
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handleRecordImpact}
      disabled={recording}
    >
      <IconSymbol 
        name="leaf.fill" 
        size={22} 
        color="#2ecc71" 
        style={styles.icon}
      />
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>
          {t('impact.record.title')}
        </ThemedText>
        <ThemedText style={styles.description}>
          {recording 
            ? t('impact.record.processing')
            : t('impact.record.description')}
        </ThemedText>
      </ThemedView>
      {recording ? (
        <IconSymbol name="hourglass" size={22} color="#999" />
      ) : (
        <IconSymbol name="plus.circle.fill" size={22} color="#2ecc71" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  icon: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    opacity: 0.7,
  }
});
