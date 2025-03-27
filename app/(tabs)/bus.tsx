import { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { router } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import BusRouteCard from '@/components/BusRouteCard';
import SearchBox from '@/components/SearchBox';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getAllRoutes, Route } from '@/util/kmb';

export default function BusRoutesScreen() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const allRoutes = await getAllRoutes();
        setRoutes(allRoutes);
        setFilteredRoutes(allRoutes);
      } catch (error) {
        console.error('Failed to fetch routes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRoutes(routes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = routes.filter(
        (route) =>
          route.route.toLowerCase().includes(query) ||
          route.orig_en.toLowerCase().includes(query) ||
          route.dest_en.toLowerCase().includes(query) ||
          (route.orig_tc as string)?.includes(query) ||
          (route.dest_tc as string)?.includes(query)
      );
      setFilteredRoutes(filtered);
    }
  }, [searchQuery, routes]);

  const handleRoutePress = (route: Route) => {
    // Navigate to route details screen (to be implemented)
    router.push(`/bus/${route.route}?bound=${route.bound}&serviceType=${route.service_type}`);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFD580', dark: '#8B4513' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#A0522D"
          name="paperplane.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Bus Routes</ThemedText>
      </ThemedView>

      <SearchBox 
        placeholder="Search by route number or destination" 
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <ThemedView style={styles.routesContainer}>
          {filteredRoutes.length === 0 ? (
            <ThemedText style={styles.noResults}>No routes found</ThemedText>
          ) : (
            <FlatList
              data={filteredRoutes.slice(0, 20)} // Limit displayed routes for performance
              keyExtractor={(item, index) => `${item.route}-${item.bound}-${item.service_type}-${index}`}
              renderItem={({ item }) => (
                <BusRouteCard 
                  route={item} 
                  onPress={() => handleRoutePress(item)}
                />
              )}
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
          )}
        </ThemedView>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#A0522D',
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
  routesContainer: {
    marginTop: 16,
  },
  list: {
    width: '100%',
  },
  listContent: {
    gap: 12,
  },
  loader: {
    marginTop: 40,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 40,
  },
});
