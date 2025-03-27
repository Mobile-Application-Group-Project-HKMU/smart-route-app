import { useLocalSearchParams, Stack, router } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  View,
  Dimensions,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  getRouteStops,
  getRouteDetails,
  type RouteStop,
  type Stop,
  getAllStops,
} from "@/util/kmb";
import {
  FavRouteKMB,
  saveToLocalStorage,
  getFromLocalStorage,
} from "@/util/favourite";

const { width } = Dimensions.get("window");

export default function RouteDetailScreen() {
  const { routeId, bound, serviceType } = useLocalSearchParams();
  const [stops, setStops] = useState<Array<RouteStop & Stop>>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    origin: string;
    destination: string;
  }>({ origin: "", destination: "" });
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [nearestStopIndex, setNearestStopIndex] = useState<number | null>(null);
  const mapRef = useRef<MapView>(null);

  const direction = bound === "I" ? "inbound" : "outbound";
  const routeKey = `${routeId}-${bound}-${serviceType}`;

  useEffect(() => {
    const checkFavorite = async () => {
      const favorites = (await getFromLocalStorage(
        "kmbFavorites"
      )) as FavRouteKMB | null;
      if (favorites && favorites.kmbID.includes(routeKey)) {
        setIsFavorite(true);
      }
    };

    checkFavorite();
  }, [routeKey]);

  useEffect(() => {
    const fetchRouteDetails = async () => {
      try {
        setLoading(true);

        // Get user location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = (await Location.getCurrentPositionAsync(
            {}
          )) as Location.LocationObject;
          setUserLocation(location);
        }

        // Fetch route details
        const details = await getRouteDetails(
          routeId as string,
          direction as "inbound" | "outbound",
          serviceType as string
        );

        setRouteInfo({
          origin: details.orig_en,
          destination: details.dest_en,
        });

        // Fetch route stops
        const routeStops = await getRouteStops(
          routeId as string,
          direction as "inbound" | "outbound",
          serviceType as string
        );

        // Fetch all stops to get their details
        const allStops = await getAllStops();
        const stopsMap = new Map(allStops.map((stop) => [stop.stop, stop]));

        // Combine route stops with stop details
        const routeStopsWithDetails = routeStops.map((routeStop) => {
          const stopDetails = stopsMap.get(routeStop.stop);
          return {
            ...routeStop,
            ...(stopDetails || {
              name_en: "Unknown Stop",
              name_tc: "未知站",
              name_sc: "未知站",
              lat: 0,
              long: 0,
              distance: 0, // Default distance value
            }),
          };
        });

        setStops(routeStopsWithDetails);

        // If user location is available, find the nearest stop
        if (userLocation && routeStopsWithDetails.length > 0) {
          const { latitude, longitude } = userLocation.coords;
          let minDistance = Number.MAX_VALUE;
          let minDistanceIndex = 0;

          routeStopsWithDetails.forEach((stop, index) => {
            const distance = Math.sqrt(
              Math.pow(stop.lat - latitude, 2) +
                Math.pow(stop.long - longitude, 2)
            );

            if (distance < minDistance) {
              minDistance = distance;
              minDistanceIndex = index;
            }
          });

          setNearestStopIndex(minDistanceIndex);

          // Wait for the map to be ready and then zoom to the nearest stop
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.animateToRegion(
                {
                  latitude: routeStopsWithDetails[minDistanceIndex].lat,
                  longitude: routeStopsWithDetails[minDistanceIndex].long,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                1000
              );
            }
          }, 500);
        } else if (routeStopsWithDetails.length > 0) {
          // If no user location, fit all stops on the map
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.fitToCoordinates(
                routeStopsWithDetails.map((stop) => ({
                  latitude: stop.lat,
                  longitude: stop.long,
                })),
                {
                  edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                  animated: true,
                }
              );
            }
          }, 500);
        }
      } catch (error) {
        console.error("Failed to fetch route details:", error);
        Alert.alert("Error", "Failed to load route information");
      } finally {
        setLoading(false);
      }
    };

    if (routeId && bound && serviceType) {
      fetchRouteDetails();
    }
  }, [routeId, bound, serviceType, direction]);

  const toggleFavorite = async () => {
    try {
      let favorites = (await getFromLocalStorage(
        "kmbFavorites"
      )) as FavRouteKMB;

      if (!favorites) {
        favorites = { kmbID: [] };
      }

      if (isFavorite) {
        // Remove from favorites
        favorites.kmbID = favorites.kmbID.filter((id) => id !== routeKey);
      } else {
        // Add to favorites
        favorites.kmbID.push(routeKey);
      }

      await saveToLocalStorage("kmbFavorites", favorites);
      setIsFavorite(!isFavorite);

      Alert.alert(
        isFavorite ? "Removed from Favorites" : "Added to Favorites",
        isFavorite
          ? "This route has been removed from your favorites."
          : "This route has been added to your favorites."
      );
    } catch (error) {
      console.error("Error updating favorites:", error);
      Alert.alert("Error", "Failed to update favorites");
    }
  };

  const handleStopPress = (stop: RouteStop & Stop) => {
    // Navigate to stop ETA screen
    router.push(`/stop/${stop.stop}`);
  };

  const goToStop = (index: number) => {
    if (mapRef.current && stops[index]) {
      mapRef.current.animateToRegion(
        {
          latitude: stops[index].lat,
          longitude: stops[index].long,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: `Route ${routeId}`,
          headerRight: () => (
            <TouchableOpacity
              onPress={toggleFavorite}
              style={styles.favoriteButton}
            >
              <IconSymbol
                name={isFavorite ? "star.fill" : "star"}
                size={24}
                color={isFavorite ? "#FFD700" : "#808080"}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <>
          <ThemedView style={styles.routeHeader}>
            <ThemedText type="title" style={styles.routeNumber}>
              Route {routeId}
            </ThemedText>
            <ThemedText style={styles.routeDirection}>
              {bound === "I" ? "Inbound" : "Outbound"} • Service Type:{" "}
              {serviceType}
            </ThemedText>
            <ThemedText style={styles.routePath}>
              {routeInfo.origin} → {routeInfo.destination}
            </ThemedText>
          </ThemedView>

          {stops.length > 0 && (
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                provider={
                  Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                }
                style={styles.map}
                initialRegion={{
                  latitude: stops[0].lat,
                  longitude: stops[0].long,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                {/* Route line connecting all stops */}
                {stops.length > 1 && (
                  <Polyline
                    coordinates={stops.map((stop) => ({
                      latitude: stop.lat,
                      longitude: stop.long,
                    }))}
                    strokeColor="#0a7ea4"
                    strokeWidth={4}
                  />
                )}

                {/* Stop markers */}
                {stops.map((stop, index) => (
                  <Marker
                    key={stop.stop}
                    coordinate={{
                      latitude: stop.lat,
                      longitude: stop.long,
                    }}
                    title={`${index + 1}. ${stop.name_en}`}
                    description={`Sequence: ${stop.seq}`}
                    pinColor={nearestStopIndex === index ? "blue" : undefined}
                    onCalloutPress={() => handleStopPress(stop)}
                  />
                ))}

                {/* User location marker if available */}
                {userLocation && (
                  <Marker
                    coordinate={{
                      latitude: userLocation.coords.latitude,
                      longitude: userLocation.coords.longitude,
                    }}
                    title="Your Location"
                    pinColor="green"
                  />
                )}
              </MapView>
            </View>
          )}

          <ThemedText type="subtitle" style={styles.stopsHeader}>
            Stops ({stops.length})
          </ThemedText>

          <FlatList
            data={stops}
            keyExtractor={(item) =>
              `${item.route}-${item.bound}-${item.seq}-${item.stop}`
            }
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => handleStopPress(item)}
                style={[
                  styles.stopItem,
                  nearestStopIndex === index ? styles.nearestStop : null,
                ]}
                activeOpacity={0.7}
              >
                <ThemedView
                  style={[
                    styles.stopSequence,
                    nearestStopIndex === index
                      ? styles.nearestStopSequence
                      : null,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.sequenceNumber,
                      nearestStopIndex === index
                        ? styles.nearestStopSequenceText
                        : null,
                    ]}
                  >
                    {item.seq}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.stopInfo}>
                  <ThemedText style={styles.stopName}>
                    {item.name_en}
                  </ThemedText>
                  <ThemedText style={styles.stopNameChinese}>
                    {item.name_tc}
                  </ThemedText>
                </ThemedView>
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => goToStop(index)}
                >
                  <IconSymbol name="map.fill" size={20} color="#0a7ea4" />
                </TouchableOpacity>
                <IconSymbol name="chevron.right" size={20} color="#808080" />
              </TouchableOpacity>
            )}
            style={styles.stopsList}
            contentContainerStyle={styles.stopsListContent}
          />
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
    justifyContent: "center",
    alignItems: "center",
  },
  routeHeader: {
    marginBottom: 16,
  },
  routeNumber: {
    marginBottom: 4,
  },
  routeDirection: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  routePath: {
    fontSize: 18,
    fontWeight: "500",
  },
  mapContainer: {
    height: 250,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  stopsHeader: {
    marginBottom: 12,
  },
  stopsList: {
    flex: 1,
  },
  stopsListContent: {
    paddingBottom: 20,
  },
  stopItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  nearestStop: {
    backgroundColor: "rgba(10, 126, 164, 0.1)",
  },
  stopSequence: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFD580",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  nearestStopSequence: {
    backgroundColor: "#0a7ea4",
  },
  sequenceNumber: {
    fontWeight: "bold",
    color: "#8B4513",
  },
  nearestStopSequenceText: {
    color: "white",
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: "500",
  },
  stopNameChinese: {
    fontSize: 14,
    opacity: 0.7,
  },
  mapButton: {
    padding: 8,
    marginRight: 8,
  },
  favoriteButton: {
    marginRight: 12,
  },
});
