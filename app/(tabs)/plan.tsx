// Import necessary React and React Native components
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
// Import Expo routing and location services
import { Stack, router } from "expo-router";
import * as Location from "expo-location";
// Import map components for route visualization
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";

// Import custom UI components
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
// Import language context for multilingual support
import { useLanguage } from "@/contexts/LanguageContext";
import ParallaxScrollView from "@/components/ParallaxScrollView";

// Import utility functions for fetching transportation data
import { getAllStops as getAllKmbStops } from "@/util/kmb";
import { getAllStops as getAllMtrStops } from "@/util/mtr";
import { TransportStop, TransportMode } from "@/types/transport-types";
import { calculateDistance } from "@/util/calculateDistance";

// Define type for each step in a journey (walk, bus, or MTR)
type JourneyStep = {
  type: "WALK" | "BUS" | "MTR";
  from: TransportStop;
  to: TransportStop;
  distance?: number;
  duration?: number;
  route?: string;
  company?: string;
};

// Define type for a complete journey, consisting of multiple steps
type Journey = {
  id: string;
  steps: JourneyStep[];
  totalDuration: number;
  totalDistance: number;
};

// Define type for search results with additional display information
type SearchResult = TransportStop & {
  displayName: string;
  company: string;
};

// Main component for route planning functionality
export default function RoutePlanScreen() {
  // Access translation and language functions from context
  const { t, language } = useLanguage();
  // State for input text fields
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  // State for selected origin and destination stops
  const [fromStop, setFromStop] = useState<SearchResult | null>(null);
  const [toStop, setToStop] = useState<SearchResult | null>(null);
  // State for tracking which search field is active
  const [searchingFrom, setSearchingFrom] = useState(false);
  const [searchingTo, setSearchingTo] = useState(false);
  // State for search results and all available stops
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allStops, setAllStops] = useState<SearchResult[]>([]);
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingStops, setLoadingStops] = useState(true);
  // State for journey planning results
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  // State for user's current location functionality
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);

  // Load all stops (KMB and MTR) when the component mounts or language changes
  useEffect(() => {
    const loadAllStops = async () => {
      try {
        setLoadingStops(true);
        const kmbStops = await getAllKmbStops();
        const mtrStops = await getAllMtrStops();

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

  // Handle search input changes and update search results
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

    const query = text.toLowerCase();
    const results = allStops
      .filter(
        (stop) =>
          stop.displayName.toLowerCase().includes(query) ||
          (stop.name_en && stop.name_en.toLowerCase().includes(query)) ||
          (stop.name_tc && stop.name_tc.includes(query))
      )
      .slice(0, 10);

    setSearchResults(results);
  };

  // Handle selection of a stop from search results
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

  // Handle use of current location as the origin
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

  // Handle journey planning based on selected stops or current location
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

  // Find the nearest stop of a specific company to a given location
  const findNearestStop = (
    location: { lat: number; long: number },
    company: string
  ): SearchResult | null => {
    const filteredStops = allStops.filter((stop) => stop.company === company);
    if (filteredStops.length === 0) {
      return null;
    }
    return filteredStops.reduce((nearest, stop) => {
      const distance = calculateDistance(
        location.lat,
        location.long,
        stop.lat,
        stop.long
      );
      if (!nearest || distance < nearest.distance) {
        return { stop, distance };
      }
      return nearest;
    }, null as { stop: SearchResult; distance: number } | null)!.stop;
  };

  // Generate sample journeys based on origin and destination
  const generateSampleJourneys = (from: any, to: SearchResult): Journey[] => {
    const originLocation =
      useCurrentLocation && userLocation
        ? {
            lat: userLocation.coords.latitude,
            long: userLocation.coords.longitude,
          }
        : { lat: from.lat, long: from.long };
    const destinationLocation = { lat: to.lat, long: to.long };

    const isOriginKmb =
      fromStop && fromStop.company === "KMB" && !useCurrentLocation;
    const isOriginMtr =
      fromStop && fromStop.company === "MTR" && !useCurrentLocation;
    const isDestinationKmb = to.company === "KMB";
    const isDestinationMtr = to.company === "MTR";

    const startBusStop = isOriginKmb
      ? fromStop
      : findNearestStop(originLocation, "KMB");
    const endBusStop = isDestinationKmb
      ? to
      : findNearestStop(destinationLocation, "KMB");

    const busJourneySteps: JourneyStep[] = [];
    if (!isOriginKmb && startBusStop) {
      const walkDistance = calculateDistance(
        originLocation.lat,
        originLocation.long,
        startBusStop.lat,
        startBusStop.long
      );
      busJourneySteps.push({
        type: "WALK",
        from: {
          lat: originLocation.lat,
          long: originLocation.long,
          name_en: useCurrentLocation
            ? "Current Location"
            : fromStop?.displayName || "Origin",
          name_tc: useCurrentLocation
            ? "当前位置"
            : fromStop?.displayName || "起点",
          stop: "origin",
          mode: "WALK",
        },
        to: startBusStop,
        distance: Math.round(walkDistance),
        duration: Math.round((walkDistance / 80) * 60),
      });
    }
    if (startBusStop && endBusStop) {
      const busDistance = calculateDistance(
        startBusStop.lat,
        startBusStop.long,
        endBusStop.lat,
        endBusStop.long
      );
      busJourneySteps.push({
        type: "BUS",
        from: startBusStop,
        to: endBusStop,
        route: getRandomRoute("KMB"),
        company: "KMB",
        distance: Math.round(busDistance),
        duration: Math.round((busDistance / 500) * 60),
      });
    }
    if (!isDestinationKmb && endBusStop) {
      const walkDistance = calculateDistance(
        endBusStop.lat,
        endBusStop.long,
        destinationLocation.lat,
        destinationLocation.long
      );
      busJourneySteps.push({
        type: "WALK",
        from: endBusStop,
        to: {
          lat: destinationLocation.lat,
          long: destinationLocation.long,
          name_en: to.displayName,
          name_tc: to.name_tc,
          stop: to.stop,
          mode: to.mode,
        },
        distance: Math.round(walkDistance),
        duration: Math.round((walkDistance / 80) * 60),
      });
    }

    const startMtrStation = isOriginMtr
      ? fromStop
      : findNearestStop(originLocation, "MTR");
    const endMtrStation = isDestinationMtr
      ? to
      : findNearestStop(destinationLocation, "MTR");

    const mtrJourneySteps: JourneyStep[] = [];
    if (!isOriginMtr && startMtrStation) {
      const walkDistance = calculateDistance(
        originLocation.lat,
        originLocation.long,
        startMtrStation.lat,
        startMtrStation.long
      );
      mtrJourneySteps.push({
        type: "WALK",
        from: {
          lat: originLocation.lat,
          long: originLocation.long,
          name_en: useCurrentLocation
            ? "Current Location"
            : fromStop?.displayName || "Origin",
          name_tc: useCurrentLocation
            ? "当前位置"
            : fromStop?.displayName || "起点",
          stop: "origin",
          mode: "WALK",
        },
        to: startMtrStation,
        distance: Math.round(walkDistance),
        duration: Math.round((walkDistance / 80) * 60),
      });
    }
    if (startMtrStation && endMtrStation) {
      const mtrDistance = calculateDistance(
        startMtrStation.lat,
        startMtrStation.long,
        endMtrStation.lat,
        endMtrStation.long
      );
      mtrJourneySteps.push({
        type: "MTR",
        from: startMtrStation,
        to: endMtrStation,
        route: getRandomRoute("MTR"),
        company: "MTR",
        distance: Math.round(mtrDistance),
        duration: Math.round((mtrDistance / 1000) * 60),
      });
    }
    if (!isDestinationMtr && endMtrStation) {
      const walkDistance = calculateDistance(
        endMtrStation.lat,
        endMtrStation.long,
        destinationLocation.lat,
        destinationLocation.long
      );
      mtrJourneySteps.push({
        type: "WALK",
        from: endMtrStation,
        to: {
          lat: destinationLocation.lat,
          long: destinationLocation.long,
          name_en: to.displayName,
          name_tc: to.name_tc,
          stop: to.stop,
          mode: to.mode,
        },
        distance: Math.round(walkDistance),
        duration: Math.round((walkDistance / 80) * 60),
      });
    }

    const midLat = (originLocation.lat + destinationLocation.lat) / 2;
    const midLong = (originLocation.long + destinationLocation.long) / 2;
    const transferMtr = findNearestStop({ lat: midLat, long: midLong }, "MTR");
    const transferBus = transferMtr
      ? findNearestStop(transferMtr, "KMB")
      : null;

    const transferJourneySteps: JourneyStep[] = [];
    if (!isOriginKmb && startBusStop) {
      const walkDistance = calculateDistance(
        originLocation.lat,
        originLocation.long,
        startBusStop.lat,
        startBusStop.long
      );
      transferJourneySteps.push({
        type: "WALK",
        from: {
          lat: originLocation.lat,
          long: originLocation.long,
          name_en: useCurrentLocation
            ? "Current Location"
            : fromStop?.displayName || "Origin",
          name_tc: useCurrentLocation
            ? "当前位置"
            : fromStop?.displayName || "起点",
          stop: "origin",
          mode: "WALK",
        },
        to: startBusStop,
        distance: Math.round(walkDistance),
        duration: Math.round((walkDistance / 80) * 60),
      });
    }
    if (startBusStop && transferBus) {
      const busDistance = calculateDistance(
        startBusStop.lat,
        startBusStop.long,
        transferBus.lat,
        transferBus.long
      );
      transferJourneySteps.push({
        type: "BUS",
        from: startBusStop,
        to: transferBus,
        route: getRandomRoute("KMB"),
        company: "KMB",
        distance: Math.round(busDistance),
        duration: Math.round((busDistance / 500) * 60),
      });
    }
    if (transferBus && transferMtr) {
      const walkDistance = calculateDistance(
        transferBus.lat,
        transferBus.long,
        transferMtr.lat,
        transferMtr.long
      );
      transferJourneySteps.push({
        type: "WALK",
        from: transferBus,
        to: transferMtr,
        distance: Math.round(walkDistance),
        duration: Math.round((walkDistance / 80) * 60),
      });
    }
    if (transferMtr && endMtrStation) {
      const mtrDistance = calculateDistance(
        transferMtr.lat,
        transferMtr.long,
        endMtrStation.lat,
        endMtrStation.long
      );
      transferJourneySteps.push({
        type: "MTR",
        from: transferMtr,
        to: endMtrStation,
        route: getRandomRoute("MTR"),
        company: "MTR",
        distance: Math.round(mtrDistance),
        duration: Math.round((mtrDistance / 1000) * 60),
      });
    }
    if (!isDestinationMtr && endMtrStation) {
      const walkDistance = calculateDistance(
        endMtrStation.lat,
        endMtrStation.long,
        destinationLocation.lat,
        destinationLocation.long
      );
      transferJourneySteps.push({
        type: "WALK",
        from: endMtrStation,
        to: {
          lat: destinationLocation.lat,
          long: destinationLocation.long,
          name_en: to.displayName,
          name_tc: to.name_tc,
          stop: to.stop,
          mode: to.mode,
        },
        distance: Math.round(walkDistance),
        duration: Math.round((walkDistance / 80) * 60),
      });
    }

    const busJourneyTotalDistance = busJourneySteps.reduce(
      (sum, step) => sum + (step.distance || 0),
      0
    );
    const mtrJourneyTotalDistance = mtrJourneySteps.reduce(
      (sum, step) => sum + (step.distance || 0),
      0
    );
    const transferJourneyTotalDistance = transferJourneySteps.reduce(
      (sum, step) => sum + (step.distance || 0),
      0
    );

    return [
      {
        id: "1",
        steps: busJourneySteps,
        totalDuration: 0,
        totalDistance: busJourneyTotalDistance,
      },
      {
        id: "2",
        steps: mtrJourneySteps,
        totalDuration: 0,
        totalDistance: mtrJourneyTotalDistance,
      },
      {
        id: "3",
        steps: transferJourneySteps,
        totalDuration: 0,
        totalDistance: transferJourneyTotalDistance,
      },
    ];
  };

  // Get a random route for a specific company (KMB or MTR)
  const getRandomRoute = (company: string): string => {
    if (company === "KMB") {
      const routes = ["1", "1A", "5", "5C", "6", "7", "9"];
      return routes[Math.floor(Math.random() * routes.length)];
    } else if (company === "MTR") {
      const routes = ["TWL", "ISL", "TKL", "EAL", "SIL"];
      return routes[Math.floor(Math.random() * routes.length)];
    }
    return "";
  };

  // Get the appropriate icon for a transport type
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

  // Get the appropriate color for a transport type
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

  // Format distance in meters to a readable string
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // Navigate to transport details screen based on journey step
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
              if (fromText.trim()) handleSearch(fromText, true);
            }}
          />
          {fromText && (
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
          )}
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
              if (toText.trim()) handleSearch(toText, false);
            }}
          />
          {toText && (
            <TouchableOpacity
              onPress={() => {
                setToText("");
                setToStop(null);
              }}
              style={styles.clearButton}
            >
              <IconSymbol name="xmark.circle.fill" size={20} color="#999999" />
            </TouchableOpacity>
          )}
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

      {!loading && !loadingStops && journeys.length > 0 && (
        <ThemedView style={styles.resultsContainer}>
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
                  {formatDistance(journey.totalDistance)}
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

          {selectedJourney && (
            <ThemedView style={styles.journeyDetails}>
              <ThemedText style={styles.journeySummary}>
                {formatDistance(selectedJourney.totalDistance)}
              </ThemedText>

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
                    <Marker
                      coordinate={{
                        latitude: toStop.lat,
                        longitude: toStop.long,
                      }}
                      title={toStop.displayName}
                      pinColor="red"
                    />
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
  headerImage: {
    color: "#16b79c",
    bottom: -90,
    left: -35,
    position: "absolute",
    opacity: 0.7,
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
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 16, color: "#8B4513" },
  clearButton: { padding: 8 },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 4,
  },
  currentLocationText: { marginLeft: 8, color: "#8B4513", fontWeight: "500" },
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
  planButtonText: { color: "white", fontWeight: "600", fontSize: 16 },
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
  resultIcon: { marginRight: 12 },
  resultTextContainer: { flex: 1 },
  resultText: { fontSize: 16, fontWeight: "500", color: "#8B4513" },
  resultSubtext: { fontSize: 12, opacity: 0.7, marginTop: 2, color: "#8B4513" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#8B4513" },
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
  resultsContainer: { flex: 1 },
  journeyOptions: { padding: 12 },
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
  journeyDuration: { fontSize: 17, fontWeight: "600", color: "#8B4513" },
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
  map: { ...StyleSheet.absoluteFillObject },
  journeyStep: { flexDirection: "row", marginBottom: 20 },
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
  stepMetaText: { fontSize: 14, color: "#8B4513", opacity: 0.7 },
  viewRouteButton: {
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 69, 19, 0.3)",
  },
  viewRouteText: { fontSize: 13, fontWeight: "500", color: "#8B4513" },
});


