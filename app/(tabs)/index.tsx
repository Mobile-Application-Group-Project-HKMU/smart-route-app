import { useEffect, useState } from 'react';
import { Image, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { FavRouteKMB, FavRouteStation, getFromLocalStorage } from '@/util/favourite';
import { Route, getAllRoutes, Stop, getAllStops } from '@/util/kmb';

export default function HomeScreen() {
  const [favoriteRoutes, setFavoriteRoutes] = useState<Array<Route & { key: string }>>([]);
  const [favoriteStops, setFavoriteStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        // Get favorite routes
        const routeFavorites = await getFromLocalStorage('kmbFavorites') as FavRouteKMB | null;
        const stopFavorites = await getFromLocalStorage('stationFavorites') as FavRouteStation | null;
        
        if (routeFavorites?.kmbID?.length) {
          const allRoutes = await getAllRoutes();
          const routes = routeFavorites.kmbID.map(key => {
            const [routeId, bound, serviceType] = key.split('-');
            const route = allRoutes.find(
              r => r.route === routeId && r.bound === bound && r.service_type === serviceType
            );
            
            if (route) {
              return { ...route, key };
            }
            return null;
          }).filter((r): r is Route & { key: string } => r !== null);
          
          setFavoriteRoutes(routes);
        }
        
        if (stopFavorites?.stationID?.length) {
          const allStops = await getAllStops();
          const stops = stopFavorites.stationID
            .map(id => allStops.find(s => s.stop === id))
            .filter((s): s is Stop => s !== undefined);
          
          setFavoriteStops(stops);
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFavorites();
  }, []);

  const handleRoutePress = (route: Route & { key: string }) => {
    const [routeId, bound, serviceType] = route.key.split('-');
    router.push(`/bus/${routeId}?bound=${bound}&serviceType=${serviceType}`);
  };

  const handleStopPress = (stop: Stop) => {
    router.push(`/stop/${stop.stop}`);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Smart KMB App</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Your Favorites</ThemedText>
        
        {loading ? (
          <ThemedText style={styles.loadingText}>Loading your favorites...</ThemedText>
        ) : (
          <>
            {favoriteRoutes.length === 0 && favoriteStops.length === 0 ? (
              <ThemedText style={styles.noFavoritesText}>
                You don't have any favorites yet. Browse bus routes and stops to add favorites.
              </ThemedText>
            ) : (
              <>
                {favoriteRoutes.length > 0 && (
                  <ThemedView style={styles.subsection}>
                    <ThemedText style={styles.subsectionTitle}>Favorite Routes</ThemedText>
                    <FlatList
                      data={favoriteRoutes}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item) => item.key}
                      renderItem={({ item }) => (
                        <TouchableOpacity 
                          style={styles.favoriteCard} 
                          onPress={() => handleRoutePress(item)}
                        >
                          <ThemedView style={styles.favoriteCardContent}>
                            <ThemedView style={styles.routeNumberContainer}>
                              <ThemedText style={styles.routeNumber}>{item.route}</ThemedText>
                            </ThemedView>
                            <ThemedText style={styles.destination} numberOfLines={1}>
                              {item.dest_en}
                            </ThemedText>
                          </ThemedView>
                        </TouchableOpacity>
                      )}
                    />
                  </ThemedView>
                )}

                {favoriteStops.length > 0 && (
                  <ThemedView style={styles.subsection}>
                    <ThemedText style={styles.subsectionTitle}>Favorite Stops</ThemedText>
                    <FlatList
                      data={favoriteStops}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item) => item.stop}
                      renderItem={({ item }) => (
                        <TouchableOpacity 
                          style={styles.favoriteCard} 
                          onPress={() => handleStopPress(item)}
                        >
                          <ThemedView style={styles.favoriteCardContent}>
                            <IconSymbol name="location.fill" size={24} color="#8B4513" />
                            <ThemedText style={styles.stopName} numberOfLines={2}>
                              {item.name_en}
                            </ThemedText>
                          </ThemedView>
                        </TouchableOpacity>
                      )}
                    />
                  </ThemedView>
                )}
              </>
            )}
          </>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Quick Navigation</ThemedText>
        
        <ThemedView style={styles.quickNav}>
          <TouchableOpacity 
            style={styles.quickNavButton}
            onPress={() => router.push('/bus')}
          >
            <IconSymbol name="paperplane.fill" size={32} color="#8B4513" />
            <ThemedText style={styles.quickNavText}>Bus Routes</ThemedText>
          </TouchableOpacity>
          

        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
    gap: 16,
  },
  subsection: {
    gap: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
  },
  noFavoritesText: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
  favoriteCard: {
    width: 120,
    height: 120,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFD580',
  },
  favoriteCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeNumberContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  destination: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#8B4513',
  },
  stopName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
    color: '#8B4513',
  },
  quickNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  quickNavButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFD580',
    width: '45%',
  },
  quickNavText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#8B4513',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
