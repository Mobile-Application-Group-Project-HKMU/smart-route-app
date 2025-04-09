// Import required React and React Native components
import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
// Import navigation utilities from Expo Router
import { Stack, router } from "expo-router";
// Import custom themed components for consistent UI
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
// Import language switching component
import LanguageSwitcher from "@/components/LanguageSwitcher";
// Import icon component for UI elements
import { IconSymbol } from "@/components/ui/IconSymbol";
// Import language context hook for translations
import { useLanguage } from "@/contexts/LanguageContext";
// Import settings storage utilities
import { getSettings, saveSettings } from "@/util/settingsStorage";

// Main Settings Screen component
export default function SettingsScreen() {
  // Get translation function from language context
  const { t } = useLanguage();
  const [showCrowdPredictions, setShowCrowdPredictions] = useState(true);

  useEffect(() => {
    // Load settings
    const loadSettings = async () => {
      const settings = await getSettings();
      setShowCrowdPredictions(settings.showCrowdPredictions);
    };

    loadSettings();
  }, []);

  // Function to handle the toggle
  const handleToggleCrowdPredictions = async () => {
    const newValue = !showCrowdPredictions;
    setShowCrowdPredictions(newValue);
    await saveSettings({ showCrowdPredictions: newValue });
  };

  return (
    // Main container with themed styling
    <ThemedView style={styles.container}>
      {/* Configure the screen header with title and back button */}
      <Stack.Screen
        options={{
          title: t("settings.title"),
          headerLeft: () => (
            // Back button with chevron icon
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color="#000000" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Language settings section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">{t("settings.language")}</ThemedText>
        <ThemedView style={styles.settingItem}>
          <LanguageSwitcher />
        </ThemedView>
      </ThemedView>

      {/* Crowd Prediction Toggle */}
      <ThemedView style={styles.settingItem}>
        <ThemedText style={styles.settingTitle}>
          {t("settings.crowdPredictions.title")}
        </ThemedText>
        <ThemedText style={styles.settingDescription}>
          {t("settings.crowdPredictions.description")}
        </ThemedText>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            showCrowdPredictions ? styles.toggleButtonActive : null,
          ]}
          onPress={handleToggleCrowdPredictions}
        >
          <ThemedView
            style={[
              styles.toggleKnob,
              showCrowdPredictions ? styles.toggleKnobActive : null,
            ]}
          />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

// Style definitions for the component
const styles = StyleSheet.create({
  // Main container styles - fills the screen with padding
  container: {
    flex: 1,
    padding: 16,
  },
  // Section container styles with bottom margin and item spacing
  section: {
    marginBottom: 24,
    gap: 16,
  },
  // Individual setting item style with top margin
  settingItem: {
    marginTop: 8,
    alignItems: "flex-start",
  },
  // Text styles for setting items
  settingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },

  // Return button style with rounded corners and orange background
  returnButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD580",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    justifyContent: "center",
  },
  // Text style for the return button
  returnButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#8B4513",
  },
  // Toggle button style
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0E0E0",
    padding: 2,
    marginTop: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#4CAF50",
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
});
