import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert, View, Dimensions, Linking, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { classifyStopETAs, getAllStops, type ClassifiedETA, type Stop } from '@/util/kmb';
import { formatTransportTime } from '@/util/datetime';
import { FavRouteStation, saveToLocalStorage, getFromLocalStorage } from '@/util/favourite';

const { width } = Dimensions.get('window');

export default function StopETAScreen() {
  const { stopId } = useLocalSearchParams();
  const [etas, setEtas] = useState<ClassifiedETA[]>([]);
  const [stopInfo, setStopInfo] = useState<Stop | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if stop is in favorites
  useEffect(() => {
    const checkFavorite = async () => {
      const favorites = await getFromLocalStorage('stationFavorites') as FavRouteStation | null;
      if (favorites && favorites.stationID.includes(stopId as string)) {
        setIsFavorite(true);
      }
    };

    checkFavorite();
  }, [stopId]);

  // Fetch stop information
  useEffect(() => {
    const fetchStopInfo = async () => {
      try {
        const allStops = await getAllStops();
        const stop = allStops.find(s => s.stop === stopId);
        if (stop) {
          setStopInfo(stop);
        }
      } catch (error) {
        console.error('Failed to fetch stop info:', error);
      }
    };

    fetchStopInfo();
  }, [stopId]);

  // Fetch ETAs when screen gains focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      
      const fetchETAs = async () => {
        try {
          setLoading(true);
          const stopETAs = await classifyStopETAs(stopId as string);
          
          if (isMounted) {
            setEtas(stopETAs);
            setLoading(false);
          }
        } catch (error) {
          console.error('Failed to fetch ETAs:', error);
          if (isMounted) {
            setLoading(false);
            Alert.alert('Error', 'Failed to load arrival times');
          }
        }
      };

      fetchETAs();

      return () => {
        isMounted = false;
      };
    }, [stopId])
  );

  const refreshETAs = async () => {
    try {
      setRefreshing(true);
      const stopETAs = await classifyStopETAs(stopId as string);
      setEtas(stopETAs);
    } catch (error) {
      console.error('Failed to refresh ETAs:', error);
      Alert.alert('Error', 'Failed to refresh arrival times');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      let favorites = await getFromLocalStorage('stationFavorites') as FavRouteStation;
      
      if (!favorites) {
        favorites = { stationID: [] };
      }

      if (isFavorite) {
        // Remove from favorites
        favorites.stationID = favorites.stationID.filter(id => id !== stopId);
      } else {
        // Add to favorites
        favorites.stationID.push(stopId as string);
      }

      await saveToLocalStorage('stationFavorites', favorites);
      setIsFavorite(!isFavorite);
      
      Alert.alert(
        isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
        isFavorite ? 'This stop has been removed from your favorites.' : 'This stop has been added to your favorites.'
      );
    } catch (error) {
      console.error('Error updating favorites:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const openNavigation = () => {
    if (!stopInfo) return;
    
    const { lat, long } = stopInfo;
    const label = encodeURI(stopInfo.name_en);
    
    let url = '';
    if (Platform.OS === 'ios') {
      // Apple Maps on iOS
      url = `maps:?q=${label}&ll=${lat},${long}`;
    } else {
      // Google Maps on Android and others
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}&destination_place_id=${label}`;
    }
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Navigation Error', 'Unable to open maps app');
      }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: stopInfo ? stopInfo.name_en : 'Bus Stop',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={refreshETAs} style={styles.refreshButton}>
                <IconSymbol
                  name="arrow.clockwise"
                  size={24}
                  color="#808080"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
                <IconSymbol
                  name={isFavorite ? "star.fill" : "star"}
                  size={24}
                  color={isFavorite ? "#FFD700" : "#808080"}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <>
          <ThemedView style={styles.stopHeader}>
            <ThemedText type="title" style={styles.stopName}>
              {stopInfo?.name_en || 'Bus Stop'}
            </ThemedText>
            <ThemedText style={styles.stopNameChinese}>
              {stopInfo?.name_tc || '巴士站'}
            </ThemedText>
            <ThemedText style={styles.stopId}>
              Stop ID: {stopId}
            </ThemedText>
          </ThemedView>

          {stopInfo && (
            <ThemedView style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: stopInfo.lat,
                  longitude: stopInfo.long,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: stopInfo.lat,
                    longitude: stopInfo.long,
                  }}
                  title={stopInfo.name_en}
                />
              </MapView>
              <TouchableOpacity 
                style={styles.navigationButton}
                onPress={openNavigation}
              >
                <IconSymbol name="arrow.triangle.turn.up.right.circle.fill" size={20} color="white" />
                <ThemedText style={styles.navigationButtonText}>Navigate</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          {refreshing && (
            <ActivityIndicator size="small" style={styles.refreshingIndicator} />
          )}

          <ThemedText type="subtitle" style={styles.arrivalsTitle}>
            Upcoming Arrivals
          </ThemedText>

          {etas.length === 0 ? (
            <ThemedView style={styles.noETAs}>
              <ThemedText style={styles.noETAsText}>
                No bus arrivals scheduled at this time
              </ThemedText>
            </ThemedView>
          ) : (
            <FlatList
              data={etas}
              keyExtractor={(item) => `${item.route}-${item.direction}-${item.serviceType}`}
              renderItem={({ item }) => (
                <ThemedView style={styles.etaCard}>
                  <ThemedView style={styles.routeHeader}>
                    <ThemedView style={styles.routeNumberContainer}>
                      <ThemedText style={styles.routeNumber}>{item.route}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.routeInfo}>
                      <ThemedText style={styles.destination}>{item.destination_en}</ThemedText>
                      <ThemedText style={styles.directionText}>
                        {item.direction} • Service Type: {item.serviceType}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  
                  <ThemedView style={styles.etaList}>
                    {item.etas.map((eta, index) => (
                      <ThemedView key={index} style={styles.etaItem}>
                        <ThemedText style={styles.etaTime}>
                          {eta.eta ? formatTransportTime(eta.eta, 'en', 'relative') : 'No data'}
                        </ThemedText>
                        {eta.rmk_en && (
                          <ThemedText style={styles.etaRemark}>{eta.rmk_en}</ThemedText>
                        )}
                      </ThemedView>
                    ))}
                  </ThemedView>
                </ThemedView>
              )}
              style={styles.etasList}
              contentContainerStyle={styles.etasListContent}
            />
          )}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopHeader: {
    marginBottom: 16,
  },
  stopName: {
    marginBottom: 4,
  },
  stopNameChinese: {
    fontSize: 18,
    marginBottom: 8,
  },
  stopId: {
    fontSize: 14,
    opacity: 0.7,
  },
  mapContainer: {
    height: 200,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  navigationButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigationButtonText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  arrivalsTitle: {
    marginBottom: 12,
  },
  refreshingIndicator: {
    marginBottom: 12,
  },
  noETAs: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noETAsText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  etasList: {
    flex: 1,
  },
  etasListContent: {
    paddingBottom: 20,
    gap: 16,
  },
  etaCard: {
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  routeNumberContainer: {
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#FFD580',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    height: 48,
  },
  routeNumber: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#8B4513',
  },
  routeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  destination: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  directionText: {
    fontSize: 12,
    opacity: 0.7,
  },
  etaList: {
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#FFD580',
    marginLeft: 24,
  },
  etaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  etaTime: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  etaRemark: {
    fontSize: 14,
    opacity: 0.7,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    marginRight: 12,
  },
  favoriteButton: {
    marginRight: 8,
  },
});
