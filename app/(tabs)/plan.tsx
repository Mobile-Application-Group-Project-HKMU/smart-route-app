// Route Planning Screen - Main component for planning journeys using different transportation modes
// 路线规划界面 - 使用不同交通方式规划行程的主要组件
import React, { useState, useEffect, useCallback } from "react";
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
// 导入Expo路由和位置服务
import { Stack, router } from "expo-router";
import * as Location from "expo-location";
// Import map components for route visualization
// 导入地图组件用于路线可视化
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";

// Import custom UI components
// 导入自定义UI组件
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
// Import language context for multilingual support
// 导入语言上下文以支持多语言
import { useLanguage } from "@/contexts/LanguageContext";
import ParallaxScrollView from "@/components/ParallaxScrollView";

// Import utility functions for fetching transportation data
// 导入获取交通数据的工具函数
import { getAllStops as getAllKmbStops } from "@/util/kmb";
import { getAllStops as getAllMtrStops } from "@/util/mtr";
import { TransportStop, TransportMode } from "@/types/transport-types";
import { calculateDistance } from "@/util/calculateDistance";
import { getWeatherForLocation, calculateWeatherScore } from "@/util/weather";
import { WeatherInfo } from "@/components/WeatherInfo";

// Import real journey API service
import { fetchRoutes } from "@/services/routeService";

// Define type for each step in a journey (walk, bus, or MTR)
// 定义行程中每一步的类型（步行、巴士或地铁）
type JourneyStep = {
  type: "WALK" | "BUS" | "MTR" | "TRANSIT" | "SUBWAY" | "TRAM" | "RAIL"; // Transportation mode - 交通方式
  from: TransportStop; // Origin stop - 起始站点
  to: TransportStop; // Destination stop - 目的地站点
  distance?: number; // Distance in meters - 距离（米）
  duration?: number; // Duration in minutes - 时间（分钟）
  route?: string; // Route number/name - 路线号码/名称
  company?: string; // Transportation company - 交通公司
};

// Define type for a complete journey, consisting of multiple steps
// 定义完整行程类型，由多个步骤组成
type Journey = {
  id: string; // Unique journey ID - 唯一行程ID
  steps: JourneyStep[]; // Array of journey steps - 行程步骤数组
  totalDuration: number; // Total journey time - 总行程时间
  totalDistance: number; // Total journey距离
  weatherAdjusted?: boolean; // Whether route adjusted for weather - 路线是否因天气调整
  weatherProtected?: boolean; // Whether route offers weather protection - 路线是否提供天气保护
};

// Define type for search results with additional display information
// 定义搜索结果类型，包含额外显示信息
type SearchResult = TransportStop & {
  displayName: string; // Localized display name - 本地化显示名称
  company: string; // Transportation company - 交通公司
};

// Main component for route planning functionality
// 路线规划功能的主要组件
export default function RoutePlanScreen() {
  // Access translation and language functions from context
  // 从上下文中获取翻译和语言功能
  const { t, language } = useLanguage();

  // State for input text fields
  // 输入文本字段的状态
  const [fromText, setFromText] = useState("");

  const [toText, setToText] = useState("");

  // State for selected origin and destination stops
  // 已选择的起始和目的地站点状态
  const [fromStop, setFromStop] = useState<SearchResult | null>(null);
  const [toStop, setToStop] = useState<SearchResult | null>(null);

  // State for tracking which search field is active
  // 跟踪哪个搜索字段处于活动状态
  const [searchingFrom, setSearchingFrom] = useState(false);
  const [searchingTo, setSearchingTo] = useState(false);

  // State for search results and all available stops
  // 搜索结果和所有可用站点的状态
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [allStops, setAllStops] = useState<SearchResult[]>([]);

  // Loading states
  // 加载状态
  const [loading, setLoading] = useState(false);
  const [loadingStops, setLoadingStops] = useState(true);

  // State for journey planning results
  // 行程规划结果的状态
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);

  // State for user's current location functionality
  // 用户当前位置功能的状态
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [isWeatherAware, setIsWeatherAware] = useState(true);

  // Load all stops (KMB and MTR) when the component mounts or language changes
  // 在组件挂载或语言更改时加载所有站点（KMB和MTR）
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

  // Fetch weather data when location changes
  // 当位置更改时获取天气数据
  useEffect(() => {
    async function fetchWeatherData() {
      if (!userLocation) return;

      try {
        const data = await getWeatherForLocation(
          userLocation.coords.latitude,
          userLocation.coords.longitude
        );
        setWeatherData(data);
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
      }
    }

    fetchWeatherData();
  }, [userLocation]);

  // Handle search input changes and update search results
  // 处理搜索输入更改并更新搜索结果
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

    // Clear search results if search text is empty
    // 如果搜索文本为空，清除搜索结果
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    // Convert query to lowercase for case-insensitive search
    // 将查询转换为小写以进行不区分大小写的搜索
    const query = text.toLowerCase();
    
    // Filter all stops based on search query and limit to top 10 results
    // 根据搜索查询过滤所有站点，并限制为前10个结果
    const results = allStops
      .filter(
        (stop) =>
          // Match against display name (current language)
          // 匹配显示名称（当前语言）
          stop.displayName.toLowerCase().includes(query) ||
          // Match against English name if available
          // 如果有英文名称，则匹配英文名称
          (stop.name_en && stop.name_en.toLowerCase().includes(query)) ||
          // Match against Chinese name if available
          // 如果有中文名称，则匹配中文名称
          (stop.name_tc && stop.name_tc.includes(query))
      )
      .slice(0, 10); // Limit to 10 results for better performance - 限制为10个结果以提高性能

    setSearchResults(results);
  };

  // Handle selection of a stop from search results
  // 处理从搜索结果中选择站点
  const handleSelectStop = (stop: SearchResult) => {
    // If searching for origin location
    // 如果正在搜索起始位置
    if (searchingFrom) {
      setFromStop(stop);
      setFromText(stop.displayName);
      // Disable current location feature when a specific stop is selected
      // 当选择特定站点时，禁用当前位置功能
      setUseCurrentLocation(false);
    } 
    // If searching for destination location
    // 如果正在搜索目的地位置
    else if (searchingTo) {
      setToStop(stop);
      setToText(stop.displayName);
    }
    
    // Clear search results and reset search state after selection
    // 选择后清除搜索结果并重置搜索状态
    setSearchResults([]);
    setSearchingFrom(false);
    setSearchingTo(false);
  };

  // Handle use of current location as the origin
  // 处理使用当前位置作为起点
  const handleUseCurrentLocation = async () => {
    try {
      // Request location permission from the user
      // 向用户请求位置权限
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      // If permission is denied, show alert and return
      // 如果权限被拒绝，显示提醒并返回
      if (status !== "granted") {
        Alert.alert(t("permission.denied"), t("location.permission.denied"));
        return;
      }

      // Show loading indicator while getting location
      // 获取位置时显示加载指示器
      setLoading(true);
      
      // Get user's current GPS coordinates
      // 获取用户当前的GPS坐标
      const location = await Location.getCurrentPositionAsync({});
      
      // Store location in state for later use in route planning
      // 将位置存储在状态中，以便稍后用于路线规划
      setUserLocation(location);
      
      // Enable current location mode
      // 启用当前位置模式
      setUseCurrentLocation(true);
      
      // Update the display text to show "Current Location"
      // 更新显示文本以显示"当前位置"
      setFromText(t("current.location"));
      
      // Clear any previously selected origin stop
      // 清除任何先前选择的起始站点
      setFromStop(null);
      
      // Reset search states and results
      // 重置搜索状态和结果
      setSearchingFrom(false);
      setSearchingTo(false);
      setSearchResults([]);
    } catch (error) {
      // Log and show error if location retrieval fails
      // 如果位置获取失败，记录并显示错误
      console.error("Error getting location:", error);
      Alert.alert(t("error"), t("error.getting.location"));
    } finally {
      setLoading(false);
    }
  };

  // Handle journey planning based on selected stops or current location
  // 根据选择的站点或当前位置处理行程规划
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
              name_en: "Current Location",
              name_tc: "當前位置",
              stop: "CURRENT_LOCATION",
              mode: "WALK" as TransportMode,
            }
          : fromStop;

      if (!origin) {
        throw new Error("Origin location not available");
      }

      // Fetch real journey data instead of using sample journeys
      const journeyData = await fetchRoutes(origin, toStop);

      // Apply weather considerations if enabled
      if (isWeatherAware && weatherData) {
        const weatherScore = calculateWeatherScore(weatherData);
        applyWeatherConsiderations(journeyData, weatherScore);
      }

      setJourneys(journeyData);
      if (journeyData.length > 0) {
        setSelectedJourney(journeyData[0]);
      }
    } catch (error) {
      console.error("Error planning journey:", error);
      Alert.alert(t("error"), t("error.planning.journey"));
    } finally {
      setLoading(false);
    }
  };

  // Apply weather considerations to journeys
  const applyWeatherConsiderations = (
    journeys: Journey[],
    weatherScore: number
  ) => {
    journeys.forEach((journey) => {
      const totalWalkingDistance = journey.steps
        .filter((step) => step.type === "WALK")
        .reduce((sum, step) => sum + (step.distance ?? 0), 0);

      const hasMTR = journey.steps.some((step) =>
        ["MTR", "SUBWAY", "RAIL"].includes(step.type)
      );

      // For rainy weather, penalize journeys with more walking
      if (weatherScore < 50 && totalWalkingDistance > 500) {
        journey.totalDuration += Math.floor(totalWalkingDistance / 100);
        journey.weatherAdjusted = true;
      }

      // For very bad weather, prioritize indoor/covered routes (MTR)
      if (weatherScore < 30) {
        if (hasMTR) {
          journey.totalDuration -= 5;
          journey.weatherProtected = true;
        }
      }
    });

    // Re-sort journeys after applying weather adjustments
    journeys.sort((a, b) => a.totalDuration - b.totalDuration);
  };

  // Find the nearest stop of a specific company to a given location
  // 找到距离给定位置最近的特定公司站点
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

  // Get the appropriate icon for a transport type
  // 获取交通类型的适当图标
  const getTransportIcon = (type: string) => {
    switch (type) {
      case "WALK":
        return "figure.walk";
      case "BUS":
        return "bus";
      case "MTR":
      case "SUBWAY":
      case "RAIL":
      case "TRAM":
        return "tram";
      case "TRANSIT":
        return "arrow.right";
      default:
        return "arrow.right";
    }
  };

  // Get the appropriate color for a transport type
  // 获取交通类型的适当颜色
  const getTransportColor = (type: string, route?: string) => {
    switch (type) {
      case "WALK":
        return "#555555";
      case "BUS":
        return "#FF5151";
      case "MTR":
      case "SUBWAY":
      case "RAIL":
        // Use actual MTR line colors if route is specified
        if (route) {
          // Maps to the MTR_COLORS from mtr.ts
          const mtrLineColors: Record<string, string> = {
            AEL: "#00888E", // Airport Express
            TCL: "#F3982D", // Tung Chung Line
            TML: "#9C2E00", // Tuen Ma Line
            TKL: "#7E3C99", // Tseung Kwan O Line
            EAL: "#5EB7E8", // East Rail Line
            TWL: "#C41E3A", // Tsuen Wan Line
            ISL: "#0075C2", // Island Line
            KTL: "#00A040", // Kwun Tong Line
            SIL: "#CBD300", // South Island Line
            DRL: "#B5A45D", // Disneyland Resort Line
          };
          return mtrLineColors[route] || "#E60012";
        }
        return "#E60012";
      case "TRAM":
        return "#00A86B";
      case "TRANSIT":
        return "#4682B4";
      default:
        return "#000000";
    }
  };

  // Format distance in meters to a readable string, now as integers
  // 将距离（米）格式化为可读字符串，现在为整数
  const formatDistance = (meters: number | null | undefined): string => {
    if (meters === undefined || meters === null) return "未知距离";
    if (meters < 1000) return `${Math.round(meters)}米`;
    return `${Math.round(meters / 1000)}km`;
  };

  // Navigate to transport details screen based on journey step
  // 根据行程步骤导航到交通详情界面
  const navigateToTransportDetails = (step: JourneyStep) => {
    if (step.type === "BUS" && step.route) {
      router.push(`/bus/${step.route}?bound=O&serviceType=1`);
    } else if (
      (step.type === "MTR" || step.type === "SUBWAY" || step.type === "RAIL") &&
      step.route
    ) {
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

        {weatherData && (
          <View style={styles.weatherContainer}>
            <WeatherInfo weatherData={weatherData} compact={true} />
            <TouchableOpacity
              style={styles.weatherToggle}
              onPress={() => setIsWeatherAware(!isWeatherAware)}
            >
              <ThemedView
                style={[
                  styles.toggleSwitch,
                  isWeatherAware ? styles.toggleActive : {},
                ]}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    isWeatherAware ? styles.toggleKnobActive : {},
                  ]}
                />
              </ThemedView>
              <ThemedText style={styles.weatherToggleText}>
                {t("weatherAwareRouting")}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

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
                        color={getTransportColor(step.type, step.route)}
                      />
                    ))}
                </ThemedView>
                {journey.weatherAdjusted && (
                  <ThemedView style={styles.weatherBadge}>
                    <IconSymbol name="umbrella.fill" size={14} color="#FFF" />
                    <ThemedText style={styles.weatherBadgeText}>
                      {t("routeAdjustedForWeather")}
                    </ThemedText>
                  </ThemedView>
                )}

                {journey.weatherProtected && (
                  <ThemedView
                    style={[styles.weatherBadge, styles.protectedBadge]}
                  >
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={14}
                      color="#FFF"
                    />
                    <ThemedText style={styles.weatherBadgeText}>
                      {t("weatherProtectedRoute")}
                    </ThemedText>
                  </ThemedView>
                )}
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
                        strokeColor={getTransportColor(step.type, step.route)}
                        strokeWidth={step.type === "WALK" ? 2 : 4}
                      />
                    ))}
                  </MapView>
                </View>
              )}

              {weatherData && <WeatherInfo weatherData={weatherData} />}

              <ThemedView>
              {selectedJourney.steps.map((step, index) => (
                  <ThemedView key={index} style={styles.journeyStep}>
                    <ThemedView
                      style={[
                        styles.stepIconContainer,
                        {
                          backgroundColor: getTransportColor(step.type, step.route),
                        },
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
                          ? `${t("take")} ${step.company} ${t("bus")} ${step.route || ""}`
                          : `${t("take")} ${t("mtr")} ${step.route || ""}`}
                      </ThemedText>
                      <ThemedText style={styles.stepFromTo}>
                        {`${language === "en" ? (step.from.name_en || '') : (step.from.name_tc || '')} → ${language === "en" ? (step.to.name_en || '') : (step.to.name_tc || '')}`}
                      </ThemedText>
                      <ThemedView style={styles.stepMeta}>
                        <ThemedView style={styles.stepMetaInfo}>
                          <ThemedText style={styles.stepMetaText}>
                            {formatDistance(step.distance || 0)}
                          </ThemedText>
                          {step.duration && (
                            <ThemedText style={styles.stepMetaText}>
                              {` • ${Math.round(step.duration)} ${t("minutes")}`}
                            </ThemedText>
                          )}
                        </ThemedView>
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
  stepMetaInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepMetaText: {
    fontSize: 14,
    color: "#8B4513",
    opacity: 0.7,
    marginRight: 8,
  },
  viewRouteButton: {
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 69, 19, 0.3)",
  },
  viewRouteText: { fontSize: 13, fontWeight: "500", color: "#8B4513" },
  weatherContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  weatherToggle: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleSwitch: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E0E0E0",
    padding: 2,
  },
  toggleActive: {
    backgroundColor: "#0a7ea4",
  },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "white",
  },
  toggleKnobActive: {
    transform: [{ translateX: 16 }],
  },
  weatherToggleText: {
    marginLeft: 8,
    fontSize: 14,
  },
  weatherBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a7ea4",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  protectedBadge: {
    backgroundColor: "#4CAF50",
  },
  weatherBadgeText: {
    color: "white",
    fontSize: 10,
    marginLeft: 4,
  },
});
