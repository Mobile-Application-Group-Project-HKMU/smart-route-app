import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert, View, ViewStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { classifyStopETAs, getAllStops, type ClassifiedETA, type Stop } from '@/util/kmb';
import { formatTransportTime } from '@/util/datetime';
import { FavRouteStation, saveToLocalStorage, getFromLocalStorage } from '@/util/favourite';
import { useLanguage } from '@/contexts/LanguageContext';


export default function StopETAScreen() {
  const { t, language } = useLanguage();
  const { stopId } = useLocalSearchParams();
  const [etas, setEtas] = useState<ClassifiedETA[]>([]);
  const [stopInfo, setStopInfo] = useState<Stop | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      const favorites = await getFromLocalStorage('stationFavorites') as FavRouteStation | null;
      if (favorites && favorites.stationID.includes(stopId as string)) {
        setIsFavorite(true);
      }
    };

    checkFavorite();
  }, [stopId]);

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
            Alert.alert(t('error.generic'), t('error.load.arrival.times'));
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
      Alert.alert(t('error.generic'), t('error.refresh.arrival.times'));
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
        favorites.stationID = favorites.stationID.filter(id => id !== stopId);
      } else {
        favorites.stationID.push(stopId as string);
      }

      await saveToLocalStorage('stationFavorites', favorites);
      setIsFavorite(!isFavorite);

      Alert.alert(
        t(isFavorite ? 'favorites.remove' : 'favorites.add'),
        t(isFavorite ? 'favorites.remove.description' : 'favorites.add.description')
      );
    } catch (error) {
      console.error('Error updating favorites:', error);
      Alert.alert(t('error.generic'), t('error.update.favorites'));
    }
  };

  const openInGoogleMaps = () => {
    if (stopInfo) {
      const { lat, long } = stopInfo;
      const locationName = encodeURIComponent(stopInfo.name_en);
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${long}&query_place_id=${locationName}`, '_blank');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: stopInfo ? stopInfo.name_en : t('stop.title'),
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
              {stopInfo?.name_en || t('stop.title')}
            </ThemedText>
            <ThemedText style={styles.stopNameChinese}>
              {stopInfo ? (language === 'zh-Hans' ? stopInfo.name_sc : stopInfo.name_tc) : t('stop.title')}
            </ThemedText>
            <ThemedText style={styles.stopId}>
              {t('stop.id')}: {stopId}
            </ThemedText>
          </ThemedView>

          {stopInfo && (
            <ThemedView style={styles.webMapPlaceholder}>
              <IconSymbol name="location.fill" size={48} color="#0a7ea4" />
              <ThemedText style={styles.webMapText}>
                {t('stop.map.available')}
              </ThemedText>
              <ThemedText style={styles.locationText}>
                {t('stop.location')}: {stopInfo.lat.toFixed(6)}, {stopInfo.long.toFixed(6)}
              </ThemedText>
              <TouchableOpacity 
                style={styles.openMapButton}
                onPress={openInGoogleMaps}
              >
                <IconSymbol name="map.fill" size={18} color="white" style={styles.openMapIcon} />
                <ThemedText style={styles.openMapText}>{t('stop.open.maps')}</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}

          {refreshing && (
            <ActivityIndicator size="small" style={styles.refreshingIndicator} />
          )}

          <ThemedText type="subtitle" style={styles.arrivalsTitle}>
            {t('stop.arrivals')}
          </ThemedText>

          {etas.length === 0 ? (
            <ThemedView style={styles.noETAs}>
              <ThemedText style={styles.noETAsText}>
                {t('stop.no.arrivals')}
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
                      <ThemedText style={styles.destination}>
                        {language === 'en' ? item.destination_en : item.destination_tc}
                      </ThemedText>
                      <ThemedText style={styles.directionText}>
                        {t(item.direction === 'Inbound' ? 'stop.direction.inbound' : 'stop.direction.outbound')} • 
                        {t('stop.service.type')}: {item.serviceType}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  
                  <ThemedView style={styles.etaList}>
                    {item.etas.map((eta, index) => (
                      <ThemedView key={index} style={styles.etaItem}>
                        <ThemedText style={styles.etaTime}>
                          {eta.eta ? formatTransportTime(eta.eta, language === 'en' ? 'en' : 'zh', 'relative') : t('stop.no.data')}
                        </ThemedText>
                        {eta.rmk_en && (
                          <ThemedText style={styles.etaRemark}>
                            {language === 'en' ? eta.rmk_en : eta.rmk_tc}
                          </ThemedText>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  refreshButton: {
    marginRight: 12,
  },
  favoriteButton: {
    marginRight: 8,
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
});
