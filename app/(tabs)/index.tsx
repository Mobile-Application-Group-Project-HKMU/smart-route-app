// Import necessary React hooks and React Native components
import { useState, useCallback } from "react";
import { Image, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { router, useFocusEffect } from "expo-router";

// Import custom components from the application
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
// Import utility functions and types for favorites management
import {
  FavRouteKMB,
  FavRouteStation,
  getFromLocalStorage,
} from "@/util/favourite";
// Import utilities for KMB bus routes and stops
import { Route, getAllRoutes, Stop, getAllStops } from "@/util/kmb";
// Import utilities for MTR stations
import { MtrStation, getAllStops as getAllMtrStops } from "@/util/mtr";
// Import language context for internationalization
import { useLanguage } from "@/contexts/LanguageContext";

// Main HomeScreen component that displays the app's home screen
export default function HomeScreen() {
  // Get translation function and current language from context
  const { t, language } = useLanguage();
  // State for storing user's favorite bus routes
  const [favoriteRoutes, setFavoriteRoutes] = useState<
    Array<Route & { key: string }>
  >([]);
  // State for storing user's favorite bus stops
  const [favoriteStops, setFavoriteStops] = useState<Stop[]>([]);
  // State for storing user's favorite MTR stations
  const [favoriteMtrStations, setFavoriteMtrStations] = useState<MtrStation[]>(
    []
  );
  // Loading state to show loading indicator while fetching data
  const [loading, setLoading] = useState(true);

  // Function to load user's favorite routes and stops from local storage
  const loadFavorites = useCallback(async () => {
    try {
      // Set loading state to true while fetching data
      setLoading(true);

      // Retrieve favorite routes and stops from local storage
      const routeFavorites = (await getFromLocalStorage(
        "kmbFavorites"
      )) as FavRouteKMB | null;
      const stopFavorites = (await getFromLocalStorage(
        "stationFavorites"
      )) as FavRouteStation | null;

      // Process and load KMB route favorites if they exist
      if (routeFavorites?.kmbID?.length) {
        // Fetch all available routes
        const allRoutes = await getAllRoutes();
        // Map favorite route IDs to actual route objects
        const routes = routeFavorites.kmbID
          .map((key) => {
            // Split the key into route ID, bound, and service type
            const [routeId, bound, serviceType] = key.split("-");
            // Find the matching route from all routes
            const route = allRoutes.find(
              (r) =>
                r.route === routeId &&
                r.bound === bound &&
                r.service_type === serviceType
            );

            // If the route is found, return it with the key
            if (route) {
              return { ...route, key };
            }
            return null;
          })
          // Filter out any null values (routes that weren't found)
          .filter((r): r is Route & { key: string } => r !== null);

        // Update state with the found favorite routes
        setFavoriteRoutes(routes);
      } else {
        // If no favorite routes, set empty array
        setFavoriteRoutes([]);
      }

      // Process and load favorite stops if they exist
      if (stopFavorites?.stationID?.length) {
        // Separate MTR station IDs and KMB stop IDs
        const mtrStationIds = stopFavorites.stationID.filter(
          (id) => id.length === 3
        );
        const kmbStopIds = stopFavorites.stationID.filter(
          (id) => id.length !== 3
        );

        // Fetch all available KMB stops
        const allStops = await getAllStops();
        // Map favorite stop IDs to actual stop objects
        const stops = kmbStopIds
          .map((id) => allStops.find((s) => s.stop === id))
          .filter((s): s is Stop => s !== undefined);
        // Update state with the found favorite stops
        setFavoriteStops(stops);

        // Fetch all available MTR stations
        const allMtrStations = await getAllMtrStops();
        // Map favorite MTR station IDs to actual station objects
        const mtrStations = mtrStationIds
          .map((id) => allMtrStations.find((s) => s.stop === id))
          .filter((s): s is MtrStation => s !== undefined);
        // Update state with the found favorite MTR stations
        setFavoriteMtrStations(mtrStations);
      } else {
        // If no favorite stops, set empty arrays
        setFavoriteStops([]);
        setFavoriteMtrStations([]);
      }
    } catch (error) {
      // Log any errors that occur during the loading process
      console.error("Failed to load favorites:", error);
    } finally {
      // Set loading state to false after fetching data
      setLoading(false);
    }
  }, []);

  // Use focus effect to load favorites when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  // Handle press event for a favorite route
  const handleRoutePress = (route: Route & { key: string }) => {
    const [routeId, bound, serviceType] = route.key.split("-");
    router.push(`/bus/${routeId}?bound=${bound}&serviceType=${serviceType}`);
  };

  // Handle press event for a favorite stop
  const handleStopPress = (stop: Stop) => {
    router.push(`/stop/${stop.stop}`);
  };

  // Handle press event for a favorite MTR station
  const handleMtrStationPress = (station: MtrStation) => {
    router.push({
      pathname: "/mtr/[stationId]",
      params: { stationId: station.stop },
    });
  };

  // Navigate to the About screen
  const navigateToAbout = () => {
    router.push("/about?fromIndex=true");
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.headerContainer}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">{t("home.title")}</ThemedText>
          <HelloWave />
        </ThemedView>
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <IconSymbol name="gear.circle.fill" size={24} color="#8B4513" />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">{t("home.favorites")}</ThemedText>

        {loading ? (
          <ThemedText style={styles.loadingText}>
            {t("home.loading")}
          </ThemedText>
        ) : (
          <>
            {favoriteRoutes.length === 0 &&
            favoriteStops.length === 0 &&
            favoriteMtrStations.length === 0 ? (
              <ThemedText style={styles.noFavoritesText}>
                {t("home.no.favorites")}
              </ThemedText>
            ) : (
              <>

                {favoriteRoutes.length > 0 && (
                  <ThemedView style={styles.subsection}>
                    <ThemedText style={styles.subsectionTitle}>
                      {t("home.favorites.routes")}
                    </ThemedText>
                    <FlatList
                      data={favoriteRoutes}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item) => item.key}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.favoriteCard}
                          onPress={() => handleRoutePress(item)}
                        >
                          <ThemedView style={styles.favoriteCardContent}>
                            <ThemedView style={styles.routeNumberContainer}>
                              <ThemedText style={styles.routeNumber}>
                                {item.route}
                              </ThemedText>
                            </ThemedView>
                            <ThemedText
                              style={styles.destination}
                              numberOfLines={1}
                            >
                              {language === "en"
                                ? item.dest_en
                                : language === "zh-Hans"
                                ? typeof item.dest_tc === "string"
                                  ? item.dest_tc
                                  : item.dest_en
                                : typeof item.dest_tc === "string"
                                ? item.dest_tc
                                : item.dest_en}
                            </ThemedText>
                          </ThemedView>
                        </TouchableOpacity>
                      )}
                    />
                  </ThemedView>
                )}


                {favoriteStops.length > 0 && (
                  <ThemedView style={styles.subsection}>
                    <ThemedText style={styles.subsectionTitle}>
                      {t("home.favorites.stops")}
                    </ThemedText>
                    <FlatList
                      data={favoriteStops}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item) => item.stop}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.favoriteCard}
                          onPress={() => handleStopPress(item)}
                        >
                          <ThemedView style={styles.favoriteCardContent}>
                            <IconSymbol
                              name="bus.fill"
                              size={24}
                              color="#8B4513"
                            />
                            <ThemedText
                              style={styles.stopName}
                              numberOfLines={2}
                            >
                              {language === "en"
                                ? item.name_en
                                : language === "zh-Hans"
                                ? item.name_sc
                                : item.name_tc}
                            </ThemedText>
                          </ThemedView>
                        </TouchableOpacity>
                      )}
                    />
                  </ThemedView>
                )}


                {favoriteMtrStations.length > 0 && (
                  <ThemedView style={styles.subsection}>
                    <ThemedText style={styles.subsectionTitle}>
                      {t("home.favorites.mtr.stations")}
                    </ThemedText>
                    <FlatList
                      data={favoriteMtrStations}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item) => item.stop}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[styles.favoriteCard, styles.mtrCard]}
                          onPress={() => handleMtrStationPress(item)}
                        >
                          <ThemedView style={styles.favoriteCardContent}>
                            <ThemedView style={styles.mtrLineContainer}>
                              {item.line_codes.slice(0, 2).map((line) => (
                                <ThemedView
                                  key={line}
                                  style={[
                                    styles.mtrLine,
                                    { backgroundColor: "#0075C2" },
                                  ]}
                                >
                                  <ThemedText style={styles.mtrLineText}>
                                    {line}
                                  </ThemedText>
                                </ThemedView>
                              ))}
                            </ThemedView>
                            <ThemedText
                              style={styles.stopName}
                              numberOfLines={2}
                            >
                              {language === "en"
                                ? item.name_en
                                : language === "zh-Hans"
                                ? item.name_sc || item.name_tc
                                : item.name_tc}
                            </ThemedText>
                          </ThemedView>
                        </TouchableOpacity>
                      )}
                    />
                  </ThemedView>
                )}
              </>
            )}
          </>
        )}
      </ThemedView>

      <ThemedView style={styles.aboutSection}>
        <TouchableOpacity style={styles.aboutButton} onPress={navigateToAbout}>
          <IconSymbol name="info.circle.fill" size={20} color="#8B4513" />
          <ThemedText style={styles.aboutButtonText}>
            {t("home.about")}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
    gap: 16,
  },
  subsection: {
    gap: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 16,
  },
  noFavoritesText: {
    textAlign: "center",
    marginTop: 16,
    opacity: 0.7,
  },
  favoriteCard: {
    width: 120,
    height: 120,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFD580",
  },
  favoriteCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  routeNumberContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  routeNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#8B4513",
  },
  destination: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: "#8B4513",
  },
  stopName: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 8,
    color: "#8B4513",
  },
  quickNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  quickNavButton: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFD580",
    width: "45%",
  },
  quickNavText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#8B4513",
  },
  aboutSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  aboutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD580",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    justifyContent: "center",
  },
  aboutButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#8B4513",
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  mtrCard: {
    backgroundColor: "#DCF0FF",
  },
  mtrLineContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  mtrLine: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mtrLineText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
});
