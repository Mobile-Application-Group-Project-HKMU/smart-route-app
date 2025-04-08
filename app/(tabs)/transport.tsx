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
  HkkfRouteCard,
  NlbRouteCard,
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
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  // State for storing filtered routes based on search and filters
  const [filteredRoutes, setFilteredRoutes] = useState<TransportRoute[]>([]);
  // State for storing all available stations/stops
  const [stations, setStations] = useState<TransportStop[]>([]);
  // State for storing filtered stations based on search and filters
  const [filteredStations, setFilteredStations] = useState<TransportStop[]>([]);
  // Loading state for data fetching
  const [loading, setLoading] = useState(true);
  // State for the current search query
  const [searchQuery, setSearchQuery] = useState("");
  // State for the current search type (routes or stations)
  const [searchType, setSearchType] = useState<"routes" | "stations">("routes");
  // State for current page in pagination
  const [currentPage, setCurrentPage] = useState(1);
  // State for the transport company filter
  const [transportFilter, setTransportFilter] =
    useState<TransportFilter>("ALL");
  // Number of items to show per page
  const itemsPerPage = 10;

  // Define colors for different transport companies
  const transportColors: Record<
    TransportFilter,
    { light: string; dark: string; text: string }
  > = {
    ALL: { light: "#8B4513", dark: "#8B4513", text: "#FFFFFF" },
    KMB: { light: "#FF5151", dark: "#B30000", text: "#FFFFFF" },
    CTB: { light: "#FFDD00", dark: "#CC9900", text: "#000000" },
    NLB: { light: "#00CCCC", dark: "#008888", text: "#FFFFFF" },
    HKKF: { light: "#4D94FF", dark: "#0066CC", text: "#FFFFFF" },
    MTR: { light: "#E60012", dark: "#B30000", text: "#FFFFFF" },
    LR: { light: "#95CA3E", dark: "#6B9130", text: "#FFFFFF" },
    LRF: { light: "#FF9900", dark: "#CC7A00", text: "#FFFFFF" },
    SF: { light: "#8959A8", dark: "#5F3E73", text: "#FFFFFF" },
    FF: { light: "#4078C0", dark: "#2C5499", text: "#FFFFFF" },
    NWFB: { light: "#9370DB", dark: "#6A3CA0", text: "#FFFFFF" },
    GMB: { light: "#76B947", dark: "#4E7A30", text: "#FFFFFF" },
  };

  // Effect hook to fetch transport data on component mount and language change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let allRoutes: TransportRoute[] = [];
        let allStations: TransportStop[] = [];

        // Fetch KMB routes and stops
        const kmbRoutes = await getAllKmbRoutes();
        const kmbStops = await getAllKmbStops();

        // Convert KMB routes to TransportRoute format
        const kmbTransportRoutes = kmbRoutes.map((route) => ({
          ...route,
          orig_tc: route.orig_tc ? String(route.orig_tc) : undefined,
          dest_tc: route.dest_tc ? String(route.dest_tc) : undefined,
          co: "KMB",
          mode: "BUS" as TransportMode,
        })) as TransportRoute[];

        allRoutes.push(...kmbTransportRoutes);

        // Convert KMB stops to TransportStop format
        const kmbTransportStops = kmbStops.map((stop) => ({
          stop: stop.stop,
          name_en: stop.name_en,
          name_tc: stop.name_tc,
          name_sc: stop.name_sc,
          lat: stop.lat,
          long: stop.long,
          data_timestamp: stop.data_timestamp,
          company: "KMB",
          mode: "BUS" as TransportMode,
        })) as TransportStop[];

        allStations.push(...kmbTransportStops);

        try {
          // Attempt to fetch MTR routes and stops
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
  useEffect(() => {
    applyFilters();
  }, [searchQuery, routes, stations, searchType, transportFilter]);

  // Function to filter routes or stations based on search query and transport filter
  const applyFilters = () => {
    if (searchType === "routes") {
      let filtered = routes;

      // Filter by transport company if not "ALL"
      if (transportFilter !== "ALL") {
        filtered = filtered.filter(
          (route) => (route.co || "").toUpperCase() === transportFilter
        );
      }

      // Filter by search query if not empty
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
      if (transportFilter !== "ALL") {
        filtered = filtered.filter(
          (station) =>
            (station.company || "KMB").toUpperCase() === transportFilter
        );
      }

      // Filter by search query if not empty
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
    setCurrentPage(1); 
  };

  // Handle press on a route item - navigate to appropriate detail screen
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
      case "HKKF":
        return (
          <HkkfRouteCard
            key={key}
            route={route}
            onPress={() => handleRoutePress(route)}
            language={language}
          />
        );
      case "NLB":
        return (
          <NlbRouteCard
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
  const totalPages = Math.ceil(
    (searchType === "routes"
      ? filteredRoutes.length
      : filteredStations.length) / itemsPerPage
  );

  // Render pagination controls
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
  function getStationIconColor(company: string | undefined): string {
    switch (company?.toUpperCase()) {
      case "KMB":
        return "#B30000"; // Red for KMB
      case "CTB":
        return "#CC9900"; // Yellow for CTB
      case "NLB":
        return "#008888"; // Teal for NLB
      case "HKKF":
        return "#0066CC"; // Blue for HKKF 
      case "MTR":
        return "#E60012"; // Red for MTR
      default:
        return "#8B4513"; // Default brown
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
