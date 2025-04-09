// Import necessary dependencies from libraries
// 导入必要的库依赖
import { useLocalSearchParams, Stack, router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

// Import custom components
// 导入自定义组件
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { CrowdIndicator } from '@/components/CrowdIndicator';
// Import utility functions for KMB data handling
// 导入处理九巴数据的工具函数
import {
  classifyStopETAs,
  getAllStops,
  type ClassifiedETA,
  type Stop,
} from "@/util/kmb";
// Import datetime formatting utility
// 导入日期时间格式化工具
import { formatTransportTime } from "@/util/datetime";
// Import favorites functionality
// 导入收藏夹功能
import {
  FavRouteStation,
  saveToLocalStorage,
  getFromLocalStorage,
} from "@/util/favourite";
// Import language context for localization
// 导入语言上下文用于本地化
import { useLanguage } from "@/contexts/LanguageContext";
// Import crowd prediction utility
// 导入人流预测工具
import { predictCrowdLevel } from '@/util/crowdPrediction';
// Import settings storage utility
// 导入设置存储工具
import { getSettings } from '@/util/settingsStorage';

/**
 * StopETAScreen Component
 * 巴士站到达时间屏幕组件
 * 
 * This screen displays information about a bus stop and the estimated arrival times
 * for buses that service this stop. It includes a map showing the stop location,
 * favorite functionality, and navigation options.
 * 
 * 此屏幕显示有关巴士站的信息和服务该站点的巴士的预计到达时间。
 * 它包括显示站点位置的地图、收藏功能和导航选项。
 */
export default function StopETAScreen() {
  // Get language context for translations
  // 获取语言上下文用于翻译
  const { t, language } = useLanguage();
  // Get stop ID from route parameters
  // 从路由参数中获取站点ID
  const { stopId } = useLocalSearchParams();
  // State for storing estimated arrival times
  // 用于存储预计到达时间的状态
  const [etas, setEtas] = useState<ClassifiedETA[]>([]);
  // State for storing bus stop information
  // 用于存储巴士站信息的状态
  const [stopInfo, setStopInfo] = useState<Stop | null>(null);
  // Loading states
  // 加载状态
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // State to track if this stop is in favorites
  // 用于跟踪此站点是否在收藏夹中的状态
  const [isFavorite, setIsFavorite] = useState(false);
  // State to control whether crowd predictions are shown
  // 用于控制是否显示人流预测的状态
  const [showCrowdPredictions, setShowCrowdPredictions] = useState(true);


  /**
   * Check if the current stop is in the user's favorites
   * This runs when the component mounts or when the stopId changes
   * 
   * 检查当前站点是否在用户的收藏夹中
   * 当组件挂载或stopId更改时运行
   */
  useEffect(() => {
    const checkFavorite = async () => {
      const favorites = (await getFromLocalStorage(
        "stationFavorites"
      )) as FavRouteStation | null;
      if (favorites && favorites.stationID.includes(stopId as string)) {
        setIsFavorite(true);
      }
    };

    checkFavorite();
  }, [stopId]);

  /**
   * Fetch detailed information about the current bus stop
   * This retrieves data like name, coordinates, etc.
   * 
   * 获取有关当前巴士站的详细信息
   * 这会检索名称、坐标等数据
   */
  useEffect(() => {
    const fetchStopInfo = async () => {
      try {
        const allStops = await getAllStops();
        const stop = allStops.find((s) => s.stop === stopId);
        if (stop) {
          setStopInfo(stop);
        }
      } catch (error) {
        console.error("Failed to fetch stop info:", error);
      }
    };

    fetchStopInfo();
  }, [stopId]);

  /**
   * Fetch estimated arrival times (ETAs) for buses at the current stop
   * This runs when the component gains focus or when the stopId changes
   * 
   * 获取当前站点的巴士预计到达时间(ETAs)
   * 当组件获得焦点或stopId更改时运行
   */
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchETAs = async () => {
        try {
          setLoading(true);
          const stopETAs = await classifyStopETAs(stopId as string);

          if (isMounted) {
            setEtas(stopETAs);
            setLoading(false);
          }
        } catch (error) {
          console.error("Failed to fetch ETAs:", error);
          if (isMounted) {
            setLoading(false);
            Alert.alert(t("error.generic"), t("error.load.arrival.times"));
          }
        }
      };

      fetchETAs();

      return () => {
        isMounted = false;
      };
    }, [stopId])
  );

  /**
   * Refresh the estimated arrival times (ETAs) for buses at the current stop
   * 
   * 刷新当前站点的巴士预计到达时间(ETAs)
   */
  const refreshETAs = async () => {
    try {
      setRefreshing(true);
      const stopETAs = await classifyStopETAs(stopId as string);
      setEtas(stopETAs);
    } catch (error) {
      console.error("Failed to refresh ETAs:", error);
      Alert.alert(t("error.generic"), t("error.refresh.arrival.times"));
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Toggle the current stop as a favorite
   * Adds or removes the stop from the user's favorites list
   * 
   * 将当前站点切换为收藏
   * 从用户的收藏夹列表中添加或删除站点
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
        // Remove from favorites
        // 从收藏夹中移除
        favorites.stationID = favorites.stationID.filter((id) => id !== stopId);
      } else {
        // Add to favorites
        // 添加到收藏夹
        favorites.stationID.push(stopId as string);
      }

      await saveToLocalStorage("stationFavorites", favorites);
      setIsFavorite(!isFavorite);

      Alert.alert(
        t(isFavorite ? "favorites.remove" : "favorites.add"),
        t(
          isFavorite
            ? "favorites.remove.description"
            : "favorites.add.description"
        )
      );
    } catch (error) {
      console.error("Error updating favorites:", error);
      Alert.alert(t("error.generic"), t("error.update.favorites"));
    }
  };

  /**
   * Open navigation to the current stop using the device's map application
   * 
   * 使用设备的地图应用程序打开到当前站点的导航
   */
  const openNavigation = () => {
    if (!stopInfo) return;

    const { lat, long } = stopInfo;
    const label = encodeURI(
      language === "en"
        ? stopInfo.name_en
        : language === "zh-Hans"
        ? stopInfo.name_sc
        : stopInfo.name_tc
    );

    let url = "";
    if (Platform.OS === "ios") {
      // Use Apple Maps for iOS
      // 在iOS上使用Apple地图
      url = `maps:?q=${label}&ll=${lat},${long}`;
    } else {
      // Use Google Maps for Android
      // 在Android上使用Google地图
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
   * Navigate to the route details screen for a specific bus route
   * 
   * 导航到特定巴士路线的路线详情屏幕
   * 
   * @param routeId - The ID of the bus route (巴士路线ID)
   * @param bound - The direction of the route (Inbound/Outbound) (路线方向：入站/出站)
   * @param serviceType - The type of service for the route (路线的服务类型)
   */
  const navigateToRoute = (
    routeId: string,
    bound: string,
    serviceType: string
  ) => {
    router.push(`/bus/${routeId}?bound=${bound}&serviceType=${serviceType}`);
  };

  /**
   * Load user settings on component mount
   * 
   * 在组件挂载时加载用户设置
   */
  useEffect(() => {
    // Load settings
    // 加载设置
    const loadSettings = async () => {
      const settings = await getSettings();
      setShowCrowdPredictions(settings.showCrowdPredictions);
    };
    
    loadSettings();
  }, []);

  /**
   * Render the ETA card for a specific route
   * 
   * 渲染特定路线的ETA卡片
   * 
   * @param eta - The ETA data for a route (路线的ETA数据)
   * @param index - The index in the list (列表中的索引)
   */
  const renderETA = (eta: ClassifiedETA, index: number) => {
    return (
      <ThemedView key={index} style={styles.etaCard}>
        <ThemedView style={styles.routeHeader}>
          <ThemedView style={styles.routeNumberContainer}>
            <ThemedText style={styles.routeNumber}>{eta.route}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.routeInfo}>
            <ThemedText style={styles.destination}>
              {language === "en" ? eta.destination_en : eta.destination_tc}
            </ThemedText>
            <TouchableOpacity
              style={styles.viewRouteButton}
              onPress={() => navigateToRoute(
                eta.route,
                eta.direction === "Inbound" ? "I" : "O",
                eta.serviceType
              )}
            >
              <ThemedText style={styles.viewRouteText}>
                {t("viewRoute")}
              </ThemedText>
              <IconSymbol
                name="arrow.right.circle"
                size={16}
                color="#8B4513"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.etaList}>
          {eta.etas.map((etaItem, etaIndex) => {
            const formattedTime = etaItem.eta !== null 
              ? formatTransportTime(etaItem.eta, language)
              : t("stop.no.data");
            
            // Generate crowd prediction for this ETA
            // 为此ETA生成人流预测
            const crowdPrediction = showCrowdPredictions && etaItem.eta !== null ? 
              predictCrowdLevel(eta.route, stopId as string, new Date(etaItem.eta)) : 
              null;
              
            return (
              <ThemedView key={etaIndex} style={styles.etaItem}>
                <ThemedText
                  style={[
                    styles.etaTime,
                    etaItem.eta === null ? { color: "#999" } : null,
                  ]}
                >
                  {formattedTime}
                </ThemedText>
                
                {etaItem.rmk_en && (
                  <ThemedText style={styles.etaRemark}>
                    {language === "en" ? etaItem.rmk_en : etaItem.rmk_tc}
                  </ThemedText>
                )}
                
                {/* Add crowd indicator - 添加人流指示器 */}
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
          title: stopInfo
            ? language === "en"
              ? stopInfo.name_en
              : language === "zh-Hans"
              ? stopInfo.name_sc
              : stopInfo.name_tc
            : t("stop.title"),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={refreshETAs}
                style={styles.refreshButton}
              >
                <IconSymbol name="arrow.clockwise" size={24} color="#808080" />
              </TouchableOpacity>
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
          {/* Stop header section - 站点头部部分 */}
          <ThemedView style={styles.stopHeader}>
            <ThemedText type="title" style={styles.stopName}>
              {language === "en"
                ? stopInfo?.name_en || t("stop.title")
                : language === "zh-Hans"
                ? stopInfo?.name_sc || t("stop.title")
                : stopInfo?.name_tc || t("stop.title")}
            </ThemedText>
            <ThemedText style={styles.stopId}>
              {t("stop.id")}: {stopId}
            </ThemedText>
          </ThemedView>

          {/* Map showing stop location - 显示站点位置的地图 */}
          {stopInfo && (
            <ThemedView style={styles.mapContainer}>
              <MapView
                provider={
                  Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                }
                style={styles.map}
                initialRegion={{
                  latitude: stopInfo.lat,
                  longitude: stopInfo.long,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: stopInfo.lat,
                    longitude: stopInfo.long,
                  }}
                  title={
                    language === "en"
                      ? stopInfo.name_en
                      : language === "zh-Hans"
                      ? stopInfo.name_sc
                      : stopInfo.name_tc
                  }
                />
              </MapView>
              {/* Navigation button to open maps app - 打开地图应用的导航按钮 */}
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
            </ThemedView>
          )}

          {/* Refreshing indicator - 刷新指示器 */}
          {refreshing && (
            <ActivityIndicator
              size="small"
              style={styles.refreshingIndicator}
            />
          )}

          <ThemedText type="subtitle" style={styles.arrivalsTitle}>
            {t("stop.arrivals")}
          </ThemedText>

          {/* No ETAs message or list of ETAs - 无到达时间信息或到达时间列表 */}
          {etas.length === 0 ? (
            <ThemedView style={styles.noETAs}>
              <ThemedText style={styles.noETAsText}>
                {t("stop.no.arrivals")}
              </ThemedText>
            </ThemedView>
          ) : (
            <FlatList
              data={etas}
              keyExtractor={(item) =>
                `${item.route}-${item.direction}-${item.serviceType}`
              }
              renderItem={({ item }) => (
                <ThemedView style={styles.etaCard}>
                  {/* Route header with route number and destination - 路线头部，包含路线号码和目的地 */}
                  <TouchableOpacity
                    onPress={() =>
                      navigateToRoute(
                        item.route,
                        item.direction === "Inbound" ? "I" : "O",
                        item.serviceType
                      )
                    }
                    style={styles.routeHeader}
                  >
                    <ThemedView style={styles.routeNumberContainer}>
                      <ThemedText style={styles.routeNumber}>
                        {item.route}
                      </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.routeInfo}>
                      <ThemedText style={styles.destination}>
                        {language === "en"
                          ? item.destination_en
                          : item.destination_tc}
                      </ThemedText>
                      <ThemedText style={styles.directionText}>
                        {t(
                          item.direction === "Inbound"
                            ? "stop.direction.inbound"
                            : "stop.direction.outbound"
                        )}{" "}
                        •{t("stop.service.type")}: {item.serviceType}
                      </ThemedText>
                      <ThemedView style={styles.viewRouteButton}>
                        <IconSymbol
                          name="arrow.right.circle"
                          size={14}
                          color="#0a7ea4"
                        />
                        <ThemedText style={styles.viewRouteText}>
                          {t("stop.view.route")}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                  </TouchableOpacity>

                  {/* List of ETAs for this route - 此路线的到达时间列表 */}
                  <ThemedView style={styles.etaList}>
                    {item.etas.map((eta, index) => {
                      // Generate crowd prediction for this ETA
                      // 为此ETA生成人流预测
                      const crowdPrediction = showCrowdPredictions && eta.eta !== null ? 
                        predictCrowdLevel(item.route, stopId as string, new Date(eta.eta)) : 
                        null;
                        
                      return (
                        <ThemedView key={index} style={styles.etaItem}>
                          {/* Display arrival time - 显示到达时间 */}
                          <ThemedText style={styles.etaTime}>
                            {eta.eta
                              ? formatTransportTime(eta.eta, language, "relative")
                              : t("stop.no.data")}
                          </ThemedText>
                          {/* Display any remarks - 显示任何备注 */}
                          {eta.rmk_en && (
                            <ThemedText style={styles.etaRemark}>
                              {language === "en" ? eta.rmk_en : eta.rmk_tc}
                            </ThemedText>
                          )}
                          {/* Show crowd level indicator - 显示人流水平指示器 */}
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
              )}
              style={styles.etasList}
              contentContainerStyle={styles.etasListContent}
            />
          )}
        </>
      )}
    </ThemedView>
  );
}

// Styles for the component
// 组件的样式
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
  stopHeader: {
    marginBottom: 16,
  },
  stopName: {
    marginBottom: 4,
  },
  stopNameChinese: {
    fontSize: 18,
    marginBottom: 8,
  },
  stopId: {
    fontSize: 14,
    opacity: 0.7,
  },
  mapContainer: {
    height: 200,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
  arrivalsTitle: {
    marginBottom: 12,
  },
  refreshingIndicator: {
    marginBottom: 12,
  },
  noETAs: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noETAsText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  etasList: {
    flex: 1,
  },
  etasListContent: {
    paddingBottom: 120,
    gap: 16,
  },
  etaCard: {
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  routeHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  routeNumberContainer: {
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#FFD580",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 48,
    height: 48,
  },
  routeNumber: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#8B4513",
  },
  routeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  destination: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  directionText: {
    fontSize: 12,
    opacity: 0.7,
  },
  etaList: {
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#FFD580",
    marginLeft: 24,
  },
  etaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  etaTime: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  etaRemark: {
    fontSize: 14,
    opacity: 0.7,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    marginRight: 12,
  },
  favoriteButton: {
    marginRight: 8,
  },
  viewRouteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  viewRouteText: {
    fontSize: 12,
    color: "#0a7ea4",
    marginLeft: 4,
  },
});
