import React, { useState } from "react";
import { View, TextInput, Button, FlatList, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLanguage } from "@/contexts/LanguageContext";
import { findNearbyStops as findKmbStops } from "@/util/kmb";
import { findNearbyStops as findMtrStops } from "@/util/mtr";
import { findNearbyStops as findGmbStops } from "@/util/gmb";

export default function RoutePlanScreen() {
  const [fromStop, setFromStop] = useState("");
  const [toStop, setToStop] = useState("");
  const [results, setResults] = useState([]);
  const { t } = useLanguage();

  const handlePlanRoute = async () => {
    try {
      const kmbStops = await findKmbStops(
        parseFloat(fromStop),
        parseFloat(toStop)
      );
      const mtrStops = await findMtrStops(
        parseFloat(fromStop),
        parseFloat(toStop)
      );
      const gmbStops = await findGmbStops(
        parseFloat(fromStop),
        parseFloat(toStop)
      );

      const combinedResults = [...kmbStops, ...mtrStops, ...gmbStops].sort(
        (a, b) => a.distance - b.distance
      );

      setResults(
        combinedResults.map((stop, index) => ({
          id: String(index),
          summary: `${stop.name_en} (${stop.company}) - ${stop.distance}m`,
        }))
      );
    } catch (error) {
      console.error("Error planning route:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: t("routePlan") }} />
      <ThemedText style={styles.label}>{t("fromStop")}</ThemedText>
      <TextInput
        style={styles.input}
        value={fromStop}
        onChangeText={setFromStop}
        placeholder={t("enterFromStop")}
      />
      <ThemedText style={styles.label}>{t("toStop")}</ThemedText>
      <TextInput
        style={styles.input}
        value={toStop}
        onChangeText={setToStop}
        placeholder={t("enterToStop")}
      />
      <Button title={t("planRoute")} onPress={handlePlanRoute} />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemedText style={styles.resultItem}>{item.summary}</ThemedText>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  resultItem: {
    padding: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
  },
});
