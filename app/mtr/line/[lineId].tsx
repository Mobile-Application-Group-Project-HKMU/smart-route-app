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

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { MTR_COLORS, MtrStation, getAllRoutes, getAllStops } from "@/util/mtr";

import { TransportRoute } from "@/types/transport-types";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MtrLineScreen() {
  const { lineId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [lineData, setLineData] = useState<TransportRoute | null>(null);
  const [stations, setStations] = useState<MtrStation[]>([]);
  const mapRef = useRef<MapView | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    const loadLineData = async () => {
      if (!lineId) return;

      try {
        setLoading(true);

        // Fetch line details
        const lines = await getAllRoutes();
        const line = lines.find((l) => l.route === lineId);

        if (!line) {
          Alert.alert("Error", "Line not found");
          router.back();
          return;
        }

        setLineData(line);

        // Fetch stations on this line
        const allStations = await getAllStops();
        const lineStations = allStations.filter((station) =>
          station.line_codes.includes(lineId as string)
        );

        // Sort stations by sequence (this is a placeholder - in a real app,
        // you'd need actual sequence data from the API)
        setStations(lineStations);
      } catch (error) {
        console.error("Failed to load line data:", error);
        Alert.alert("Error", "Could not load line information");
      } finally {
        setLoading(false);
      }
    };

    loadLineData();
  }, [lineId]);

  // Navigate to station details
  const navigateToStation = (stationId: string) => {
    router.push({
      pathname: "/mtr/[stationId]",
      params: { stationId },
    });
  };

  // Get origin and destination names based on language
  const getLineOrigin = () => {
    if (!lineData) return "";
    return language === "en" ? lineData.orig_en : lineData.orig_tc;
  };

  const getLineDestination = () => {
    if (!lineData) return "";
    return language === "en" ? lineData.dest_en : lineData.dest_tc;
  };

  // Get the color for the current line
  const getLineColor = () => {
    return MTR_COLORS[lineId as keyof typeof MTR_COLORS] || "#666666";
  };

  // Get station name based on language
  const getStationName = (station: MtrStation) => {
    return language === "en"
      ? station.name_en
      : language === "zh-Hans"
      ? station.name_sc || station.name_tc
      : station.name_tc;
  };

  // Get the line name based on the language
  const getLineName = () => {
    if (!lineData) return `${lineId} Line`;

    // Use the translation system
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
          {/* Line information header */}
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

          {/* Map view - only on native platforms */}
          {Platform.OS !== "web" && stations.length > 0 && (
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={
                  Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                }
                initialRegion={{
                  // Center the map on the first station
                  latitude: stations[0].lat,
                  longitude: stations[0].long,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }}
              >
                {/* Line connecting all stations */}
                <Polyline
                  coordinates={stations.map((s) => ({
                    latitude: s.lat,
                    longitude: s.long,
                  }))}
                  strokeColor={getLineColor()}
                  strokeWidth={4}
                />

                {/* Station markers */}
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

          {/* Stations list */}
          <ThemedText style={styles.stationsTitle}>
            {t("transport.line.stations")} ({stations.length})
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
