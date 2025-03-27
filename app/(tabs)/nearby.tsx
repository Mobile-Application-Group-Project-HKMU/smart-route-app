import { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  View,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { findNearbyStops, type Stop } from "@/util/kmb";

const { width, height } = Dimensions.get("window");
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);

export default function NearbyScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [nearbyStops, setNearbyStops] = useState<
    Array<Stop & { distance: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(500); // Default radius in meters
  const mapRef = useRef<MapView>(null);

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Permission to access location was denied");
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);
      await fetchNearbyStops(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
    } catch (err) {
      console.error("Error getting location:", err);
      setError("Failed to get your location");
      setLoading(false);
    }
  };

  const fetchNearbyStops = async (latitude: number, longitude: number) => {
    try {
      const stops = await findNearbyStops(latitude, longitude, radius);
      setNearbyStops(stops);
      setLoading(false);

      // Fit map to show all markers
      if (stops.length > 0 && mapRef.current) {
        mapRef.current.fitToCoordinates(
          stops.map((stop) => ({ latitude: stop.lat, longitude: stop.long })),
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          }
        );
      }
    } catch (err) {
      console.error("Error finding nearby stops:", err);
      setError("Failed to find nearby stops");
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const refreshLocation = () => {
    setLoading(true);
    requestLocationPermission();
  };

  const handleStopPress = (stop: Stop) => {
    router.push(`/stop/${stop.stop}`);
  };

  const changeRadius = (newRadius: number) => {
    setRadius(newRadius);
    setLoading(true);
    if (location) {
      fetchNearbyStops(location.coords.latitude, location.coords.longitude);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Nearby Stops</ThemedText>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshLocation}
          disabled={loading}
        >
          <IconSymbol name="location.circle.fill" size={28} color="#0a7ea4" />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.radiusSelector}>
        <ThemedText>Distance: </ThemedText>
        <TouchableOpacity
          style={[
            styles.radiusButton,
            radius === 300 ? styles.activeRadiusButton : null,
          ]}
          onPress={() => changeRadius(300)}
        >
          <ThemedText style={radius === 300 ? styles.activeRadiusText : null}>
            300m
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.radiusButton,
            radius === 500 ? styles.activeRadiusButton : null,
          ]}
          onPress={() => changeRadius(500)}
        >
          <ThemedText style={radius === 500 ? styles.activeRadiusText : null}>
            500m
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.radiusButton,
            radius === 1000 ? styles.activeRadiusButton : null,
          ]}
          onPress={() => changeRadius(1000)}
        >
          <ThemedText style={radius === 1000 ? styles.activeRadiusText : null}>
            1km
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : error ? (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refreshLocation}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <ThemedView style={styles.content}>
          {location && (
            <MapView
              ref={mapRef}
              style={styles.map}
              // Only use PROVIDER_GOOGLE on Android
              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              }}
            >
              {/* User location marker */}
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                pinColor="blue"
                title="Your Location"
              />

              {/* Bus stop markers */}
              {nearbyStops.map((stop) => (
                <Marker
                  key={stop.stop}
                  coordinate={{ latitude: stop.lat, longitude: stop.long }}
                  title={stop.name_en}
                  description={`${Math.round(stop.distance)}m away`}
                  onCalloutPress={() => handleStopPress(stop)}
                />
              ))}
            </MapView>
          )}

          <ThemedView style={styles.listContainer}>
            <ThemedText type="subtitle" style={styles.listTitle}>
              Nearby Stops ({nearbyStops.length})
            </ThemedText>

            {nearbyStops.length === 0 ? (
              <ThemedText style={styles.noStopsText}>
                No bus stops found within {radius}m of your location
              </ThemedText>
            ) : (
              <FlatList
                data={nearbyStops}
                keyExtractor={(item) => item.stop}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.stopItem}
                    onPress={() => handleStopPress(item)}
                  >
                    <IconSymbol
                      name="location.fill"
                      size={24}
                      color="#8B4513"
                      style={styles.stopIcon}
                    />
                    <ThemedView style={styles.stopInfo}>
                      <ThemedText style={styles.stopName}>
                        {item.name_en}
                      </ThemedText>
                      <ThemedText style={styles.stopDistance}>
                        {Math.round(item.distance)}m away
                      </ThemedText>
                    </ThemedView>
                    <IconSymbol
                      name="chevron.right"
                      size={20}
                      color="#808080"
                    />
                  </TouchableOpacity>
                )}
                style={styles.stopsList}
              />
            )}
          </ThemedView>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
  },
  radiusSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  radiusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: "#f0f0f0",
  },
  activeRadiusButton: {
    backgroundColor: "#0a7ea4",
  },
  activeRadiusText: {
    color: "white",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#0a7ea4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  map: {
    height: "40%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    marginBottom: 12,
  },
  noStopsText: {
    textAlign: "center",
    marginTop: 20,
    opacity: 0.7,
  },
  stopsList: {
    flex: 1,
  },
  stopItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  stopIcon: {
    marginRight: 16,
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: "500",
  },
  stopDistance: {
    fontSize: 14,
    opacity: 0.7,
  },
});
