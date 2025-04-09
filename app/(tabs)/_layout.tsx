import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme, Platform, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants/Colors";
import TabBarBackground, {
  useBottomTabOverflow,
} from "@/components/ui/TabBarBackground";
import { useLanguage } from "@/contexts/LanguageContext";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { router } from "expo-router";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const bottomTabOverflow = useBottomTabOverflow();
  const { t } = useLanguage();

  const navigateToAchievements = () => {
    router.push("/achievements");
  };
  
  const navigateToImpact = () => {
    router.push("/impact");
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarStyle: {
          // Default tab bar style on Android and Web
          ...Platform.select({
            ios: {
              padding: 0,
              paddingBottom: 0,
            },
            default: {
              backgroundColor: Colors[colorScheme].card,
              // Handle the necessary safe area spacing
              height: 56 + bottomTabOverflow,
              paddingBottom: bottomTabOverflow,
            },
          }),
        },
        // iOS-specific tab bar background
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <TabBarBackground />
          ) : (
            // Android and Web use a simple background
            // Background is set on tabBarStyle instead
            null
          ),
        // All screens share the same header configuration
        headerStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
        headerTintColor: Colors[colorScheme].text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerRight: () => (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={navigateToImpact} style={{ marginRight: 16 }}>
              <IconSymbol name="leaf.fill" size={24} color={Colors[colorScheme].tint} />
            </TouchableOpacity>
            <TouchableOpacity onPress={navigateToAchievements} style={{ marginRight: 16 }}>
              <IconSymbol name="trophy.fill" size={24} color={Colors[colorScheme].tint} />
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color }) => (
            <IconSymbol name="house.fill" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transport"
        options={{
          title: t("tabs.routes"),
          tabBarIcon: ({ color }) => (
            <IconSymbol name="bus.fill" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: t("tabs.plan"),
          tabBarIcon: ({ color }) => (
            <IconSymbol name="arrow.triangle.swap" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nearby"
        options={{
          title: t("tabs.nearby"),
          tabBarIcon: ({ color }) => (
            <IconSymbol name="location.fill" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
