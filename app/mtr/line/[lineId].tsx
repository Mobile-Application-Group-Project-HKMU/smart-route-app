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
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

// Import custom components and utilities
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { MTR_COLORS, MtrStation, getAllRoutes, getAllStops } from "@/util/mtr";

import { TransportRoute } from "@/types/transport-types";
import { useLanguage } from "@/contexts/LanguageContext";

// Main component for displaying MTR line details and stations
export default function MtrLineScreen() {
  // Get the line ID from URL parameters
  const { lineId } = useLocalSearchParams();
  // State for tracking loading status
  const [loading, setLoading] = useState(true);
  // State for storing line data information
  const [lineData, setLineData] = useState<TransportRoute | null>(null);
  // State for storing stations on this line
  const [stations, setStations] = useState<MtrStation[]>([]);
  // Reference to the map component for programmatic control
  const mapRef = useRef<MapView | null>(null);
  // Get language translation functions and current language setting
  const { t, language } = useLanguage();

  // Effect hook to load line data when component mounts or lineId changes
  useEffect(() => {
    // Function to fetch and process line data
    const loadLineData = async () => {
      // Exit early if no line ID is provided
      if (!lineId) return;

      try {
        // Set loading state to show loading indicator
        setLoading(true);

        // Fetch all MTR routes
        const lines = await getAllRoutes();
        // Find the specific line that matches the requested lineId
        const line = lines.find((l) => l.route === lineId);

        // If line not found, show error and navigate back
        if (!line) {
          Alert.alert("Error", "Line not found");
          router.back();
          return;
        }

        // Store the line data in state
        setLineData(line);

        // Fetch all MTR stations
        const allStations = await getAllStops();
        // Filter stations to include only those on the current line
        const lineStations = allStations.filter((station) =>
          station.line_codes.includes(lineId as string)
        );

        // Store the filtered stations in state
        setStations(lineStations);
      } catch (error) {
        // Handle any errors that occur during data fetching
        console.error("Failed to load line data:", error);
        Alert.alert("Error", "Could not load line information");
      } finally {
        // Set loading to false when data fetching is complete (success or failure)
        setLoading(false);
      }
    };

    // Immediately invoke the function to load data
    loadLineData();
  }, [lineId]); // Re-run this effect if lineId changes

  // Function to navigate to a specific station's details
  const navigateToStation = (stationId: string) => {
    router.push({
      pathname: "/mtr/[stationId]",
      params: { stationId },
    });
  };

  // Function to get the origin station name based on the current language
  const getLineOrigin = () => {
    if (!lineData) return "";
    return language === "en" ? lineData.orig_en : lineData.orig_tc;
  };

  // Function to get the destination station name based on the current language
  const getLineDestination = () => {
    if (!lineData) return "";
    return language === "en" ? lineData.dest_en : lineData.dest_tc;
  };

  // Function to get the color associated with the current line
  const getLineColor = () => {
    return MTR_COLORS[lineId as keyof typeof MTR_COLORS] || "#666666";
  };

  // Function to get the station name based on the current language
  const getStationName = (station: MtrStation) => {
    return language === "en"
      ? station.name_en
      : language === "zh-Hans"
      ? station.name_sc || station.name_tc
      : station.name_tc;
  };

  // Function to get the line name based on the current language
  const getLineName = () => {
    if (!lineData) return `${lineId} Line`;
    return t(`line.${lineId}`);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: getLineName(),
          headerTintColor: Platform.OS === "ios" ? getLineColor() : undefined,
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : lineData ? (
        <>
          <ThemedView style={styles.lineHeader}>
            <ThemedView
              style={[styles.lineChip, { backgroundColor: getLineColor() }]}
            >
              <ThemedText style={styles.lineCode}>{lineId}</ThemedText>
            </ThemedView>

            <ThemedText style={styles.lineName}>{getLineName()}</ThemedText>

            <ThemedText style={styles.lineRoute}>
              {getLineOrigin()} → {getLineDestination()}
            </ThemedText>
          </ThemedView>

          {Platform.OS !== "web" && stations.length > 0 && (
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={
                  Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                }
                initialRegion={{
                  latitude: stations[0].lat,
                  longitude: stations[0].long,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }}
              >
                <Polyline
                  coordinates={stations.map((s) => ({
                    latitude: s.lat,
                    longitude: s.long,
                  }))}
                  strokeColor={getLineColor()}
                  strokeWidth={4}
                />

                {stations.map((station) => (
                  <Marker
                    key={station.stop}
                    coordinate={{
                      latitude: station.lat,
                      longitude: station.long,
                    }}
                    title={station.name_en}
                    pinColor={
                      station.is_interchange ? "#FF9800" : getLineColor()
                    }
                    onCalloutPress={() => navigateToStation(station.stop)}
                  />
                ))}
              </MapView>
            </View>
          )}

          <ThemedText style={styles.stationsTitle}>
            {t("mtr.station.stations")} ({stations.length})
          </ThemedText>

          <FlatList
            data={stations}
            keyExtractor={(item) => item.stop}
            style={styles.stationsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.stationItem}
                onPress={() => navigateToStation(item.stop)}
              >
                <ThemedView
                  style={[
                    styles.stationDot,
                    { backgroundColor: getLineColor() },
                  ]}
                />
                <ThemedView style={styles.stationContent}>
                  <ThemedText style={styles.stationName}>
                    {getStationName(item)}
                  </ThemedText>

                  <ThemedText style={styles.stationId}>{item.stop}</ThemedText>

                  {item.is_interchange && (
                    <ThemedView style={styles.interchangeChips}>
                      {item.line_codes
                        .filter((l) => l !== lineId)
                        .map((line) => (
                          <ThemedView
                            key={line}
                            style={[
                              styles.miniLineChip,
                              {
                                backgroundColor:
                                  MTR_COLORS[line as keyof typeof MTR_COLORS] ||
                                  "#666666",
                              },
                            ]}
                          >
                            <ThemedText style={styles.miniLineCode}>
                              {line}
                            </ThemedText>
                          </ThemedView>
                        ))}
                    </ThemedView>
                  )}
                </ThemedView>

                <IconSymbol name="chevron.right" size={20} color="#808080" />
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <ThemedText style={styles.errorText}>
          {t("error.line.not.found")}
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
  lineHeader: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  lineChip: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 10,
  },
  lineCode: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  lineName: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 8,
    textAlign: "center",
  },
  lineRoute: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  stationsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
  },
  stationsList: {
    flex: 1,
  },
  stationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 8,
  },
  stationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  stationContent: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "500",
  },
  stationId: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  interchangeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  miniLineChip: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  miniLineCode: {
    color: "white",
    fontWeight: "bold",
    fontSize: 10,
  },
  errorText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    opacity: 0.7,
  },
});
