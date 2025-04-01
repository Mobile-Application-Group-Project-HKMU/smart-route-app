import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { ThemedView } from "@/components/ThemedView";

export default function PlanRedirect() {
  // Redirect to the tab-based route planner
  return <Redirect href="/(tabs)/plan" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
