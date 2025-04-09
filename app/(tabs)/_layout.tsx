import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme, Platform, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/Colors";
import TabBarBackground, {
  useBottomTabOverflow,
} from "@/components/ui/TabBarBackground";
import { useLanguage } from "@/contexts/LanguageContext";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { router } from "expo-router";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const { t } = useLanguage();
  const overflow = useBottomTabOverflow();

  const navigateToAchievements = () => {
    router.push('/achievements');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + overflow,
          paddingBottom: overflow,
          backgroundColor:
            Platform.OS === "ios" ? "transparent" : Colors[colorScheme].card,
        },
        tabBarBackground:
          Platform.OS === "ios" ? () => <TabBarBackground /> : undefined,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
        headerRight: () => (
          <TouchableOpacity onPress={navigateToAchievements} style={{ marginRight: 16 }}>
            <IconSymbol name="trophy.fill" size={24} color={Colors[colorScheme].tint} />
          </TouchableOpacity>
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
