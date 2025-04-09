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
// 导入自定义组件和工具
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { MTR_COLORS, MtrStation, getAllRoutes, getAllStops } from "@/util/mtr";

import { TransportRoute } from "@/types/transport-types";
import { useLanguage } from "@/contexts/LanguageContext";

// Main component for displaying MTR line details and stations
// 显示港铁线路详情和车站的主要组件
export default function MtrLineScreen() {
  // Get the line ID from URL parameters
  // 从 URL 参数中获取线路 ID
  const { lineId } = useLocalSearchParams();
  
  // State for tracking loading status
  // 用于跟踪加载状态的状态变量
  const [loading, setLoading] = useState(true);
  
  // State for storing line data information
  // 用于存储线路数据信息的状态变量
  const [lineData, setLineData] = useState<TransportRoute | null>(null);
  
  // State for storing stations on this line
  // 用于存储该线路上车站的状态变量
  const [stations, setStations] = useState<MtrStation[]>([]);
  
  // Reference to the map component for programmatic control
  // 地图组件的引用，用于编程控制
  const mapRef = useRef<MapView | null>(null);
  
  // Get language translation functions and current language setting
  // 获取语言翻译函数和当前语言设置
  const { t, language } = useLanguage();

  // Effect hook to load line data when component mounts or lineId changes
  // 当组件挂载或 lineId 更改时加载线路数据的副作用钩子
  useEffect(() => {
    // Function to fetch and process line data
    // 获取和处理线路数据的函数
    const loadLineData = async () => {
      // Exit early if no line ID is provided
      // 如果没有提供线路 ID，则提前退出
      if (!lineId) return;

      try {
        // Set loading state to show loading indicator
        // 设置加载状态以显示加载指示器
        setLoading(true);

        // Fetch all MTR routes
        // 获取所有港铁路线
        const lines = await getAllRoutes();
        
        // Find the specific line that matches the requested lineId
        // 查找与请求的 lineId 匹配的特定线路
        const line = lines.find((l) => l.route === lineId);

        // If line not found, show error and navigate back
        // 如果找不到线路，显示错误并返回上一页
        if (!line) {
          Alert.alert("Error", "Line not found");
          router.back();
          return;
        }

        // Store the line data in state
        // 将线路数据存储在状态中
        setLineData(line);

        // Fetch all MTR stations
        // 获取所有港铁车站
        const allStations = await getAllStops();
        
        // Filter stations to include only those on the current line
        // 筛选车站，仅包含当前线路上的车站
        const lineStations = allStations.filter((station) =>
          station.line_codes.includes(lineId as string)
        );

        // Store the filtered stations in state
        // 将筛选后的车站存储在状态中
        setStations(lineStations);
      } catch (error) {
        // Handle any errors that occur during data fetching
        // 处理数据获取过程中发生的任何错误
        console.error("Failed to load line data:", error);
        Alert.alert("Error", "Could not load line information");
      } finally {
        // Set loading to false when data fetching is complete (success or failure)
        // 在数据获取完成时（成功或失败）将加载状态设置为 false
        setLoading(false);
      }
    };

    // Immediately invoke the function to load data
    // 立即调用函数加载数据
    loadLineData();
  }, [lineId]); // Re-run this effect if lineId changes // 如果 lineId 更改，则重新运行此效果

  // Function to navigate to a specific station's details
  // 导航到特定车站详情的函数
  const navigateToStation = (stationId: string) => {
    router.push({
      pathname: "/mtr/[stationId]",
      params: { stationId },
    });
  };

  // Function to get the origin station name based on the current language
  // 根据当前语言获取起始站名称的函数
  const getLineOrigin = () => {
    if (!lineData) return "";
    return language === "en" ? lineData.orig_en : lineData.orig_tc;
  };

  // Function to get the destination station name based on the current language
  // 根据当前语言获取终点站名称的函数
  const getLineDestination = () => {
    if (!lineData) return "";
    return language === "en" ? lineData.dest_en : lineData.dest_tc;
  };

  // Function to get the color associated with the current line
  // 获取与当前线路相关联的颜色的函数
  const getLineColor = () => {
    return MTR_COLORS[lineId as keyof typeof MTR_COLORS] || "#666666";
  };

  // Function to get the station name based on the current language
  // 根据当前语言获取车站名称的函数
  const getStationName = (station: MtrStation) => {
    return language === "en"
      ? station.name_en
      : language === "zh-Hans"
      ? station.name_sc || station.name_tc
      : station.name_tc;
  };

  // Function to get the line name based on the current language
  // 根据当前语言获取线路名称的函数
  const getLineName = () => {
    if (!lineData) return `${lineId} Line`;
    return t(`line.${lineId}`);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Configure the screen header with line-specific color */}
      {/* 使用线路特定颜色配置屏幕标题 */}
      <Stack.Screen
        options={{
          title: getLineName(),
          headerTintColor: Platform.OS === "ios" ? getLineColor() : undefined,
        }}
      />

      {/* Show loading indicator while data is being fetched */}
      {/* 数据获取过程中显示加载指示器 */}
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : lineData ? (
        <>
          {/* Line information header section */}
          {/* 线路信息头部区域 */}
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

          {/* Map view showing line and stations (except on web platform) */}
          {/* 显示线路和车站的地图视图（网页平台除外） */}
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
                {/* Line connecting all stations */}
                {/* 连接所有车站的线路 */}
                <Polyline
                  coordinates={stations.map((s) => ({
                    latitude: s.lat,
                    longitude: s.long,
                  }))}
                  strokeColor={getLineColor()}
                  strokeWidth={4}
                />

                {/* Station markers on the map */}
                {/* 地图上的车站标记 */}
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

          {/* Station list section title */}
          {/* 车站列表部分标题 */}
          <ThemedText style={styles.stationsTitle}>
            {t("mtr.station.stations")} ({stations.length})
          </ThemedText>

          {/* Scrollable list of all stations on this line */}
          {/* 此线路上所有车站的可滚动列表 */}
          <FlatList
            data={stations}
            keyExtractor={(item) => item.stop}
            style={styles.stationsList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.stationItem}
                onPress={() => navigateToStation(item.stop)}
              >
                {/* Colored dot indicating the line color */}
                {/* 表示线路颜色的彩色点 */}
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

                  {/* Display interchange line chips for stations connecting multiple lines */}
                  {/* 为连接多条线路的车站显示换乘线路标签 */}
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

                {/* Right chevron indicating the item is clickable */}
                {/* 指示项目可点击的右箭头图标 */}
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

// Styles for the component UI elements
// 组件 UI 元素的样式
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
