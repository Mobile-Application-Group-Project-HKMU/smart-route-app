import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert, View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { findNearbyStops, type Stop } from '@/util/kmb';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function NearbyScreenWeb() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const [nearbyStops, setNearbyStops] = useState<Stop[]>([]);
  const [radius, setRadius] = useState(500); // Default 500m radius
  const { t, language } = useLanguage();

  const findStopsNearLocation = async (latitude: number, longitude: number, searchRadius: number) => {
    try {
      setLoading(true);
      setError(null);
      const stops = await findNearbyStops(latitude, longitude, searchRadius);
      setNearbyStops(stops);
    } catch (err) {
      setError("Failed to find nearby stops. Please try again.");
      console.error("Error fetching nearby stops:", err);
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        setLoading(false);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoordinates({ latitude, longitude });
          findStopsNearLocation(latitude, longitude, radius);
        },
        (err) => {
          setError("Unable to retrieve your location. Please allow location access.");
          console.error("Geolocation error:", err);
          setLoading(false);
        }
      );
    } catch (err) {
      setError("Failed to get your location. Please try again.");
      console.error("Error getting location:", err);
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    await requestLocationPermission();
  };

  const changeRadius = (newRadius: number) => {
    setRadius(newRadius);
    if (userCoordinates) {
      findStopsNearLocation(
        userCoordinates.latitude,
        userCoordinates.longitude,
        newRadius
      );
    }
  };

  const handleStopPress = (stop: Stop) => {
    router.push(`/stop/${stop.stop}`);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A7C7E7', dark: '#0A3161' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#0A3161"
          name="location.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{t('nearby.title')}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.radiusSelector}>
        <TouchableOpacity 
          style={[styles.radiusButton, radius === 250 ? styles.activeRadiusButton : null]} 
          onPress={() => changeRadius(250)}
        >
          <ThemedText style={radius === 250 ? styles.activeRadiusText : null}>250m</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.radiusButton, radius === 500 ? styles.activeRadiusButton : null]} 
          onPress={() => changeRadius(500)}
        >
          <ThemedText style={radius === 500 ? styles.activeRadiusText : null}>500m</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.radiusButton, radius === 1000 ? styles.activeRadiusButton : null]} 
          onPress={() => changeRadius(1000)}
        >
          <ThemedText style={radius === 1000 ? styles.activeRadiusText : null}>1km</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {!userCoordinates && !error && !loading ? (
        <ThemedView style={styles.initialState}>
          <IconSymbol name="location.fill" size={48} color="#0a7ea4" />
          <ThemedText style={styles.initialText}>
            {t('nearby.tap.instruction')}
          </ThemedText>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={requestLocationPermission}
          >
            <ThemedText style={styles.startButtonText}>{t('nearby.find.stops')}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : error ? (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={refreshLocation}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <ThemedView style={styles.content}>
          {userCoordinates && (
            <ThemedView style={styles.webMapPlaceholder}>
              <IconSymbol name="map.fill" size={48} color="#0a7ea4" />
              <ThemedText style={styles.webMapText}>
                {t('nearby.map.mobile.only')}
              </ThemedText>
              {userCoordinates && (
                <ThemedText style={styles.locationText}>
                  {t('nearby.your.location', 
                    userCoordinates.latitude.toFixed(6), 
                    userCoordinates.longitude.toFixed(6))}
                </ThemedText>
              )}
              <TouchableOpacity 
                style={styles.openMapButton}
                onPress={() => {
                  if (userCoordinates) {
                    window.open(`https://www.google.com/maps?q=${userCoordinates.latitude},${userCoordinates.longitude}`, '_blank');
                  }
                }}
              >
                <IconSymbol name="map.fill" size={18} color="white" style={styles.openMapIcon} />
                <ThemedText style={styles.openMapText}>{t('nearby.open.maps')}</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          <ThemedText type="subtitle" style={styles.listTitle}>
            {t('nearby.stops.count', nearbyStops.length.toString())}
          </ThemedText>

          {nearbyStops.length === 0 ? (
            <ThemedText style={styles.noStopsText}>
              {t('nearby.no.stops').replace('{0}', radius.toString())}
            </ThemedText>
          ) : (
            <View style={styles.listContainer}>
              <FlatList
                data={nearbyStops}
                keyExtractor={(item) => item.stop}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.stopItem}
                    onPress={() => handleStopPress(item)}
                  >
                    <IconSymbol name="location.fill" size={24} color="#0A3161" style={styles.stopIcon} />
                    <ThemedView style={styles.stopInfo}>
                      <ThemedText style={styles.stopName}>
                        {language === 'en' ? item.name_en : 
                         language === 'zh-Hans' ? item.name_sc : item.name_tc}
                      </ThemedText>
                      <ThemedText style={styles.stopDistance}>
                        {t('nearby.meters.away').replace('{0}', Math.round(item.distance).toString())}
                      </ThemedText>
                    </ThemedView>
                    <IconSymbol name="chevron.right" size={20} color="#808080" />
                  </TouchableOpacity>
                )}
                style={styles.list}
                contentContainerStyle={styles.listContent}
              />
            </View>
          )}
        </ThemedView>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerImage: {
    color: '#0A3161',
    bottom: -90,
    left: -35,
    position: 'absolute',
    opacity: 0.7,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
  },
  radiusSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  radiusButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 8,
    backgroundColor: '#f0f0f0',
  },
  activeRadiusButton: {
    backgroundColor: '#0A3161',
  },
  activeRadiusText: {
    color: 'white',
  },
  initialState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  initialText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  startButton: {
    backgroundColor: '#0A3161',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 16,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: "#ffefef",
    borderRadius: 12,
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#c00',
  },
  retryButton: {
    backgroundColor: '#0A3161',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    marginTop: 16,
  },
  webMapPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  webMapText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
  },
  locationText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  openMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
  },
  openMapIcon: {
    marginRight: 8,
  },
  openMapText: {
    color: 'white',
    fontWeight: '500',
  },
  listTitle: {
    marginBottom: 12,
  },
  listContainer: {
    flex: 1,
  },
  noStopsText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  stopIcon: {
    marginRight: 12,
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '500',
  },
  stopDistance: {
    fontSize: 14,
    opacity: 0.7,
  },
});
