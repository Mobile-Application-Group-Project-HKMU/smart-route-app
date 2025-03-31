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
import { router } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { findNearbyStops, type Stop } from "@/util/kmb";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useLanguage } from "@/contexts/LanguageContext";

const { width, height } = Dimensions.get("window");
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);

export default function NearbyScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [nearbyStops, setNearbyStops] = useState<Stop[]>([]);
  const [radius, setRadius] = useState(500); // Default 500m radius
  const mapRef = useRef<MapView | null>(null);
  const { t, language } = useLanguage();

  const fetchNearbyStops = async (
    latitude: number,
    longitude: number,
    searchRadius: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      // This utility can fetch stops for KMB, GMB, CTB, etc.
      const stops = await findNearbyStops(latitude, longitude, searchRadius);
      setNearbyStops(stops);
    } catch (err) {
      setError("Failed to find nearby stops. Please try again.");
      console.error("Error fetching nearby stops:", err);
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Location permission is required to find nearby stops");
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);
      fetchNearbyStops(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        radius
      );
    } catch (err) {
      setError("Failed to get your location. Please try again.");
      console.error("Error getting location:", err);
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    await requestLocationPermission();
  };

  const changeRadius = (newRadius: number) => {
    setRadius(newRadius);
    if (location) {
      fetchNearbyStops(
        location.coords.latitude,
        location.coords.longitude,
        newRadius
      );
    }
  };

  const handleStopPress = (stop: Stop) => {
    router.push(`/stop/${stop.stop}`);
  };

  const goToStop = (stop: Stop) => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: stop.lat,
        longitude: stop.long,
        latitudeDelta: LATITUDE_DELTA / 2,
        longitudeDelta: LONGITUDE_DELTA / 2,
      });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A7C7E7", dark: "#0A3161" }}
        headerImage={
          <IconSymbol
            size={310}
            color="#0A3161"
            name="location.fill"
            style={styles.headerImage}
          />
        }
      >
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">{t("nearby.title")}</ThemedText>
        </ThemedView>
        {location && (
          <View
            style={[
              styles.fixedMapContainer,
              { marginTop: 16, marginBottom: 16 },
            ]}
          >
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
          </View>
        )}

        <ThemedView style={styles.radiusSelector}>
          <TouchableOpacity
            style={[
              styles.radiusButton,
              radius === 250 ? styles.activeRadiusButton : null,
            ]}
            onPress={() => changeRadius(250)}
          >
            <ThemedText style={radius === 250 ? styles.activeRadiusText : null}>
              250m
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
            <ThemedText
              style={radius === 1000 ? styles.activeRadiusText : null}
            >
              1km
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {!location && !error && !loading ? (
          <ThemedView style={styles.initialState}>
            <IconSymbol name="location.fill" size={48} color="#0a7ea4" />
            <ThemedText style={styles.initialText}>
              {t("nearby.tap.instruction")}
            </ThemedText>
            <TouchableOpacity
              style={styles.startButton}
              onPress={requestLocationPermission}
            >
              <ThemedText style={styles.startButtonText}>
                {t("nearby.find.stops")}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : loading ? (
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
            <ThemedText type="subtitle" style={styles.listTitle}>
              {t("nearby.stops.count").replace(
                "{0}",
                nearbyStops.length.toString()
              )}
            </ThemedText>

            {nearbyStops.length === 0 ? (
              <ThemedText style={styles.noStopsText}>
                {t("nearby.no.stops").replace("{0}", radius.toString())}
              </ThemedText>
            ) : (
              <View style={styles.listContainer}>
                <View style={styles.list}>
                  {nearbyStops.map((item) => (
                    <TouchableOpacity
                      key={item.stop}
                      style={styles.stopItem}
                      onPress={() => handleStopPress(item)}
                    >
                      <IconSymbol
                        name="location.fill"
                        size={24}
                        color="#0A3161"
                        style={styles.stopIcon}
                      />
                      <ThemedView style={styles.stopInfo}>
                        <ThemedText style={styles.stopName}>
                          {language === "en"
                            ? item.name_en
                            : language === "zh-Hans"
                            ? item.name_sc
                            : item.name_tc}
                        </ThemedText>
                        <ThemedText style={styles.stopDistance}>
                          {t("nearby.meters.away").replace(
                            "{0}",
                            Math.round(item.distance).toString()
                          )}
                        </ThemedText>
                      </ThemedView>
                      <TouchableOpacity
                        style={styles.mapButton}
                        onPress={() => goToStop(item)}
                      >
                        <IconSymbol name="map.fill" size={20} color="#0a7ea4" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ThemedView>
        )}
      </ParallaxScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedMapContainer: {
    height: 200,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative", // Change from fixed positioning
    zIndex: 1, // Lower z-index
  },

  contentWithMap: {
    paddingTop: 200,
  },
  headerImage: {
    color: "#0A3161",
    bottom: -90,
    left: -35,
    position: "absolute",
    opacity: 0.7,
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  radiusSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 12,
  },
  radiusButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 8,
    backgroundColor: "#f0f0f0",
  },
  activeRadiusButton: {
    backgroundColor: "#0A3161",
  },
  activeRadiusText: {
    color: "white",
  },
  initialState: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  initialText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
  },
  startButton: {
    backgroundColor: "#0A3161",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 16,
  },
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    marginTop: 16,
  },
  mapContainer: {
    display: "none",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loader: {
    marginTop: 20,
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffefef",
    borderRadius: 12,
    marginTop: 20,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 16,
    color: "#c00",
  },
  retryButton: {
    backgroundColor: "#0A3161",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  listTitle: {
    marginBottom: 12,
  },
  listContainer: {
    flex: 1,
  },
  noStopsText: {
    textAlign: "center",
    marginTop: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 120,
  },
  stopItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  stopIcon: {
    marginRight: 12,
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
  mapButton: {
    padding: 8,
  },
});
