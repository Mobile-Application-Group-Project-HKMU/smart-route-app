// This file implements the bus route detail screen that displays route information, stops, and a map
// The [routeId] in the filename allows dynamic routing based on the bus route ID

// Import necessary navigation components from Expo Router
import { useLocalSearchParams, Stack, router } from "expo-router";
// Import React hooks for state management and side effects
import { useEffect, useState, useRef } from "react";
// Import React Native UI components
import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  View,
  Platform,
} from "react-native";
// Import location services for tracking user position
import * as Location from "expo-location";
// Import map components for displaying route and stops
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

// Import themed UI components for consistent styling
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
// Import KMB API utility functions and type definitions
import {
  getRouteStops,
  getRouteDetails,
  type RouteStop,
  type Stop,
  getAllStops,
} from "@/util/kmb";
// Import favorites functionality for saving preferred routes
import {
  FavRouteKMB,
  saveToLocalStorage,
  getFromLocalStorage,
} from "@/util/favourite";
// Import language context for internationalization
import { useLanguage } from "@/contexts/LanguageContext";
// Import JourneyRecorder component
import JourneyRecorder from "@/components/JourneyRecorder";
import { TransportRoute } from "@/types/transport-types";
// Import TripImpactRecorder component

export default function RouteDetailScreen() {
  // Extract route parameters from the URL
  const {
    routeId,
    bound,
    serviceType,
    company: companyParam,
    region,
  } = useLocalSearchParams();
  // State for storing the list of bus stops with their details
  const [stops, setStops] = useState<Array<RouteStop & Stop>>([]);
  // State for tracking loading status
  const [loading, setLoading] = useState(true);
  // State for tracking if the route is marked as favorite
  const [isFavorite, setIsFavorite] = useState(false);
  // State for storing route information like origin and destination
  const [routeInfo, setRouteInfo] = useState<{
    origin: string;
    destination: string;
    orig_tc: string;
    dest_tc: string;
    orig_sc: string;
    dest_sc: string;
  }>({
    origin: "",
    destination: "",
    orig_tc: "",
    dest_tc: "",
    orig_sc: "",
    dest_sc: "",
  });
  // State for storing the user's current location
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  // State for tracking which stop is closest to the user
  const [nearestStopIndex, setNearestStopIndex] = useState<number | null>(null);
  // Reference to the map component for programmatic control
  const mapRef = useRef<MapView>(null);

  // Access translation function and current language from context
  const { t, language } = useLanguage();

  // Determine if the route is inbound or outbound based on the 'bound' parameter
  const direction = bound === "I" ? "inbound" : "outbound";
  const routeKey = `${routeId}-${bound}-${serviceType}`;

  // Function to get localized text based on the current language
  const getLocalizedText = (en: string, tc: string, sc: string): string => {
    if (language === "zh-Hant") return tc;
    if (language === "zh-Hans") return sc;
    return en;
  };

  // Check if the route is marked as favorite when the component mounts
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

  // Fetch route details and stops when the route parameters change
  useEffect(() => {
    const fetchRouteDetails = async () => {
      try {
        setLoading(true);

        // Request location permissions and get the user's current location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = (await Location.getCurrentPositionAsync(
            {}
          )) as Location.LocationObject;
          setUserLocation(location);
        }

        // Determine the bus company (default to KMB)
        const company = (
          Array.isArray(companyParam) ? companyParam[0] : companyParam || "KMB"
        ).toUpperCase();

        if (company === "GMB") {
          const regionValue = region as "HKI" | "KLN" | "NT";

          const {
            getRouteDetails: getGmbRouteDetails,
            getRouteStops: getGmbRouteStops,
          } = await import("@/util/gmb");

          const gmbRouteDetails = await getGmbRouteDetails(
            regionValue,
            routeId as string
          );

          const directionObj =
            gmbRouteDetails.directions?.find((d) =>
              bound
                ? bound === "O"
                  ? d.route_seq === "1"
                  : d.route_seq === "2"
                : true
            ) || gmbRouteDetails.directions?.[0];

          if (directionObj) {
            setRouteInfo({
              origin: directionObj.orig_en,
              destination: directionObj.dest_en,
              orig_tc: directionObj.orig_tc,
              dest_tc: directionObj.dest_tc,
              orig_sc: directionObj.orig_tc,
              dest_sc: directionObj.dest_tc,
            });

            const routeSeq = bound === "I" ? "2" : "1";
            const gmbRouteStops = await getGmbRouteStops(
              routeId as string,
              routeSeq as "1" | "2"
            );

            setStops(
              gmbRouteStops.map((stop) => ({
                ...stop,
                route: routeId as string,
                bound: bound as "I" | "O",
                co: "KMB" as "KMB", // Cast to KMB for type compatibility
                service_type: "1",
                data_timestamp: new Date().toISOString(),
                lat: parseFloat(String(stop.lat || "0")),
                long: parseFloat(String(stop.long || "0")),
                name_sc: stop.name_tc || stop.name_tc || "",
              })) as Array<RouteStop & Stop>
            );
          }
        } else {
          const details = await getRouteDetails(
            routeId as string,
            direction as "inbound" | "outbound",
            serviceType as string
          );

          setRouteInfo({
            origin: details.orig_en,
            destination: details.dest_en,
            orig_tc: String(details.orig_tc || details.orig_en),
            dest_tc: String(details.dest_tc || details.dest_en),
            orig_sc: String(details.orig_tc || details.orig_en),
            dest_sc: String(details.dest_tc || details.dest_en),
          });

          const routeStops = await getRouteStops(
            routeId as string,
            direction as "inbound" | "outbound",
            serviceType as string
          );

          const allStops = await getAllStops();
          const stopsMap = new Map(allStops.map((stop) => [stop.stop, stop]));

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
                distance: 0,
              }),
            };
          });

          setStops(routeStopsWithDetails);

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
        }
      } catch (error) {
        console.error("Failed to fetch route details:", error);
        Alert.alert(t("error"), t("failedToLoadRouteInformation"));
      } finally {
        setLoading(false);
      }
    };

    if (routeId) {
      fetchRouteDetails();
    }
  }, [routeId, bound, serviceType, direction, companyParam, region]);

  // Toggle the favorite status of the route
  const toggleFavorite = async () => {
    try {
      let favorites = (await getFromLocalStorage(
        "kmbFavorites"
      )) as FavRouteKMB;

      if (!favorites) {
        favorites = { kmbID: [] };
      }

      if (isFavorite) {
        favorites.kmbID = favorites.kmbID.filter((id) => id !== routeKey);
      } else {
        favorites.kmbID.push(routeKey);
      }

      await saveToLocalStorage("kmbFavorites", favorites);
      setIsFavorite(!isFavorite);

      Alert.alert(
        isFavorite ? t("removedFromFavorites") : t("addedToFavorites"),
        isFavorite ? t("routeRemovedFromFavorites") : t("routeAddedToFavorites")
      );
    } catch (error) {
      console.error("Error updating favorites:", error);
      Alert.alert(t("error"), t("failedToUpdateFavorites"));
    }
  };

  // Handle press on a stop to navigate to the stop detail screen
  const handleStopPress = (stop: RouteStop & Stop) => {
    router.push(`/stop/${stop.stop}`);
  };

  // Animate the map to focus on a specific stop
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

  // Navigate to achievements screen
  const navigateToAchievements = () => {
    router.push("/achievements");
  };

  // Calculate route distance more accurately using the Haversine formula
  const calculateRouteDistance = (stops: Array<RouteStop & Stop>): number => {
    if (stops.length <= 1) return 0;

    let totalDistance = 0;
    for (let i = 1; i < stops.length; i++) {
      const prevStop = stops[i - 1];
      const currentStop = stops[i];

      // Haversine formula to calculate distance between two points on Earth
      const R = 6371; // Radius of Earth in kilometers
      const dLat = (currentStop.lat - prevStop.lat) * Math.PI / 180;
      const dLon = (currentStop.long - prevStop.long) * Math.PI / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(prevStop.lat * Math.PI / 180) *
          Math.cos(currentStop.lat * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in km

      totalDistance += distance;
    }
    return totalDistance;
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: `${t("route")} ${routeId}`,
          headerRight: () => (
            <View style={styles.headerButtons}>
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
            </View>
          ),
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <>
          {typeof routeId === "string" && (
            <JourneyRecorder
              route={routeId as unknown as TransportRoute}
              onAchievementUnlocked={navigateToAchievements}
            />
          )}

          <ThemedView style={styles.routeHeader}>
            <ThemedText type="title" style={styles.routeNumber}>
              {t("route")} {routeId}
            </ThemedText>
            <ThemedText style={styles.routeDirection}>
              {t(direction)} • {t("serviceType")}: {serviceType}
            </ThemedText>
            <ThemedText style={styles.routePath}>
              {getLocalizedText(
                routeInfo.origin,
                routeInfo.orig_tc,
                routeInfo.orig_sc
              )}{" "}
              →{" "}
              {getLocalizedText(
                routeInfo.destination,
                routeInfo.dest_tc,
                routeInfo.dest_sc
              )}
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

                {stops.map((stop, index) => (
                  <Marker
                    key={stop.stop}
                    coordinate={{
                      latitude: stop.lat,
                      longitude: stop.long,
                    }}
                    title={`${index + 1}. ${getLocalizedText(
                      stop.name_en,
                      stop.name_tc,
                      stop.name_sc
                    )}`}
                    description={`${t("sequence")}: ${stop.seq}`}
                    pinColor={nearestStopIndex === index ? "blue" : undefined}
                    onCalloutPress={() => handleStopPress(stop)}
                  />
                ))}

                {userLocation && (
                  <Marker
                    coordinate={{
                      latitude: userLocation.coords.latitude,
                      longitude: userLocation.coords.longitude,
                    }}
                    title={t("yourLocation")}
                    pinColor="green"
                  />
                )}
              </MapView>
            </View>
          )}

          <ThemedText type="subtitle" style={styles.stopsHeader}>
            {t("stops")} ({stops.length})
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
                    {getLocalizedText(item.name_en, item.name_tc, item.name_sc)}
                  </ThemedText>
                  {language === "en" && (
                    <ThemedText style={styles.stopNameChinese}>
                      {item.name_tc}
                    </ThemedText>
                  )}
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
    paddingBottom: 120,
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
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageButton: {
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#0a7ea4",
    borderRadius: 4,
  },
  languageButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
