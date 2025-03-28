import { useEffect, useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import BusRouteCard from "@/components/BusRouteCard";
import SearchBox from "@/components/SearchBox";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { getAllRoutes, Route, getAllStops, Stop } from "@/util/kmb";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function BusRoutesScreen() {
  const { t, language } = useLanguage();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [stations, setStations] = useState<Stop[]>([]);
  const [filteredStations, setFilteredStations] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"routes" | "stations">("routes");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allRoutes = await getAllRoutes();
        const allStops = await getAllStops();

        setRoutes(allRoutes);
        setFilteredRoutes(allRoutes);
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
            route.orig_en.toLowerCase().includes(query) ||
            route.dest_en.toLowerCase().includes(query) ||
            (route.orig_tc as string)?.includes(query) ||
            (route.dest_tc as string)?.includes(query)
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
  }, [searchQuery, routes, stations, searchType]);

  const handleRoutePress = (route: Route) => {
    router.push(
      `/bus/${route.route}?bound=${route.bound}&serviceType=${route.service_type}`
    );
  };

  const handleStopPress = (stop: Stop) => {
    router.push(`/stop/${stop.stop}`);
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
              <FlatList
                data={filteredRoutes.slice(0, 20)} // Limit displayed routes for performance
                keyExtractor={(item, index) =>
                  `${item.route}-${item.bound}-${item.service_type}-${index}`
                }
                renderItem={({ item }) => (
                  <BusRouteCard
                    route={item}
                    onPress={() => handleRoutePress(item)}
                    language={language}
                  />
                )}
                style={styles.list}
                contentContainerStyle={styles.listContent}
              />
            )
          ) : filteredStations.length === 0 ? (
            <ThemedText style={styles.noResults}>
              {t("bus.no.results")}
            </ThemedText>
          ) : (
            <FlatList
              data={filteredStations.slice(0, 20)} // Limit displayed stations for performance
              keyExtractor={(item) => item.stop}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.stationItem}
                  onPress={() => handleStopPress(item)}
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
                          ? item.name_en
                          : language === "zh-Hans"
                          ? item.name_sc
                          : item.name_tc}
                      </ThemedText>
                      <ThemedText style={styles.stationId}>
                        {t("bus.stationId")}: {item.stop}
                      </ThemedText>
                    </ThemedView>
                    <IconSymbol
                      name="chevron.right"
                      size={20}
                      color="#808080"
                    />
                  </ThemedView>
                </TouchableOpacity>
              )}
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
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
  list: {
    flex: 1,
  },
  listContent: {
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
});
