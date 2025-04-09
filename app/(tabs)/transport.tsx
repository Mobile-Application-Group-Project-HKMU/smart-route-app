// Import necessary React hooks and React Native components
import { useEffect, useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

// Import custom components
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import SearchBox from "@/components/SearchBox";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  KmbRouteCard,
  CtbRouteCard,
  MtrRouteCard,
} from "@/components/transport";

// Import utility functions for fetching transport data
import {
  getAllKmbRoutes,
  getAllKmbStops,
  getAllMtrRoutes, 
  getAllMtrStops,
} from "@/util/transport";
// Import type definitions for transport data
import {
  TransportRoute,
  TransportCompany,
  TransportStop,
  TransportMode,
} from "@/types/transport-types";

// Define transport filter types - can be "ALL" or a specific company
type TransportFilter = "ALL" | TransportCompany;

// Main component for the Bus Routes screen
export default function BusRoutesScreen() {
  // Get translation function and current language from context
  const { t, language } = useLanguage();
  // State for storing all available routes
  // 用于存储所有可用的路线
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  // State for storing filtered routes based on search and filters
  // 用于存储基于搜索和过滤条件筛选后的路线
  const [filteredRoutes, setFilteredRoutes] = useState<TransportRoute[]>([]);
  // State for storing all available stations/stops
  // 用于存储所有可用的车站/站点
  const [stations, setStations] = useState<TransportStop[]>([]);
  // State for storing filtered stations based on search and filters
  // 用于存储基于搜索和过滤条件筛选后的车站
  const [filteredStations, setFilteredStations] = useState<TransportStop[]>([]);
  // Loading state for data fetching
  // 数据加载状态
  const [loading, setLoading] = useState(true);
  // State for the current search query
  // 当前搜索查询的状态
  const [searchQuery, setSearchQuery] = useState("");
  // State for the current search type (routes or stations)
  // 当前搜索类型状态（路线或车站）
  const [searchType, setSearchType] = useState<"routes" | "stations">("routes");
  // State for current page in pagination
  // 分页中当前页面的状态
  const [currentPage, setCurrentPage] = useState(1);
  // State for the transport company filter
  // 交通公司过滤器的状态
  const [transportFilter, setTransportFilter] =
    useState<TransportFilter>("ALL");
  // Number of items to show per page
  // 每页显示的项目数量
  const itemsPerPage = 10;

  // Define colors for different transport companies
  // 定义不同交通公司的颜色方案
  const transportColors: Record<
    TransportFilter,
    { light: string; dark: string; text: string }
  > = {
    ALL: { light: "#8B4513", dark: "#8B4513", text: "#FFFFFF" }, // All companies / 所有公司
    KMB: { light: "#FF5151", dark: "#B30000", text: "#FFFFFF" }, // Kowloon Motor Bus / 九龙巴士
    CTB: { light: "#FFDD00", dark: "#CC9900", text: "#000000" }, // Citybus / 城巴
    NLB: { light: "#00CCCC", dark: "#008888", text: "#FFFFFF" }, // New Lantao Bus / 新大屿山巴士
    HKKF: { light: "#4D94FF", dark: "#0066CC", text: "#FFFFFF" }, // Hong Kong & Kowloon Ferry / 港九小轮
    MTR: { light: "#E60012", dark: "#B30000", text: "#FFFFFF" }, // Mass Transit Railway / 港铁
    LR: { light: "#95CA3E", dark: "#6B9130", text: "#FFFFFF" }, // Light Rail / 轻铁
    LRF: { light: "#FF9900", dark: "#CC7A00", text: "#FFFFFF" }, // Light Rail Feeder / 轻铁接驳
    SF: { light: "#8959A8", dark: "#5F3E73", text: "#FFFFFF" }, // Star Ferry / 天星小轮
    FF: { light: "#4078C0", dark: "#2C5499", text: "#FFFFFF" }, // First Ferry / 港九小轮
    NWFB: { light: "#9370DB", dark: "#6A3CA0", text: "#FFFFFF" }, // New World First Bus / 新巴
    GMB: { light: "#76B947", dark: "#4E7A30", text: "#FFFFFF" }, // Green Minibus / 绿色小巴
  };

  // Effect hook to fetch transport data on component mount and language change
  // 在组件挂载和语言更改时获取交通数据的副作用钩子
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Start loading indicator / 启动加载指示器
        let allRoutes: TransportRoute[] = []; // Container for all routes / 存储所有路线的容器
        let allStations: TransportStop[] = []; // Container for all stations / 存储所有车站的容器

        // Fetch KMB routes and stops
        // 获取九巴路线和站点数据
        const kmbRoutes = await getAllKmbRoutes();
        const kmbStops = await getAllKmbStops();

        // Convert KMB routes to TransportRoute format
        // 将九巴路线转换为统一的TransportRoute格式
        const kmbTransportRoutes = kmbRoutes.map((route) => ({
          ...route,
          orig_tc: route.orig_tc ? String(route.orig_tc) : undefined, // Ensure origin in Traditional Chinese is a string / 确保繁体中文起点为字符串
          dest_tc: route.dest_tc ? String(route.dest_tc) : undefined, // Ensure destination in Traditional Chinese is a string / 确保繁体中文终点为字符串
          co: "KMB", // Set company code to KMB / 设置公司代码为KMB
          mode: "BUS" as TransportMode, // Set transport mode to BUS / 设置交通模式为巴士
        })) as TransportRoute[];

        allRoutes.push(...kmbTransportRoutes); // Add KMB routes to collection / 将九巴路线添加到集合中

        // Convert KMB stops to TransportStop format
        // 将九巴站点转换为统一的TransportStop格式
        const kmbTransportStops = kmbStops.map((stop) => ({
          stop: stop.stop, // Stop ID / 站点ID
          name_en: stop.name_en, // Stop name in English / 英文站点名称
          name_tc: stop.name_tc, // Stop name in Traditional Chinese / 繁体中文站点名称
          name_sc: stop.name_sc, // Stop name in Simplified Chinese / 简体中文站点名称
          lat: stop.lat, // Latitude / 纬度
          long: stop.long, // Longitude / 经度
          data_timestamp: stop.data_timestamp, // Data timestamp / 数据时间戳
          company: "KMB", // Set company code to KMB / 设置公司代码为KMB
          mode: "BUS" as TransportMode, // Set transport mode to BUS / 设置交通模式为巴士
        })) as TransportStop[];

        allStations.push(...kmbTransportStops); // Add KMB stops to collection / 将九巴站点添加到集合中

        try {
          // Attempt to fetch MTR routes and stops
          // 尝试获取港铁路线和站点数据
          const mtrRoutes = await getAllMtrRoutes(
            language as "en" | "zh-Hant" | "zh-Hans"
          );
          if (mtrRoutes && mtrRoutes.length > 0) {
            allRoutes.push(
              ...mtrRoutes.map((route) => ({
                ...route,
                mode: "MTR" as TransportMode,
              }))
            );
          }

          const mtrStops = await getAllMtrStops();
          if (mtrStops && mtrStops.length > 0) {
            allStations.push(
              ...mtrStops.map((stop) => ({
                ...stop,
                company: "MTR",
                mode: "MTR" as TransportMode,
              }))
            );
          }
        } catch (error) {
          console.warn("Failed to fetch MTR data:", error);
        }

        // Update state with all fetched data
        // 使用所有获取的数据更新状态
        setRoutes(allRoutes);
        setFilteredRoutes(allRoutes);
        setStations(allStations);
        setFilteredStations(allStations);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [language]);

  // Apply filters when search query, routes, stations, search type, or transport filter changes
  // 当搜索查询、路线、车站、搜索类型或交通过滤器更改时应用过滤器
  useEffect(() => {
    applyFilters();
  }, [searchQuery, routes, stations, searchType, transportFilter]);

  // Function to filter routes or stations based on search query and transport filter
  // 根据搜索查询和交通过滤器筛选路线或车站的函数
  const applyFilters = () => {
    if (searchType === "routes") {
      let filtered = routes;

      // Filter by transport company if not "ALL"
      // 如果不是“ALL”，则按交通公司过滤
      if (transportFilter !== "ALL") {
        filtered = filtered.filter(
          (route) => (route.co || "").toUpperCase() === transportFilter
        );
      }

      // Filter by search query if not empty
      // 如果搜索查询不为空，则按查询过滤
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (route) =>
            route.route.toLowerCase().includes(query) ||
            (route.orig_en || "").toLowerCase().includes(query) ||
            (route.dest_en || "").toLowerCase().includes(query) ||
            (route.orig_tc || "").includes(query) ||
            (route.dest_tc || "").includes(query)
        );
      }

      setFilteredRoutes(filtered);
    } else {
      let filtered = stations;

      // Filter by transport company if not "ALL"
      // 如果不是“ALL”，则按交通公司过滤
      if (transportFilter !== "ALL") {
        filtered = filtered.filter(
          (station) =>
            (station.company || "KMB").toUpperCase() === transportFilter
        );
      }

      // Filter by search query if not empty
      // 如果搜索查询不为空，则按查询过滤
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (station) =>
            String(station.name_en || "")
              .toLowerCase()
              .includes(query) ||
            String(station.name_tc || "").includes(query) ||
            String(station.stop || "").includes(query)
        );
      }

      setFilteredStations(filtered);
    }

    // Reset to first page when filters change
    // 当过滤器更改时重置到第一页
    setCurrentPage(1); 
  };

  // Handle press on a route item - navigate to appropriate detail screen
  // 处理路线项的点击事件 - 导航到相应的详情页面
  const handleRoutePress = (route: TransportRoute) => {
    const company = (route.co || "KMB").toUpperCase();

    if (company === "KMB") {
      router.push(
        `/bus/${route.route}?bound=${route.bound}&serviceType=${route.service_type}`
      );
    } else if (company === "MTR") {
      router.push({
        pathname: "/mtr/line/[lineId]",
        params: { lineId: route.route },
      });
    } else {
      router.push(
        `/bus/${route.route}?company=${company}&bound=${route.bound || "O"}`
      );
    }
  };

  // Handle press on a stop/station item - navigate to appropriate detail screen
  // 处理站点项的点击事件 - 导航到相应的详情页面
  const handleStopPress = (stop: TransportStop) => {
    const company = (stop.company || "KMB").toUpperCase();

    if (company === "MTR") {
      router.push({
        pathname: "/mtr/[stationId]",
        params: { stationId: stop.stop },
      });
    } else {
      router.push(`/stop/${stop.stop}?company=${company}`);
    }
  };

  // Get the appropriate route card component based on the transport company
  // 根据交通公司获取相应的路线卡片组件
  const getRouteCard = (route: TransportRoute, index: number) => {
    const company = (route.co || "KMB").toUpperCase() as TransportCompany;
    const key = `${route.route}-${route.bound}-${route.service_type}-${index}`;

    switch (company) {
      case "KMB":
        return (
          <KmbRouteCard
            key={key}
            route={route}
            onPress={() => handleRoutePress(route)}
            language={language}
          />
        );
      case "CTB":
        return (
          <CtbRouteCard
            key={key}
            route={route}
            onPress={() => handleRoutePress(route)}
            language={language}
          />
        );
      case "MTR":
        return (
          <MtrRouteCard
            key={key}
            route={route}
            onPress={() => handleRoutePress(route)}
            language={language}
          />
        );
      default:
        return (
          <KmbRouteCard
            key={key}
            route={route}
            onPress={() => handleRoutePress(route)}
            language={language}
          />
        );
    }
  };

  // Get items to display on current page based on pagination
  // 根据分页获取当前页面要显示的项目
  const getDisplayedItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    if (searchType === "routes") {
      return filteredRoutes.slice(startIndex, endIndex);
    } else {
      return filteredStations.slice(startIndex, endIndex);
    }
  };

  // Calculate total number of pages for pagination
  // 计算分页的总页数
  const totalPages = Math.ceil(
    (searchType === "routes"
      ? filteredRoutes.length
      : filteredStations.length) / itemsPerPage
  );

  // Render pagination controls
  // 渲染分页控件
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <ThemedView style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === 1 && styles.disabledButton,
          ]}
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ThemedText>Previous</ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.paginationText}>
          {currentPage} / {totalPages}
        </ThemedText>

        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === totalPages && styles.disabledButton,
          ]}
          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ThemedText>Next</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  };

  // Render transport company filter tabs
  // 渲染交通公司过滤器标签
  const renderTransportTabs = () => {
    const availableCompanies = new Set(
      searchType === "routes"
        ? routes.map((route) => (route.co || "KMB").toUpperCase())
        : stations.map((station) => (station.company || "KMB").toUpperCase())
    );

    const transportModes: TransportFilter[] = ["ALL"];

    ["KMB", "CTB", "NLB", "HKKF", "MTR"].forEach((company) => {
      if (availableCompanies.has(company as TransportCompany)) {
        transportModes.push(company as TransportCompany);
      }
    });

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.transportTabsContainer}
      >
        {transportModes.map((mode) => {
          const colors = transportColors[mode];
          const isActive = transportFilter === mode;

          return (
            <TouchableOpacity
              key={mode}
              style={[
                styles.transportTab,
                { backgroundColor: isActive ? colors.light : "#f0f0f0" },
              ]}
              onPress={() => setTransportFilter(mode)}
            >
              <ThemedText
                style={[
                  styles.transportTabText,
                  { color: isActive ? colors.text : "#333333" },
                ]}
              >
                {mode === "ALL"
                  ? t("bus.transport.all")
                  : t(`bus.transport.${mode.toLowerCase()}`)}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  // Render station count information
  // 渲染车站计数信息
  const renderStationCounts = () => {
    if (searchType !== "stations") return null;

    const companyCounts: Record<string, number> = {};
    stations.forEach((station) => {
      const company = station.company || "KMB";
      companyCounts[company] = (companyCounts[company] || 0) + 1;
    });

    return (
      <ThemedView style={styles.stationCountsContainer}>
        <ThemedText style={styles.stationCountsTitle}>
          {t("bus.available.stations")}:
        </ThemedText>
        {Object.entries(companyCounts).map(([company, count]) => (
          <ThemedText key={company} style={styles.stationCount}>
            {company}: {count}
          </ThemedText>
        ))}
      </ThemedView>
    );
  };

  // Main render function for the component
  // 组件的主要渲染函数
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#FFD580", dark: "#8B4513" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#A0522D"
          name="paperplane.fill"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{t("bus.title")}</ThemedText>
      </ThemedView>

      <SearchBox
        placeholder={
          searchType === "routes"
            ? t("bus.search.routes")
            : t("bus.search.stations")
        }
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ThemedView style={styles.searchTypeContainer}>
        <TouchableOpacity
          style={[
            styles.searchTypeButton,
            searchType === "routes" && styles.activeSearchTypeButton,
          ]}
          onPress={() => setSearchType("routes")}
        >
          <ThemedText
            style={
              searchType === "routes" ? styles.activeSearchTypeText : undefined
            }
          >
            {t("bus.tab.routes")}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.searchTypeButton,
            searchType === "stations" && styles.activeSearchTypeButton,
          ]}
          onPress={() => setSearchType("stations")}
        >
          <ThemedText
            style={
              searchType === "stations"
                ? styles.activeSearchTypeText
                : undefined
            }
          >
            {t("bus.tab.stations")}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Render transport company filter tabs */}
      {renderTransportTabs()}

      {/* Render station counts when in stations mode */}
      {searchType === "stations" && renderStationCounts()}

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <ThemedView style={styles.routesContainer}>
          {searchType === "routes" ? (
            filteredRoutes.length === 0 ? (
              <ThemedText style={styles.noResults}>
                {t("bus.no.results")}
              </ThemedText>
            ) : (
              <ThemedView style={styles.listContainer}>
                {getDisplayedItems().map((item, index) => {
                  return getRouteCard(item as TransportRoute, index);
                })}
                {renderPagination()}
              </ThemedView>
            )
          ) : filteredStations.length === 0 ? (
            <ThemedText style={styles.noResults}>
              {t("bus.no.results")}
            </ThemedText>
          ) : (
            <ThemedView style={styles.listContainer}>
              {getDisplayedItems().map((item) => (
                <TouchableOpacity
                  key={(item as TransportStop).stop}
                  style={styles.stationItem}
                  onPress={() => handleStopPress(item as TransportStop)}
                  activeOpacity={0.7}
                >
                  <ThemedView style={styles.stationContainer}>
                    <IconSymbol
                      name="location.fill"
                      size={24}
                      color={getStationIconColor(
                        (item as TransportStop).company
                      )}
                      style={styles.stationIcon}
                    />
                    <ThemedView style={styles.stationInfo}>
                      <ThemedText style={styles.stationName}>
                        {language === "en"
                          ? (item as TransportStop).name_en
                          : language === "zh-Hans"
                          ? (item as TransportStop).name_sc ||
                            (item as TransportStop).name_tc
                          : (item as TransportStop).name_tc}
                      </ThemedText>
                      <ThemedText style={styles.stationId}>
                        {(item as TransportStop).company || "KMB"} •{" "}
                        {t("bus.stationId")}: {(item as TransportStop).stop}
                      </ThemedText>
                    </ThemedView>
                    <IconSymbol
                      name="chevron.right"
                      size={20}
                      color="#808080"
                    />
                  </ThemedView>
                </TouchableOpacity>
              ))}
              {renderPagination()}
            </ThemedView>
          )}
        </ThemedView>
      )}
    </ParallaxScrollView>
  );

  // Helper function to get color for station icon based on transport company
  // 根据交通公司获取站点图标颜色的辅助函数
  function getStationIconColor(company: string | undefined): string {
    switch (company?.toUpperCase()) {
      case "KMB":
        return "#B30000"; // Red for KMB / 九巴红色
      case "CTB":
        return "#CC9900"; // Yellow for CTB / 城巴黄色
      case "NLB":
        return "#008888"; // Teal for NLB / 新大屿山巴士青色
      case "HKKF":
        return "#0066CC"; // Blue for HKKF / 港九小轮蓝色
      case "MTR":
        return "#E60012"; // Red for MTR / 港铁红色
      default:
        return "#8B4513"; // Default brown / 默认棕色
    }
  }
}

// Styles for the component
const styles = StyleSheet.create({
  headerImage: {
    color: "#A0522D",
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
  routesContainer: {
    flex: 1,
  },
  searchTypeContainer: {
    flexDirection: "row",
    marginVertical: 12,
    justifyContent: "center",
  },
  searchTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 8,
    backgroundColor: "#f0f0f0",
  },
  activeSearchTypeButton: {
    backgroundColor: "#8B4513",
  },
  activeSearchTypeText: {
    color: "white",
  },
  transportTabsContainer: {
    paddingHorizontal: 8,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transportTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: "#f0f0f0",
    marginVertical: 4,
  },
  transportTabText: {
    fontWeight: "500",
    fontSize: 14,
  },
  loader: {
    marginTop: 20,
  },
  noResults: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 100,
  },
  stationItem: {
    marginBottom: 12,
  },
  stationContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  stationIcon: {
    marginRight: 12,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "500",
  },
  stationId: {
    fontSize: 14,
    opacity: 0.7,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  paginationButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 16,
  },
  stationCountsContainer: {
    marginTop: 8,
    marginBottom: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  stationCountsTitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  stationCount: {
    fontSize: 14,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
