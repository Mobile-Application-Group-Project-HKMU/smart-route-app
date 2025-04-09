import React from 'react';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { recordJourney, mapLocationToDistrict } from '@/util/achievements';
import { TransportCompany, TransportMode, TransportRoute } from '@/types/transport-types';
import * as Location from 'expo-location';

interface JourneyRecorderProps {
  route: TransportRoute;
  onAchievementUnlocked?: () => void;
}

export default function JourneyRecorder({ route, onAchievementUnlocked }: JourneyRecorderProps) {
  const { t } = useLanguage();
  
  const handleRecordJourney = async () => {
    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          t('achievements.permission.title'),
          t('achievements.permission.message')
        );
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const district = mapLocationToDistrict(
        location.coords.latitude,
        location.coords.longitude
      );
      
      // Record the journey
      const { newlyUnlockedAchievements } = await recordJourney(
        getTransportMode(route.co as TransportCompany),
        route.co as TransportCompany,
        route.route,
        route.orig_en || '',
        route.dest_en || '',
        district
      );
      
      // Show success message
      Alert.alert(
        t('achievements.journeyRecorded.title'),
        t('achievements.journeyRecorded.message')
      );
      
      // Show achievement notifications if any were unlocked
      if (newlyUnlockedAchievements.length > 0) {
        const achievement = newlyUnlockedAchievements[0];
        Alert.alert(
          t('achievements.unlocked.title'),
          `${achievement.title.en}: ${achievement.description.en}`,
          [
            { 
              text: t('achievements.view'), 
              onPress: () => {
                if (onAchievementUnlocked) {
                  onAchievementUnlocked();
                }
              }
            },
            { text: t('common.dismiss') }
          ]
        );
      }
    } catch (error) {
      console.error('Failed to record journey:', error);
      Alert.alert(
        t('achievements.error.title'),
        t('achievements.error.message')
      );
    }
  };
  
  // Map company to transport mode
  const getTransportMode = (company: TransportCompany): TransportMode => {
    switch (company) {
      case 'KMB':
      case 'CTB':
      case 'NWFB':
        return 'BUS';
      case 'GMB':
        return 'MINIBUS';
      case 'MTR':
      case 'LR':
        return 'MTR';
      case 'HKKF':
      case 'SF':
      case 'FF':
      case 'NLB':
        return 'FERRY';
      default:
        return 'BUS';
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handleRecordJourney}
    >
      <View style={styles.iconContainer}>
        <IconSymbol name="trophy.fill" size={24} color="#8B4513" />
      </View>
      <ThemedText style={styles.text}>{t('achievements.recordJourney')}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD580',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  }
});
