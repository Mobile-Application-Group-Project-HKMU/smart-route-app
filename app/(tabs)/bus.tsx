import { useEffect, useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

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
  GmbRouteCard 
} from "@/components/transport";

// Import utilities
import { getAllRoutes, Route, getAllStops, Stop } from "@/util/kmb";
import { TransportRoute, TransportCompany } from "@/types/transport-types";

export default function BusRoutesScreen() {
  const { t, language } = useLanguage();
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<TransportRoute[]>([]);
  const [stations, setStations] = useState<Stop[]>([]);
  const [filteredStations, setFilteredStations] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"routes" | "stations">("routes");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allRoutes = await getAllRoutes();
        const allStops = await getAllStops();
        
        // Convert Route[] to TransportRoute[] by ensuring correct types
        const transformedRoutes = allRoutes.map(route => ({
          ...route,
          orig_tc: route.orig_tc ? String(route.orig_tc) : undefined,
          dest_tc: route.dest_tc ? String(route.dest_tc) : undefined
        })) as TransportRoute[];

        setRoutes(transformedRoutes);
        setFilteredRoutes(transformedRoutes);
        setStations(allStops);
        setFilteredStations(allStops);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRoutes(routes);
      setFilteredStations(stations);
    } else {
      const query = searchQuery.toLowerCase();

      if (searchType === "routes") {
        const filtered = routes.filter(
          (route) =>
            route.route.toLowerCase().includes(query) ||
            (route.orig_en || '').toLowerCase().includes(query) ||
            (route.dest_en || '').toLowerCase().includes(query) ||
            (route.orig_tc || '').includes(query) ||
            (route.dest_tc || '').includes(query)
        );
        setFilteredRoutes(filtered);
      } else {
        const filtered = stations.filter(
          (station) =>
            station.name_en.toLowerCase().includes(query) ||
            station.name_tc.includes(query) ||
            station.stop.includes(query)
        );
        setFilteredStations(filtered);
      }
    }
    setCurrentPage(1); // Reset to first page on new search
  }, [searchQuery, routes, stations, searchType]);

  const handleRoutePress = (route: TransportRoute) => {
    router.push(
      `/bus/${route.route}?bound=${route.bound}&serviceType=${route.service_type}`
    );
  };

  const handleStopPress = (stop: Stop) => {
    router.push(`/stop/${stop.stop}`);
  };

  // Return appropriate route card based on company
  const getRouteCard = (route: TransportRoute, index: number) => {
    const company = (route.co || 'KMB').toUpperCase() as TransportCompany;
    const key = `${route.route}-${route.bound}-${route.service_type}-${index}`;
    
    switch (company) {
      case 'KMB':
        return (
          <KmbRouteCard
            key={key}
            route={route as Route}
            onPress={() => handleRoutePress(route)}
            language={language}
          />
        );
      case 'CTB':
        return (
          <CtbRouteCard
            key={key}
            route={route}
            onPress={() => handleRoutePress(route)}
            language={language}
          />
        );
      case 'HKKF':
        return (
          <HkkfRouteCard
            key={key}
            route={route}
            onPress={() => handleRoutePress(route)}
            language={language}
          />
        );
      case 'NLB':
        return (
          <NlbRouteCard
            key={key}
            route={route}
            onPress={() => handleRoutePress(route)}
            language={language}
          />
        );
      case 'GMB':
        return (
          <GmbRouteCard
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
            route={route as Route}
            onPress={() => handleRoutePress(route)}
            language={language}
          />
        );
    }
  };

  // Calculate pagination
  const getDisplayedItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    if (searchType === "routes") {
      return filteredRoutes.slice(startIndex, endIndex);
    } else {
      return filteredStations.slice(startIndex, endIndex);
    }
  };

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
                  key={(item as Stop).stop}
                  style={styles.stationItem}
                  onPress={() => handleStopPress(item as Stop)}
                  activeOpacity={0.7}
                >
                  <ThemedView style={styles.stationContainer}>
                    <IconSymbol
                      name="location.fill"
                      size={24}
                      color="#8B4513"
                      style={styles.stationIcon}
                    />
                    <ThemedView style={styles.stationInfo}>
                      <ThemedText style={styles.stationName}>
                        {language === "en"
                          ? (item as Stop).name_en
                          : language === "zh-Hans"
                          ? (item as Stop).name_sc
                          : (item as Stop).name_tc}
                      </ThemedText>
                      <ThemedText style={styles.stationId}>
                        {t("bus.stationId")}: {(item as Stop).stop}
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
}

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
});
