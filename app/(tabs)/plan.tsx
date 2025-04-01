import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import ParallaxScrollView from "@/components/ParallaxScrollView";

// Import transport utilities
import { getAllStops as getAllKmbStops } from "@/util/kmb";
import { getAllStops as getAllMtrStops } from "@/util/mtr";
import { TransportStop, TransportMode } from "@/types/transport-types";

type JourneyStep = {
  type: "WALK" | "BUS" | "MTR";
  from: TransportStop;
  to: TransportStop;
  distance?: number;
  duration?: number;
  route?: string;
  company?: string;
};

type Journey = {
  id: string;
  steps: JourneyStep[];
  totalDuration: number;
  totalDistance: number;
};

type SearchResult = TransportStop & {
  displayName: string;
  company: string;
};

export default function RoutePlanScreen() {
  const { t, language } = useLanguage();
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [fromStop, setFromStop] = useState<SearchResult | null>(null);
  const [toStop, setToStop] = useState<SearchResult | null>(null);
  const [searchingFrom, setSearchingFrom] = useState(false);
  const [searchingTo, setSearchingTo] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allStops, setAllStops] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStops, setLoadingStops] = useState(true);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);

  // Load all stops when component mounts
  useEffect(() => {
    const loadAllStops = async () => {
      try {
        setLoadingStops(true);
        // Get stops from different transport providers
        const kmbStops = await getAllKmbStops();
        const mtrStops = await getAllMtrStops();

        // Process stops to add display name
        const processedStops = [
          ...kmbStops.map((stop) => ({
            ...stop,
            company: "KMB",
            mode: "BUS" as TransportMode,
            displayName: language === "en" ? stop.name_en : stop.name_tc,
          })),
          ...mtrStops.map((stop) => ({
            ...stop,
            company: "MTR",
            mode: "MTR" as TransportMode,
            displayName: language === "en" ? stop.name_en : stop.name_tc,
          })),
        ];

        setAllStops(processedStops);
      } catch (error) {
        console.error("Error loading stops:", error);
        Alert.alert(t("error"), t("error.loading.stops"));
      } finally {
        setLoadingStops(false);
      }
    };

    loadAllStops();
  }, [language]);

  // Handle search query changes
  const handleSearch = (text: string, isFrom: boolean) => {
    if (isFrom) {
      setFromText(text);
      setSearchingFrom(true);
      setSearchingTo(false);
    } else {
      setToText(text);
      setSearchingFrom(false);
      setSearchingTo(true);
    }

    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    // Filter stops based on search query
    const query = text.toLowerCase();
    const results = allStops
      .filter(
        (stop) =>
          stop.displayName.toLowerCase().includes(query) ||
          (stop.name_en && stop.name_en.toLowerCase().includes(query)) ||
          (stop.name_tc && stop.name_tc.includes(query))
      )
      .slice(0, 10); // Limit to 10 results for performance

    setSearchResults(results);
  };

  // Handle stop selection
  const handleSelectStop = (stop: SearchResult) => {
    if (searchingFrom) {
      setFromStop(stop);
      setFromText(stop.displayName);
      setUseCurrentLocation(false);
    } else if (searchingTo) {
      setToStop(stop);
      setToText(stop.displayName);
    }
    setSearchResults([]);
    setSearchingFrom(false);
    setSearchingTo(false);
  };

  // Handle using current location
  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("permission.denied"), t("location.permission.denied"));
        return;
      }

      setLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      setUseCurrentLocation(true);
      setFromText(t("current.location"));
      setFromStop(null);
      setSearchingFrom(false);
      setSearchingTo(false);
      setSearchResults([]);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(t("error"), t("error.getting.location"));
    } finally {
      setLoading(false);
    }
  };

  // Plan journey
  const handlePlanJourney = async () => {
    if ((!fromStop && !useCurrentLocation) || !toStop) {
      Alert.alert(t("error"), t("select.both.locations"));
      return;
    }

    try {
      setLoading(true);
      const origin =
        useCurrentLocation && userLocation
          ? {
              lat: userLocation.coords.latitude,
              long: userLocation.coords.longitude,
            }
          : fromStop;

      if (!origin) {
        throw new Error("Origin location not available");
      }

      // Generate sample journeys
      const journeys = generateSampleJourneys(origin, toStop);
      setJourneys(journeys);

      if (journeys.length > 0) {
        setSelectedJourney(journeys[0]);
      }
    } catch (error) {
      console.error("Error planning journey:", error);
      Alert.alert(t("error"), t("error.planning.journey"));
    } finally {
      setLoading(false);
    }
  };

  // Generate sample journeys for demonstration
  const generateSampleJourneys = (from: any, to: SearchResult): Journey[] => {
    // Calculate straight-line distance
    const fromLat = from.lat;
    const fromLng = from.long;
    const toLat = to.lat;
    const toLng = to.long;

    const distance = calculateDistance(fromLat, fromLng, toLat, toLng);

    // For demonstration, create journey options with different modes
    return [
      {
        id: "1",
        steps: [
          {
            type: "WALK",
            from: {
              ...from,
              name_en: useCurrentLocation ? "Current Location" : from.name_en,
            },
            to: { ...getNearbyStop(from, "KMB"), name_en: "Nearby KMB Stop" },
            distance: Math.round(distance * 0.1),
            duration: Math.round(((distance * 0.1) / 80) * 60), // Walking at 80m per minute
          },
          {
            type: "BUS",
            from: getNearbyStop(from, "KMB"),
            to: getNearbyStop(to, "KMB"),
            route: getRandomRoute("KMB"),
            company: "KMB",
            distance: Math.round(distance * 0.9),
            duration: Math.round(((distance * 0.9) / 500) * 60), // Bus at 500m per minute
          },
          {
            type: "WALK",
            from: getNearbyStop(to, "KMB"),
            to: to,
            distance: Math.round(distance * 0.05),
            duration: Math.round(((distance * 0.05) / 80) * 60),
          },
        ],
        totalDuration: Math.round((distance / 400) * 60), // Estimated total in minutes
        totalDistance: Math.round(distance),
      },
      {
        id: "2",
        steps: [
          {
            type: "WALK",
            from: {
              ...from,
              name_en: useCurrentLocation ? "Current Location" : from.name_en,
            },
            to: {
              ...getNearbyStop(from, "MTR"),
              name_en: "Nearby MTR Station",
            },
            distance: Math.round(distance * 0.15),
            duration: Math.round(((distance * 0.15) / 80) * 60),
          },
          {
            type: "MTR",
            from: getNearbyStop(from, "MTR"),
            to: getNearbyStop(to, "MTR"),
            route: getRandomRoute("MTR"),
            company: "MTR",
            distance: Math.round(distance * 0.7),
            duration: Math.round(((distance * 0.7) / 1000) * 60), // MTR at 1000m per minute
          },
          {
            type: "WALK",
            from: getNearbyStop(to, "MTR"),
            to: to,
            distance: Math.round(distance * 0.15),
            duration: Math.round(((distance * 0.15) / 80) * 60),
          },
        ],
        totalDuration: Math.round((distance / 600) * 60),
        totalDistance: Math.round(distance),
      },
      {
        id: "3",
        steps: [
          {
            type: "WALK",
            from: {
              ...from,
              name_en: useCurrentLocation ? "Current Location" : from.name_en,
            },
            to: { ...getNearbyStop(from, "KMB"), name_en: "Nearby KMB Stop" },
            distance: Math.round(distance * 0.1),
            duration: Math.round(((distance * 0.1) / 80) * 60),
          },
          {
            type: "BUS",
            from: getNearbyStop(from, "KMB"),
            to: getNearbyStop(from, "MTR", 0.4), // Transfer point
            route: getRandomRoute("KMB"),
            company: "KMB",
            distance: Math.round(distance * 0.4),
            duration: Math.round(((distance * 0.4) / 400) * 60),
          },
          {
            type: "WALK",
            from: getNearbyStop(from, "MTR", 0.4), // Transfer point
            to: getNearbyStop(from, "MTR", 0.45), // MTR station
            distance: Math.round(distance * 0.05),
            duration: Math.round(((distance * 0.05) / 80) * 60),
          },
          {
            type: "MTR",
            from: getNearbyStop(from, "MTR", 0.45), // MTR station
            to: getNearbyStop(to, "MTR"),
            route: getRandomRoute("MTR"),
            company: "MTR",
            distance: Math.round(distance * 0.35),
            duration: Math.round(((distance * 0.35) / 1000) * 60),
          },
          {
            type: "WALK",
            from: getNearbyStop(to, "MTR"),
            to: to,
            distance: Math.round(distance * 0.1),
            duration: Math.round(((distance * 0.1) / 80) * 60),
          },
        ],
        totalDuration: Math.round((distance / 500) * 60),
        totalDistance: Math.round(distance),
      },
    ];
  };

  // Helper functions
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const getNearbyStop = (
    location: any,
    company: string,
    offsetMultiplier = 0.2
  ) => {
    // In a real app, this would find the closest stop of the given company
    // For this demo, just return a slightly offset location
    const offset = (Math.random() - 0.5) * offsetMultiplier; // Random small offset
    return {
      ...location,
      lat: location.lat + offset,
      long: location.long + offset,
      company,
    };
  };

  const getRandomRoute = (company: string): string => {
    if (company === "KMB") {
      const routes = ["1", "1A", "5", "5C", "6", "7", "9"];
      return routes[Math.floor(Math.random() * routes.length)];
    } else if (company === "MTR") {
      const routes = ["TWL", "ISL", "TKL", "EAL", "SIL"];
      return routes[Math.floor(Math.random() * routes.length)];
    } else {
      return "";
    }
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case "WALK":
        return "figure.walk";
      case "BUS":
        return "bus";
      case "MTR":
        return "tram";
      default:
        return "arrow.right";
    }
  };

  const getTransportColor = (type: string) => {
    switch (type) {
      case "WALK":
        return "#555555";
      case "BUS":
        return "#FF5151";
      case "MTR":
        return "#E60012";
      default:
        return "#000000";
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} ${t("min")}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} ${t("hour")}${
      hours > 1 ? "s" : ""
    } ${remainingMinutes} ${t("min")}`;
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // Navigate to transport details
  const navigateToTransportDetails = (step: JourneyStep) => {
    if (step.type === "BUS" && step.route) {
      router.push(`/bus/${step.route}?bound=O&serviceType=1`);
    } else if (step.type === "MTR" && step.route) {
      router.push({
        pathname: "/mtr/line/[lineId]",
        params: { lineId: step.route },
      });
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#83ac23", dark: "#1A1A1A" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#0A3161"
          name="arrow.triangle.swap"
          style={styles.headerImage}
        />
      }
    >
      <Stack.Screen options={{ title: t("routePlan") }} />

      {/* Search Inputs */}
      <ThemedView style={styles.searchContainer}>
        <ThemedView style={styles.inputContainer}>
          <IconSymbol
            name="location.fill"
            size={20}
            color="#8B4513"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={fromText}
            onChangeText={(text) => handleSearch(text, true)}
            placeholder={t("fromStop")}
            onFocus={() => {
              setSearchingFrom(true);
              setSearchingTo(false);
              if (fromText.trim()) {
                handleSearch(fromText, true);
              }
            }}
          />
          {fromText ? (
            <TouchableOpacity
              onPress={() => {
                setFromText("");
                setFromStop(null);
                setUseCurrentLocation(false);
              }}
              style={styles.clearButton}
            >
              <IconSymbol name="xmark.circle.fill" size={20} color="#999999" />
            </TouchableOpacity>
          ) : null}
        </ThemedView>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleUseCurrentLocation}
        >
          <IconSymbol name="location.circle.fill" size={20} color="#8B4513" />
          <ThemedText style={styles.currentLocationText}>
            {t("useCurrentLocation")}
          </ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.inputContainer}>
          <IconSymbol
            name="mappin.circle.fill"
            size={20}
            color="#8B4513"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={toText}
            onChangeText={(text) => handleSearch(text, false)}
            placeholder={t("toStop")}
            onFocus={() => {
              setSearchingFrom(false);
              setSearchingTo(true);
              if (toText.trim()) {
                handleSearch(toText, false);
              }
            }}
          />
          {toText ? (
            <TouchableOpacity
              onPress={() => {
                setToText("");
                setToStop(null);
              }}
              style={styles.clearButton}
            >
              <IconSymbol name="xmark.circle.fill" size={20} color="#999999" />
            </TouchableOpacity>
          ) : null}
        </ThemedView>

        <TouchableOpacity
          style={[
            styles.planButton,
            (!fromStop && !useCurrentLocation) || !toStop
              ? styles.disabledButton
              : null,
          ]}
          onPress={handlePlanJourney}
          disabled={(!fromStop && !useCurrentLocation) || !toStop}
        >
          <IconSymbol
            name="arrow.triangle.turn.up.right.circle.fill"
            size={20}
            color="white"
          />
          <ThemedText style={styles.planButtonText}>
            {t("findRoutes")}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Search Results */}
      {(searchingFrom || searchingTo) && searchResults.length > 0 && (
        <ThemedView style={styles.searchResults}>
          <ScrollView>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={`${item.company}-${item.stop}`}
                style={styles.searchResultItem}
                onPress={() => handleSelectStop(item)}
              >
                <IconSymbol
                  name={item.company === "MTR" ? "tram.fill" : "bus.fill"}
                  size={20}
                  color={item.company === "MTR" ? "#E60012" : "#FF5151"}
                  style={styles.resultIcon}
                />
                <ThemedView style={styles.resultTextContainer}>
                  <ThemedText style={styles.resultText}>
                    {language === "en" ? item.name_en : item.name_tc}
                  </ThemedText>
                  <ThemedText style={styles.resultSubtext}>
                    {item.company} · {item.stop}
                  </ThemedText>
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>
      )}

      {loadingStops && (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <ThemedText style={styles.loadingText}>
            {t("loading.stops")}
          </ThemedText>
        </ThemedView>
      )}

      {loading && (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <ThemedText style={styles.loadingText}>
            {t("planning.journey")}
          </ThemedText>
        </ThemedView>
      )}

      {/* Journey Results */}
      {!loading && !loadingStops && journeys.length > 0 && (
        <ThemedView style={styles.resultsContainer}>
          {/* Journey Options */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.journeyOptions}
          >
            {journeys.map((journey) => (
              <TouchableOpacity
                key={journey.id}
                style={[
                  styles.journeyOption,
                  selectedJourney?.id === journey.id &&
                    styles.selectedJourneyOption,
                ]}
                onPress={() => setSelectedJourney(journey)}
              >
                <ThemedText style={styles.journeyDuration}>
                  {formatDuration(journey.totalDuration)}
                </ThemedText>
                <ThemedView style={styles.journeyModeIcons}>
                  {journey.steps
                    .filter((step) => step.type !== "WALK")
                    .map((step, index) => (
                      <IconSymbol
                        key={index}
                        name={getTransportIcon(step.type)}
                        size={16}
                        color={getTransportColor(step.type)}
                      />
                    ))}
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Selected Journey Details */}
          {selectedJourney && (
            <ThemedView style={styles.journeyDetails}>
              <ThemedText style={styles.journeySummary}>
                {formatDuration(selectedJourney.totalDuration)} ·{" "}
                {formatDistance(selectedJourney.totalDistance)}
              </ThemedText>

              {/* Journey Map */}
              {Platform.OS !== "web" && fromStop && toStop && (
                <View style={styles.mapContainer}>
                  <MapView
                    provider={
                      Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                    }
                    style={styles.map}
                    initialRegion={{
                      latitude: (fromStop.lat + toStop.lat) / 2,
                      longitude: (fromStop.long + toStop.long) / 2,
                      latitudeDelta: Math.abs(fromStop.lat - toStop.lat) * 2,
                      longitudeDelta: Math.abs(fromStop.long - toStop.long) * 2,
                    }}
                  >
                    {/* Origin Marker */}
                    <Marker
                      coordinate={{
                        latitude:
                          useCurrentLocation && userLocation
                            ? userLocation.coords.latitude
                            : fromStop.lat,
                        longitude:
                          useCurrentLocation && userLocation
                            ? userLocation.coords.longitude
                            : fromStop.long,
                      }}
                      title={
                        useCurrentLocation
                          ? t("current.location")
                          : fromStop.displayName
                      }
                      pinColor="blue"
                    />

                    {/* Destination Marker */}
                    <Marker
                      coordinate={{
                        latitude: toStop.lat,
                        longitude: toStop.long,
                      }}
                      title={toStop.displayName}
                      pinColor="red"
                    />

                    {/* Route line */}
                    {selectedJourney.steps.map((step, index) => (
                      <Polyline
                        key={index}
                        coordinates={[
                          {
                            latitude: step.from.lat,
                            longitude: step.from.long,
                          },
                          { latitude: step.to.lat, longitude: step.to.long },
                        ]}
                        strokeColor={getTransportColor(step.type)}
                        strokeWidth={3}
                      />
                    ))}
                  </MapView>
                </View>
              )}

              {/* Journey Steps */}
              <ThemedView>
                {selectedJourney.steps.map((step, index) => (
                  <ThemedView key={index} style={styles.journeyStep}>
                    <ThemedView
                      style={[
                        styles.stepIconContainer,
                        { backgroundColor: getTransportColor(step.type) },
                      ]}
                    >
                      <IconSymbol
                        name={getTransportIcon(step.type)}
                        size={24}
                        color="white"
                      />
                    </ThemedView>
                    <ThemedView style={styles.stepDetails}>
                      <ThemedText style={styles.stepType}>
                        {step.type === "WALK"
                          ? t("walk")
                          : step.type === "BUS"
                          ? `${t("take")} ${step.company} ${t("bus")}`
                          : `${t("take")} ${t("mtr")}`}
                        {step.route && ` ${step.route}`}
                      </ThemedText>

                      <ThemedText style={styles.stepFromTo}>
                        {language === "en"
                          ? step.from.name_en
                          : step.from.name_tc}{" "}
                        →{" "}
                        {language === "en" ? step.to.name_en : step.to.name_tc}
                      </ThemedText>

                      <ThemedView style={styles.stepMeta}>
                        <ThemedText style={styles.stepMetaText}>
                          {formatDuration(step.duration || 0)} ·{" "}
                          {formatDistance(step.distance || 0)}
                        </ThemedText>

                        {step.type !== "WALK" && (
                          <TouchableOpacity
                            style={styles.viewRouteButton}
                            onPress={() => navigateToTransportDetails(step)}
                          >
                            <ThemedText style={styles.viewRouteText}>
                              {t("viewRoute")}
                            </ThemedText>
                          </TouchableOpacity>
                        )}
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>
                ))}
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>
      )}

      {/* Empty State - No journeys */}
      {!loading &&
        !loadingStops &&
        journeys.length === 0 &&
        (fromStop || useCurrentLocation || toStop) && (
          <ThemedView style={styles.emptyStateContainer}>
            <IconSymbol name="map" size={60} color="#8B4513" />
            <ThemedText style={styles.emptyStateText}>
              {t("plan.journey.instruction")}
            </ThemedText>
          </ThemedView>
        )}

      {/* Initial State */}
      {!loading &&
        !loadingStops &&
        journeys.length === 0 &&
        !fromStop &&
        !toStop &&
        !useCurrentLocation && (
          <ThemedView style={styles.emptyStateContainer}>
            <IconSymbol name="arrow.triangle.swap" size={60} color="#8B4513" />
            <ThemedText style={styles.emptyStateText}>
              {t("select.origin.destination")}
            </ThemedText>
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
  headerImageContainer: {
    position: "absolute",
    bottom: 0,
    right: 20,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    height: 178,
    width: 178,
  },
  headerImage: {
    color: "#16b79c",
    bottom: -90,
    left: -35,
    position: "absolute",
    opacity: 0.7,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  searchContainer: {
    marginBottom: 16,
    gap: 12,
    backgroundColor: "#FFD580",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "white",
    height: 52,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#8B4513",
  },
  clearButton: {
    padding: 8,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 4,
  },
  currentLocationText: {
    marginLeft: 8,
    color: "#8B4513",
    fontWeight: "500",
  },
  planButton: {
    backgroundColor: "#8B4513",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 14,
    gap: 8,
    shadowColor: "#8B4513",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: "#b0b0b0",
    shadowOpacity: 0,
    elevation: 1,
  },
  planButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  searchResults: {
    position: "absolute",
    top: 150,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 12,
    maxHeight: 300,
    zIndex: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultIcon: {
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8B4513",
  },
  resultSubtext: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
    color: "#8B4513",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8B4513",
  },
  emptyStateContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    marginTop: 100,
    minHeight: 200,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 24,
    color: "#8B4513",
  },
  resultsContainer: {
    flex: 1,
  },
  journeyOptions: {
    padding: 12,
  },
  journeyOption: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginRight: 12,
    minWidth: 130,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  selectedJourneyOption: {
    backgroundColor: "#FFD580",
    borderColor: "#8B4513",
    borderWidth: 1,
    shadowColor: "#8B4513",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  journeyDuration: {
    fontSize: 17,
    fontWeight: "600",
    color: "#8B4513",
  },
  journeyModeIcons: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.5)",
    padding: 6,
    borderRadius: 8,
  },
  journeyDetails: {
    flex: 1,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  journeySummary: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: "#8B4513",
    backgroundColor: "#FFD580",
    padding: 10,
    borderRadius: 8,
    textAlign: "center",
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  journeyStep: {
    flexDirection: "row",
    marginBottom: 20,
  },
  stepIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  stepDetails: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 69, 19, 0.2)",
    paddingBottom: 16,
  },
  stepType: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#8B4513",
  },
  stepFromTo: {
    fontSize: 14,
    color: "#8B4513",
    marginBottom: 8,
    lineHeight: 20,
  },
  stepMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  stepMetaText: {
    fontSize: 14,
    color: "#8B4513",
    opacity: 0.7,
  },
  viewRouteButton: {
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 69, 19, 0.3)",
  },
  viewRouteText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8B4513",
  },
});
