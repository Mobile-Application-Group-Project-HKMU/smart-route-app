// Import necessary modules from Expo and React
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  View,
  Dimensions,
  Linking,
  Platform,
} from "react-native";
// Navigation hooks
import { useFocusEffect } from "@react-navigation/native";
// Map components
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

// Import custom UI components
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { CrowdIndicator } from "@/components/CrowdIndicator";
import TripImpactRecorder from "@/components/TripImpactRecorder";
// Import MTR utility functions
import { classifyStopETAs, getAllStops } from "@/util/mtr";
import { MtrStation, MTR_COLORS } from "@/util/mtr";
import { predictCrowdLevel } from "@/util/crowdPrediction";
import { getSettings } from "@/util/settingsStorage";
// Import type definitions
import { ClassifiedTransportETA, TransportETA } from "@/types/transport-types";
import { formatTransportTime } from "@/util/datetime";
// Import favorite handling utilities
import {
  FavRouteStation,
  saveToLocalStorage,
  getFromLocalStorage,
} from "@/util/favourite";
// Import language context
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * MTR Station Screen Component
 * Displays detailed information about a specific MTR station including:
 * - Station details
 * - Map location
 * - Real-time train arrival information
 */
export default function MtrStationScreen() {
  // Get station ID from URL parameters
  const { stationId } = useLocalSearchParams();
  // State for station data
  const [station, setStation] = useState<MtrStation | null>(null);
  // State for estimated time of arrivalsS
  const [etas, setEtas] = useState<ClassifiedTransportETA[]>([]);
  // Loading state
  const [loading, setLoading] = useState(true);
  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false);
  // Reference to the map component
  const mapRef = useRef<MapView | null>(null);
  // Language utilities from context
  const { t, language } = useLanguage();
  const [showCrowdPredictions, setShowCrowdPredictions] = useState(true);

  /**
   * Checks if the current station is saved as a favorite
   * Updates the isFavorite state accordingly
   */
  const checkFavorite = async () => {
    try {
      const favorites = (await getFromLocalStorage(
        "stationFavorites"
      )) as FavRouteStation | null;
      if (favorites && favorites.stationID.includes(stationId as string)) {
        setIsFavorite(true);
      } else {
        setIsFavorite(false);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  /**
   * Opens navigation to the station in the device's maps app
   * Handles platform-specific map URLs (iOS vs Android)
   * Uses the station's coordinates and name based on current language
   */
  const openNavigation = () => {
    if (!station) return;

    const { lat, long } = station;
    // Encode station name based on current language setting
    const label = encodeURI(
      language === "en"
        ? station.name_en
        : language === "zh-Hans"
        ? station.name_sc || station.name_tc
        : station.name_tc
    );

    let url = "";
    if (Platform.OS === "ios") {
      // iOS-specific URL scheme
      url = `maps:?q=${label}&ll=${lat},${long}`;
    } else {
      // Android-specific URL scheme
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}&destination_place_id=${label}`;
    }

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(t("error.navigation"), t("error.open.maps"));
      }
    });
  };

  /**
   * Toggles the favorite status of the current station
   * Updates local storage and the isFavorite state
   * Displays an alert to confirm the action
   */
  const toggleFavorite = async () => {
    try {
      let favorites = (await getFromLocalStorage(
        "stationFavorites"
      )) as FavRouteStation;

      if (!favorites) {
        favorites = { stationID: [] };
      }

      if (isFavorite) {
        // Remove station from favorites
        favorites.stationID = favorites.stationID.filter(
          (id) => id !== stationId
        );
      } else {
        // Add station to favorites
        favorites.stationID.push(stationId as string);
      }

      await saveToLocalStorage("stationFavorites", favorites);
      setIsFavorite(!isFavorite);

      Alert.alert(
        isFavorite ? "Removed from Favorites" : "Added to Favorites",
        isFavorite
          ? "This station has been removed from your favorites."
          : "This station has been added to your favorites."
      );
    } catch (error) {
      console.error("Error updating favorites:", error);
      Alert.alert("Error", "Failed to update favorites");
    }
  };

  /**
   * Loads station data including:
   * - Station details
   * - Real-time train arrival information
   * - Favorite status
   */
  const loadStationData = async () => {
    if (!stationId) return;

    try {
      setLoading(true);

      // Fetch all stations and find the current station by ID
      const stations = await getAllStops();
      const stationData = stations.find((s) => s.stop === stationId);

      if (!stationData) {
        Alert.alert("Error", "Station not found");
        router.back();
        return;
      }

      setStation(stationData);

      // Fetch and classify estimated time of arrivals for the station
      const stationEtas = await classifyStopETAs(stationId as string);
      setEtas(stationEtas);

      // Check if the station is a favorite
      await checkFavorite();
    } catch (error) {
      console.error("Failed to load station data:", error);
      Alert.alert("Error", "Could not load station information");
    } finally {
      setLoading(false);
    }
  };

  // Use focus effect to load station data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadStationData();
      return () => {
        // Cleanup if necessary
      };
    }, [stationId])
  );

  /**
   * Opens the station location in the device's maps app
   * Handles platform-specific map URLs (iOS vs Android)
   */
  const openInMaps = () => {
    if (!station) return;

    const { lat, long } = station;
    const label = language === "en" ? station.name_en : station.name_tc;

    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });

    const latLng = `${lat},${long}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert(t("error.navigation"), t("error.open.maps"));
      });
    }
  };

  /**
   * Navigates to the MTR line screen for the specified line code
   * @param lineCode - The code of the MTR line to navigate to
   */
  const navigateToLine = (lineCode: string) => {
    router.push({
      pathname: "/mtr/line/[lineId]",
      params: { lineId: lineCode },
    });
  };

  /**
   * Gets the station name based on the current language setting
   * @returns The station name in the appropriate language
   */
  const getStationName = () => {
    if (!station) return "";
    return language === "en"
      ? station.name_en
      : language === "zh-Hans"
      ? station.name_sc || station.name_tc
      : station.name_tc;
  };

  useEffect(() => {
    // Load settings
    const loadSettings = async () => {
      const settings = await getSettings();
      setShowCrowdPredictions(settings.showCrowdPredictions);
    };

    loadSettings();
  }, []);

  const renderETA = (group: ClassifiedTransportETA) => {
    return (
      <ThemedView key={`${group.route}-${group.destination_en}`} style={styles.etaCard}>
        <ThemedView style={styles.etaHeader}>
          <View
            style={[
              styles.lineChip,
              { backgroundColor: MTR_COLORS[group.route as keyof typeof MTR_COLORS] || "#999" },
            ]}
          >
            <ThemedText style={styles.lineCode}>{group.route}</ThemedText>
          </View>
          <ThemedText style={styles.destination}>
            {language === "en" ? group.destination_en : group.destination_tc}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.etaTimes}>
          {group.etas.map((eta, etaIndex) => {
            // Generate crowd prediction for this ETA
            const crowdPrediction = showCrowdPredictions && eta.eta !== null ? 
              predictCrowdLevel(group.route, stationId as string, new Date(eta.eta)) : 
              null;
              
            return (
              <ThemedView key={etaIndex} style={styles.etaTimeItem}>
                <ThemedText style={styles.etaTime}>
                    {eta.eta !== null 
                      ? formatTransportTime(eta.eta, language)
                      : t("stop.no.data")}
                  </ThemedText>
                {eta.platform && (
                  <ThemedText style={styles.platformInfo}>
                    {t("platform")} {eta.platform}
                  </ThemedText>
                )}
                {(eta as any).remarks && (
                  <ThemedText style={styles.etaRemark}>
                    {(eta as any).remarks}
                  </ThemedText>
                )}
                
                {/* Add crowd indicator */}
                {showCrowdPredictions && crowdPrediction && (
                  <CrowdIndicator 
                    level={crowdPrediction.level} 
                    percentage={crowdPrediction.percentage}
                    size="small"
                  />
                )}
              </ThemedView>
            );
          })}
        </ThemedView>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: getStationName(),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={loadStationData}
                style={styles.refreshButton}
              >
                <IconSymbol name="arrow.clockwise" size={20} color="#0a7ea4" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleFavorite}
                style={styles.favoriteButton}
              >
                <IconSymbol
                  name={isFavorite ? "star.fill" : "star"}
                  size={20}
                  color={isFavorite ? "#FFD700" : "#808080"}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : station ? (
        <>
          {/* Station Information Card */}
          <ThemedView style={styles.infoCard}>
            <ThemedText style={styles.stationId}>
              {t("mtr.station.id") || t("transport.station.id")}: {stationId}
            </ThemedText>

            <View style={styles.lineChips}>
              {station.line_codes.map((line) => (
                <TouchableOpacity
                  key={line}
                  style={[
                    styles.lineChip,
                    {
                      backgroundColor:
                        MTR_COLORS[line as keyof typeof MTR_COLORS] ||
                        "#666666",
                    },
                  ]}
                  onPress={() => navigateToLine(line)}
                >
                  <ThemedText style={styles.lineCode}>{line}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {station.is_interchange && (
              <ThemedText style={styles.interchangeNote}>
                {t("mtr.station.interchange") ||
                  t("transport.station.interchange")}
              </ThemedText>
            )}
          </ThemedView>

          {/* Trip Impact Recorder */}
          {station && (
            <TripImpactRecorder 
              mode="MTR" 
              distance={0} // Will be estimated
            />
          )}

          {/* Map View */}
          {Platform.OS !== "web" && (
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={
                  Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                }
                initialRegion={{
                  latitude: station.lat,
                  longitude: station.long,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: station.lat,
                    longitude: station.long,
                  }}
                  title={station.name_en}
                  pinColor="#0075C2"
                />
              </MapView>
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={openNavigation}
              >
                <IconSymbol
                  name="arrow.triangle.turn.up.right.circle.fill"
                  size={20}
                  color="white"
                />
                <ThemedText style={styles.navigationButtonText}>
                  {t("navigate")}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Estimated Time of Arrivals (ETAs) */}
          <ThemedText style={styles.sectionTitle}>
            {t("mtr.station.nextTrain") || t("transport.station.arrivals")}
          </ThemedText>

          {etas.length === 0 ? (
            <ThemedText style={styles.noEtasText}>
              {t("transport.station.no.arrivals")}
            </ThemedText>
          ) : (
            <FlatList
              data={etas}
              keyExtractor={(item) =>
                `${item.route}-${item.direction}-${item.destination_en}`
              }
              style={styles.etasList}
              renderItem={({ item }) => renderETA(item)}
            />
          )}
        </>
      ) : (
        <ThemedText style={styles.errorText}>
          {t("error.station.not.found")}
        </ThemedText>
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
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  refreshButton: {
    padding: 4,
  },
  favoriteButton: {
    padding: 4,
  },
  infoCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  stationId: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
  },
  lineChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 8,
  },
  lineChip: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 50,
    alignItems: "center",
  },
  lineCode: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  interchangeNote: {
    marginTop: 8,
    fontStyle: "italic",
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
  },
  facilitiesSection: {
    marginBottom: 16,
  },
  facilitiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  facilityItem: {
    width: "50%",
    paddingVertical: 4,
  },
  exitsList: {
    marginBottom: 16,
  },
  exitCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    minWidth: 150,
  },
  exitLabel: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  exitDestination: {
    fontSize: 14,
  },
  etasList: {
    flex: 1,
  },
  etaCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  etaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  destination: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  etaTimes: {
    gap: 8,
  },
  etaTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  etaTime: {
    fontSize: 16,
    fontWeight: "500",
  },
  platformInfo: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
  },
  etaRemark: {
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.7,
  },
  noEtasText: {
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    fontStyle: "italic",
    opacity: 0.7,
  },
  navigateButton: {
    backgroundColor: "#0075C2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginTop: 12,
    marginBottom: 20,
  },
  navigateButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  errorText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    opacity: 0.7,
  },
  navigationButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  navigationButtonText: {
    color: "white",
    marginLeft: 4,
    fontWeight: "bold",
  },
});
