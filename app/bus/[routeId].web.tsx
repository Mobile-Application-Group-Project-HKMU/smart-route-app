import { useLocalSearchParams, Stack, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  getRouteStops,
  getRouteDetails,
  type RouteStop,
  type Stop,
  getAllStops,
} from "@/util/kmb";
import {
  FavRouteKMB,
  saveToLocalStorage,
  getFromLocalStorage,
} from "@/util/favourite";

export default function RouteDetailScreen() {
  const { routeId, bound, serviceType } = useLocalSearchParams();
  const [stops, setStops] = useState<Array<RouteStop & Stop>>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    origin: string;
    destination: string;
  }>({ origin: "", destination: "" });

  const direction = bound === "I" ? "inbound" : "outbound";
  const routeKey = `${routeId}-${bound}-${serviceType}`;

  useEffect(() => {
    const checkFavorite = async () => {
      const favorites = (await getFromLocalStorage(
        "kmbFavorites"
      )) as FavRouteKMB | null;
      if (favorites && favorites.kmbID.includes(routeKey)) {
        setIsFavorite(true);
      }
    };

    checkFavorite();
  }, [routeKey]);

  useEffect(() => {
    const fetchRouteDetails = async () => {
      try {
        setLoading(true);

        // Fetch route details
        const details = await getRouteDetails(
          routeId as string,
          direction as "inbound" | "outbound",
          serviceType as string
        );

        setRouteInfo({
          origin: details.orig_en,
          destination: details.dest_en,
        });

        // Fetch route stops
        const routeStops = await getRouteStops(
          routeId as string,
          direction as "inbound" | "outbound",
          serviceType as string
        );

        // Fetch all stops to get their details
        const allStops = await getAllStops();
        const stopsMap = new Map(allStops.map((stop) => [stop.stop, stop]));

        // Combine route stops with stop details
        const routeStopsWithDetails = routeStops.map((routeStop) => {
          const stopDetails = stopsMap.get(routeStop.stop);
          return {
            ...routeStop,
            ...(stopDetails || {
              name_en: "Unknown Stop",
              name_tc: "未知站",
              name_sc: "未知站",
              lat: 0,
              long: 0,
              distance: 0,
            }),
          };
        });

        setStops(routeStopsWithDetails);
      } catch (error) {
        console.error("Failed to fetch route details:", error);
        Alert.alert("Error", "Failed to load route information");
      } finally {
        setLoading(false);
      }
    };

    if (routeId && bound && serviceType) {
      fetchRouteDetails();
    }
  }, [routeId, bound, serviceType, direction]);

  const toggleFavorite = async () => {
    try {
      let favorites = (await getFromLocalStorage(
        "kmbFavorites"
      )) as FavRouteKMB;

      if (!favorites) {
        favorites = { kmbID: [] };
      }

      if (isFavorite) {
        // Remove from favorites
        favorites.kmbID = favorites.kmbID.filter((id) => id !== routeKey);
      } else {
        // Add to favorites
        favorites.kmbID.push(routeKey);
      }

      await saveToLocalStorage("kmbFavorites", favorites);
      setIsFavorite(!isFavorite);

      Alert.alert(
        isFavorite ? "Removed from Favorites" : "Added to Favorites",
        isFavorite
          ? "This route has been removed from your favorites."
          : "This route has been added to your favorites."
      );
    } catch (error) {
      console.error("Error updating favorites:", error);
      Alert.alert("Error", "Failed to update favorites");
    }
  };

  const handleStopPress = (stop: RouteStop & Stop) => {
    // Navigate to stop ETA screen
    router.push(`/stop/${stop.stop}`);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: `Route ${routeId}`,
          headerRight: () => (
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
          ),
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <>
          <ThemedView style={styles.routeHeader}>
            <ThemedText type="title" style={styles.routeNumber}>
              Route {routeId}
            </ThemedText>
            <ThemedText style={styles.routeDirection}>
              {bound === "I" ? "Inbound" : "Outbound"} • Service Type:{" "}
              {serviceType}
            </ThemedText>
            <ThemedText style={styles.routePath}>
              {routeInfo.origin} → {routeInfo.destination}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.webMapPlaceholder}>
            <IconSymbol name="map.fill" size={48} color="#0a7ea4" />
            <ThemedText style={styles.webMapText}>
              Route map is available on mobile devices
            </ThemedText>
          </ThemedView>

          <ThemedText type="subtitle" style={styles.stopsHeader}>
            Stops ({stops.length})
          </ThemedText>

          <FlatList
            data={stops}
            keyExtractor={(item) =>
              `${item.route}-${item.bound}-${item.seq}-${item.stop}`
            }
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => handleStopPress(item)}
                style={styles.stopItem}
                activeOpacity={0.7}
              >
                <ThemedView style={styles.stopSequence}>
                  <ThemedText style={styles.sequenceNumber}>
                    {item.seq}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.stopInfo}>
                  <ThemedText style={styles.stopName}>
                    {item.name_en}
                  </ThemedText>
                  <ThemedText style={styles.stopNameChinese}>
                    {item.name_tc}
                  </ThemedText>
                </ThemedView>
                <IconSymbol name="chevron.right" size={20} color="#808080" />
              </TouchableOpacity>
            )}
            style={styles.stopsList}
            contentContainerStyle={styles.stopsListContent}
          />
        </>
      )}
    </ThemedView>
  );
}

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
  routeHeader: {
    marginBottom: 16,
  },
  routeNumber: {
    marginBottom: 4,
  },
  routeDirection: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  routePath: {
    fontSize: 18,
    fontWeight: "500",
  },
  webMapPlaceholder: {
    height: 200,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
  },
  webMapText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
  stopsHeader: {
    marginBottom: 12,
  },
  stopsList: {
    flex: 1,
  },
  stopsListContent: {
    paddingBottom: 20,
  },
  stopItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  stopSequence: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFD580",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  sequenceNumber: {
    fontWeight: "bold",
    color: "#8B4513",
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: "500",
  },
  stopNameChinese: {
    fontSize: 14,
    opacity: 0.7,
  },
  favoriteButton: {
    marginRight: 12,
  },
  etasListContent: {
    paddingBottom: 120,
  },
});
