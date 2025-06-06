// Import necessary React and React Native components
import { useState, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

// Import custom components and utilities
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { findNearbyStops } from "@/util/kmb";
import { findNearbyStops as findNearbyMtrStops } from "@/util/mtr";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useLanguage } from "@/contexts/LanguageContext";

// Define map display constants based on screen dimensions
const { width, height } = Dimensions.get("window");
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);

// Define a unified type for all transit stops (both KMB bus and MTR)
type CombinedStop = {
  stop: string;         // Stop ID
  name_en: string;      // English name
  name_tc: string;      // Traditional Chinese name
  name_sc: string;      // Simplified Chinese name
  lat: number;          // Latitude coordinate
  long: number;         // Longitude coordinate
  distance: number;     // Distance from user in meters
  company: string;      // Transit company
  type: "KMB" | "MTR";  // Type of transit
};

export default function NearbyScreen() {
  // State for managing loading status and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // State for storing user's current location
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  // State for storing nearby transit stops
  const [nearbyStops, setNearbyStops] = useState<CombinedStop[]>([]);
  // State for managing search radius (default: 500m)
  const [radius, setRadius] = useState(500);
  // States for filtering transit types (MTR and Bus)
  // 用于筛选交通类型的状态（地铁和巴士）
  const [showMTR, setShowMTR] = useState(true);
  const [showBus, setShowBus] = useState(true);
  // Reference to the map component for programmatic control
  // 地图组件的引用，用于编程控制地图
  const mapRef = useRef<MapView | null>(null);
  // Get translation function and current language from language context
  // 从语言上下文中获取翻译函数和当前语言设置
  const { t, language } = useLanguage();

  // Function to fetch nearby transit stops from both KMB and MTR APIs
  // 从九巴(KMB)和港铁(MTR)API获取附近站点的函数
  const fetchNearbyStops = async (
    latitude: number,     // 纬度
    longitude: number,    // 经度
    searchRadius: number  // 搜索半径（米）
  ) => {
    try {
      // Set loading state and clear any previous errors
      // 设置加载状态并清除之前的错误信息
      setLoading(true);
      setError(null);

      // Fetch KMB bus stops within the specified radius
      // 获取指定半径内的九巴巴士站
      const kmbStops = await findNearbyStops(latitude, longitude, searchRadius);
      
      // Format KMB stops to match the CombinedStop type
      // 将九巴站点格式化为统一的CombinedStop类型
      const kmbFormatted: CombinedStop[] = kmbStops.map((stop) => ({
        ...stop,
        type: "KMB",
        company: "KMB",
      }));

      // Fetch MTR stations within the specified radius
      // 获取指定半径内的港铁站
      const mtrStations = await findNearbyMtrStops(
        latitude,
        longitude,
        searchRadius
      );
      
      // Format MTR stations to match the CombinedStop type
      // 将港铁站点格式化为统一的CombinedStop类型
      const mtrFormatted: CombinedStop[] = mtrStations.map((station) => ({
        stop: station.stop,
        name_en: station.name_en,
        name_tc: station.name_tc,
        name_sc: station.name_sc || station.name_tc, // Fallback to TC if SC not available 如果没有简体中文则使用繁体中文
        lat: station.lat,
        long: station.long,
        distance: station.distance,
        company: "MTR",
        type: "MTR",
      }));

      // Combine and sort stops by distance from user location
      // 合并并按照距离用户的远近排序所有站点
      const combined = [...kmbFormatted, ...mtrFormatted].sort(
        (a, b) => a.distance - b.distance
      );
      setNearbyStops(combined);
    } catch (err) {
      // Handle errors when fetching stops
      // 处理获取站点时的错误
      setError("Failed to find nearby stops. Please try again.");
      console.error("Error fetching nearby stops:", err);
    } finally {
      // Reset loading state regardless of success or failure
      // 无论成功或失败都重置加载状态
      setLoading(false);
    }
  };

  // Function to request location permission and get current location
  // 请求位置权限并获取当前位置的函数
  const requestLocationPermission = async () => {
    try {
      // Set loading state and clear any previous errors
      // 设置加载状态并清除之前的错误信息
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

  // Function to refresh location and fetch nearby stops
  const refreshLocation = async () => {
    await requestLocationPermission();
  };

  // Function to change search radius and fetch nearby stops
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

  // Function to handle stop press and navigate to stop details
  const handleStopPress = (stop: CombinedStop) => {
    if (stop.type === "MTR") {
      router.push({
        pathname: "/mtr/[stationId]",
        params: { stationId: stop.stop },
      });
    } else {
      router.push({
        pathname: "/stop/[stopId]",
        params: { stopId: stop.stop },
      });
    }
  };

  // Function to animate map to a specific stop
  const goToStop = (stop: CombinedStop) => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion({
        latitude: stop.lat,
        longitude: stop.long,
        latitudeDelta: LATITUDE_DELTA / 2,
        longitudeDelta: LONGITUDE_DELTA / 2,
      });
    }
  };

  // Filter stops based on selected transit types
  const filteredStops = nearbyStops.filter(
    (stop) =>
      (showMTR && stop.type === "MTR") || (showBus && stop.type === "KMB")
  );

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

              provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              }}
            >

              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                pinColor="blue"
                title="Your Location"
              />


              {filteredStops.map((stop) => (
                <Marker
                  key={`${stop.type}-${stop.stop}`}
                  coordinate={{ latitude: stop.lat, longitude: stop.long }}
                  title={stop.name_en}
                  description={`${Math.round(stop.distance)}m away`}
                  pinColor={stop.type === "MTR" ? "#0075C2" : "#B5A45D"}
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


        <ThemedView style={styles.transportFilter}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              showBus ? styles.activeFilterButton : styles.inactiveFilterButton,
            ]}
            onPress={() => setShowBus(!showBus)}
          >
            <IconSymbol
              name="bus.fill"
              size={16}
              color={showBus ? "white" : "#666"}
            />
            <ThemedText
              style={
                showBus ? styles.activeFilterText : styles.inactiveFilterText
              }
            >
              {t("nearby.filter.bus")}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              showMTR ? styles.activeFilterButton : styles.inactiveFilterButton,
            ]}
            onPress={() => setShowMTR(!showMTR)}
          >
            <IconSymbol
              name="tram.fill"
              size={16}
              color={showMTR ? "white" : "#666"}
            />
            <ThemedText
              style={
                showMTR ? styles.activeFilterText : styles.inactiveFilterText
              }
            >
              {t("nearby.filter.mtr")}
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
                filteredStops.length.toString()
              )}
            </ThemedText>

            {filteredStops.length === 0 ? (
              <ThemedText style={styles.noStopsText}>
                {t("nearby.no.stops").replace("{0}", radius.toString())}
              </ThemedText>
            ) : (
              <View style={styles.listContainer}>
                <View style={styles.list}>
                  {filteredStops.map((item) => (
                    <TouchableOpacity
                      key={`${item.type}-${item.stop}`}
                      style={[
                        styles.stopItem,
                        item.type === "MTR" ? styles.mtrItem : {},
                      ]}
                      onPress={() => handleStopPress(item)}
                    >
                      <IconSymbol
                        name={item.type === "MTR" ? "tram.fill" : "bus.fill"}
                        size={24}
                        color={item.type === "MTR" ? "#0A3161" : "#B5A45D"}
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
                          )}{" "}
                          • {item.type}
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
    position: "relative", 
    zIndex: 1, 
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
  transportFilter: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
    gap: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: "#0A3161",
  },
  inactiveFilterButton: {
    backgroundColor: "#e0e0e0",
  },
  activeFilterText: {
    color: "white",
    fontWeight: "500",
  },
  inactiveFilterText: {
    color: "#666",
  },
  mtrItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#0075C2",
  },
});
