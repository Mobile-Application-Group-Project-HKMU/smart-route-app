import { useLocalSearchParams, Stack, router } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
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

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { classifyStopETAs, getAllStops } from "@/util/mtr";
import { MtrStation, MTR_COLORS } from "@/util/mtr";
import { ClassifiedTransportETA, TransportETA } from "@/types/transport-types";
import { formatTransportTime } from "@/util/datetime";
import {
  FavRouteStation,
  saveToLocalStorage,
  getFromLocalStorage,
} from "@/util/favourite";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MtrStationScreen() {
  const { stationId } = useLocalSearchParams();
  const [station, setStation] = useState<MtrStation | null>(null);
  const [etas, setEtas] = useState<ClassifiedTransportETA[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const { t, language } = useLanguage();

  const checkFavorite = async () => {
    try {
      const favorites = (await getFromLocalStorage(
        "stationFavorites"
      )) as FavRouteStation | null;
      if (favorites && favorites.stationID.includes(stationId as string)) {
        setIsFavorite(true);
      } else {
        setIsFavorite(false);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const openNavigation = () => {
    if (!station) return;

    const { lat, long } = station;
    const label = encodeURI(
      language === "en"
        ? station.name_en
        : language === "zh-Hans"
        ? station.name_sc || station.name_tc
        : station.name_tc
    );

    let url = "";
    if (Platform.OS === "ios") {

      url = `maps:?q=${label}&ll=${lat},${long}`;
    } else {

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

  const toggleFavorite = async () => {
    try {
      let favorites = (await getFromLocalStorage(
        "stationFavorites"
      )) as FavRouteStation;

      if (!favorites) {
        favorites = { stationID: [] };
      }

      if (isFavorite) {

        favorites.stationID = favorites.stationID.filter(
          (id) => id !== stationId
        );
      } else {

        favorites.stationID.push(stationId as string);
      }

      await saveToLocalStorage("stationFavorites", favorites);
      setIsFavorite(!isFavorite);

      Alert.alert(
        isFavorite ? "Removed from Favorites" : "Added to Favorites",
        isFavorite
          ? "This station has been removed from your favorites."
          : "This station has been added to your favorites."
      );
    } catch (error) {
      console.error("Error updating favorites:", error);
      Alert.alert("Error", "Failed to update favorites");
    }
  };

  const loadStationData = async () => {
    if (!stationId) return;

    try {
      setLoading(true);


      const stations = await getAllStops();
      const stationData = stations.find((s) => s.stop === stationId);

      if (!stationData) {
        Alert.alert("Error", "Station not found");
        router.back();
        return;
      }

      setStation(stationData);


      const stationEtas = await classifyStopETAs(stationId as string);
      setEtas(stationEtas);


      await checkFavorite();
    } catch (error) {
      console.error("Failed to load station data:", error);
      Alert.alert("Error", "Could not load station information");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStationData();
      return () => {

      };
    }, [stationId])
  );

  const openInMaps = () => {
    if (!station) return;

    const { lat, long } = station;
    const label = language === "en" ? station.name_en : station.name_tc;

    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });

    const latLng = `${lat},${long}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert(t("error.navigation"), t("error.open.maps"));
      });
    }
  };


  const navigateToLine = (lineCode: string) => {
    router.push({
      pathname: "/mtr/line/[lineId]",
      params: { lineId: lineCode },
    });
  };

  const getStationName = () => {
    if (!station) return "";
    return language === "en"
      ? station.name_en
      : language === "zh-Hans"
      ? station.name_sc || station.name_tc
      : station.name_tc;
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: getStationName(),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={loadStationData}
                style={styles.refreshButton}
              >
                <IconSymbol name="arrow.clockwise" size={20} color="#0a7ea4" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleFavorite}
                style={styles.favoriteButton}
              >
                <IconSymbol
                  name={isFavorite ? "star.fill" : "star"}
                  size={20}
                  color={isFavorite ? "#FFD700" : "#808080"}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : station ? (
        <>

          <ThemedView style={styles.infoCard}>
            <ThemedText style={styles.stationId}>
              {t("mtr.station.id") || t("transport.station.id")}: {stationId}
            </ThemedText>

            <View style={styles.lineChips}>
              {station.line_codes.map((line) => (
                <TouchableOpacity
                  key={line}
                  style={[
                    styles.lineChip,
                    {
                      backgroundColor:
                        MTR_COLORS[line as keyof typeof MTR_COLORS] ||
                        "#666666",
                    },
                  ]}
                  onPress={() => navigateToLine(line)}
                >
                  <ThemedText style={styles.lineCode}>{line}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {station.is_interchange && (
              <ThemedText style={styles.interchangeNote}>
                {t("mtr.station.interchange") ||
                  t("transport.station.interchange")}
              </ThemedText>
            )}
          </ThemedView>


          {Platform.OS !== "web" && (
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={
                  Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                }
                initialRegion={{
                  latitude: station.lat,
                  longitude: station.long,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: station.lat,
                    longitude: station.long,
                  }}
                  title={station.name_en}
                  pinColor="#0075C2"
                />
              </MapView>
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
            </View>
          )}


          <ThemedText style={styles.sectionTitle}>
            {t("mtr.station.nextTrain") || t("transport.station.arrivals")}
          </ThemedText>

          {etas.length === 0 ? (
            <ThemedText style={styles.noEtasText}>
              {t("transport.station.no.arrivals")}
            </ThemedText>
          ) : (
            <FlatList
              data={etas}
              keyExtractor={(item) =>
                `${item.route}-${item.direction}-${item.destination_en}`
              }
              style={styles.etasList}
              renderItem={({ item }) => (
                <ThemedView style={styles.etaCard}>
                  <View style={styles.etaHeader}>
                    <ThemedView
                      style={[
                        styles.lineChip,
                        {
                          backgroundColor:
                            MTR_COLORS[item.route as keyof typeof MTR_COLORS] ||
                            "#666666",
                          height: 28,
                          width: 60,
                        },
                      ]}
                    >
                      <ThemedText style={styles.lineCode}>
                        {item.route}
                      </ThemedText>
                    </ThemedView>
                    <ThemedText style={styles.destination}>
                      {language === "en"
                        ? item.destination_en
                        : item.destination_tc}
                    </ThemedText>
                  </View>

                  <View style={styles.etaTimes}>
                    {item.etas.map((eta, etaIndex) => (
                      <ThemedView key={etaIndex} style={styles.etaTimeItem}>
                        <ThemedText style={styles.etaTime}>
                          {eta.eta
                            ? formatTransportTime(
                                eta.eta,
                                language as "en" | "zh-Hant" | "zh-Hans",
                                "relative"
                              )
                            : t("stop.no.data")}
                        </ThemedText>
                        {eta.platform && (
                          <ThemedText style={styles.platformInfo}>
                            {t("mtr.station.platform") ||
                              t("transport.info.platform")}{" "}
                            {eta.platform}
                          </ThemedText>
                        )}
                        {eta.rmk_en && (
                          <ThemedText style={styles.etaRemark}>
                            {language === "en" ? eta.rmk_en : eta.rmk_tc}
                          </ThemedText>
                        )}
                      </ThemedView>
                    ))}
                  </View>
                </ThemedView>
              )}
            />
          )}
        </>
      ) : (
        <ThemedText style={styles.errorText}>
          {t("error.station.not.found")}
        </ThemedText>
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
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  refreshButton: {
    padding: 4,
  },
  favoriteButton: {
    padding: 4,
  },
  infoCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  stationId: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
  },
  lineChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 8,
  },
  lineChip: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 50,
    alignItems: "center",
  },
  lineCode: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  interchangeNote: {
    marginTop: 8,
    fontStyle: "italic",
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
  },
  facilitiesSection: {
    marginBottom: 16,
  },
  facilitiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  facilityItem: {
    width: "50%",
    paddingVertical: 4,
  },
  exitsList: {
    marginBottom: 16,
  },
  exitCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    minWidth: 150,
  },
  exitLabel: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  exitDestination: {
    fontSize: 14,
  },
  etasList: {
    flex: 1,
  },
  etaCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  etaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  destination: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  etaTimes: {
    gap: 8,
  },
  etaTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  etaTime: {
    fontSize: 16,
    fontWeight: "500",
  },
  platformInfo: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
  },
  etaRemark: {
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.7,
  },
  noEtasText: {
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    fontStyle: "italic",
    opacity: 0.7,
  },
  navigateButton: {
    backgroundColor: "#0075C2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginTop: 12,
    marginBottom: 20,
  },
  navigateButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  errorText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    opacity: 0.7,
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
});
