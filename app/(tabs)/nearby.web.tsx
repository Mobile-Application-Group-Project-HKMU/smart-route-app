import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert, View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { findNearbyStops, type Stop } from '@/util/kmb';

export default function NearbyScreenWeb() {
  const [nearbyStops, setNearbyStops] = useState<Array<Stop & { distance: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(500); // Default radius in meters
  const [userCoordinates, setUserCoordinates] = useState<{latitude: number, longitude: number} | null>(null);

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const userCoords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            setUserCoordinates(userCoords);
            await fetchNearbyStops(userCoords.latitude, userCoords.longitude);
          },
          (error) => {
            console.error('Error getting location:', error);
            setError('Failed to get your location. Please ensure location services are enabled in your browser.');
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        setError('Geolocation is not supported by this browser.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error in location permission:', err);
      setError('An unexpected error occurred while accessing location services.');
      setLoading(false);
    }
  };

  const fetchNearbyStops = async (latitude: number, longitude: number) => {
    try {
      const stops = await findNearbyStops(latitude, longitude, radius);
      setNearbyStops(stops);
      setLoading(false);
    } catch (err) {
      console.error('Error finding nearby stops:', err);
      setError('Failed to find nearby stops');
      setLoading(false);
    }
  };

  const refreshLocation = () => {
    setLoading(true);
    requestLocationPermission();
  };

  const handleStopPress = (stop: Stop) => {
    router.push(`/stop/${stop.stop}`);
  };

  const changeRadius = (newRadius: number) => {
    setRadius(newRadius);
    if (userCoordinates) {
      setLoading(true);
      fetchNearbyStops(userCoordinates.latitude, userCoordinates.longitude);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Nearby Stops</ThemedText>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={refreshLocation}
          disabled={loading}
        >
          <IconSymbol name="location.circle.fill" size={28} color="#0a7ea4" />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.radiusSelector}>
        <ThemedText>Distance: </ThemedText>
        <TouchableOpacity 
          style={[styles.radiusButton, radius === 300 ? styles.activeRadiusButton : null]} 
          onPress={() => changeRadius(300)}
        >
          <ThemedText style={radius === 300 ? styles.activeRadiusText : null}>300m</ThemedText>
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
            Tap the location button to find bus stops near you
          </ThemedText>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={requestLocationPermission}
          >
            <ThemedText style={styles.startButtonText}>Find Nearby Stops</ThemedText>
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
                Interactive map is available on mobile devices
              </ThemedText>
              {userCoordinates && (
                <ThemedText style={styles.locationText}>
                  Your location: {userCoordinates.latitude.toFixed(6)}, {userCoordinates.longitude.toFixed(6)}
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
                <ThemedText style={styles.openMapText}>Open in Google Maps</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          <ThemedView style={styles.listContainer}>
            <ThemedText type="subtitle" style={styles.listTitle}>
              Nearby Stops ({nearbyStops.length})
            </ThemedText>

            {nearbyStops.length === 0 ? (
              <ThemedText style={styles.noStopsText}>
                No bus stops found within {radius}m of your location
              </ThemedText>
            ) : (
              <FlatList
                data={nearbyStops}
                keyExtractor={(item) => item.stop}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.stopItem}
                    onPress={() => handleStopPress(item)}
                  >
                    <IconSymbol name="location.fill" size={24} color="#8B4513" style={styles.stopIcon} />
                    <ThemedView style={styles.stopInfo}>
                      <ThemedText style={styles.stopName}>{item.name_en}</ThemedText>
                      <ThemedText style={styles.stopDistance}>
                        {Math.round(item.distance)}m away
                      </ThemedText>
                    </ThemedView>
                    <IconSymbol name="chevron.right" size={20} color="#808080" />
                  </TouchableOpacity>
                )}
                style={styles.stopsList}
              />
            )}
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  initialState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  initialText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  radiusSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  radiusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  activeRadiusButton: {
    backgroundColor: '#0a7ea4',
  },
  activeRadiusText: {
    color: 'white',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: 400,
  },
  retryButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  webMapPlaceholder: {
    height: 200,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  webMapText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
  locationText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.5,
  },
  openMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
    borderRadius: 8,
  },
  openMapIcon: {
    marginRight: 8,
  },
  openMapText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    marginBottom: 12,
  },
  noStopsText: {
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.7,
  },
  stopsList: {
    flex: 1,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  stopIcon: {
    marginRight: 16,
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
