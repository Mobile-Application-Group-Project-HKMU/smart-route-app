import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme, Platform, TouchableOpacity, View, Text } from "react-native";
import { Colors } from "@/constants/Colors";
import TabBarBackground, {
  useBottomTabOverflow,
} from "@/components/ui/TabBarBackground";
import { useLanguage } from "@/contexts/LanguageContext";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { router } from "expo-router";

/**
 * TabLayout Component - Main navigation layout for the app's tab-based interface
 * 标签布局组件 - 应用程序基于标签的界面的主导航布局
 */
export default function TabLayout() {
  // Get current color scheme (light/dark) or default to light
  // 获取当前颜色方案（浅色/深色）或默认为浅色
  const colorScheme = useColorScheme() ?? "light";
  
  // Get the safe area overflow for bottom tabs to handle notches and home indicators
  // 获取底部标签的安全区域溢出量，以处理刘海屏和Home指示器
  const bottomTabOverflow = useBottomTabOverflow();
  
  // Get translation function for internationalization
  // 获取国际化翻译函数
  const { t } = useLanguage();

  /**
   * Navigate to the achievements screen
   * 导航到成就界面
   */
  const navigateToAchievements = () => {
    router.push("/achievements");
  };
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarStyle: {
          // Default tab bar style on Android and Web
          // Android和Web的默认标签栏样式
          ...Platform.select({
            ios: {
              padding: 0,
              paddingBottom: 0,
            },
            default: {
              backgroundColor: Colors[colorScheme].card,
              // Handle the necessary safe area spacing
              // 处理必要的安全区域间距
              height: 56 + bottomTabOverflow,
              paddingBottom: bottomTabOverflow,
            },
          }),
        },
        // iOS-specific tab bar background
        // iOS特定的标签栏背景
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <TabBarBackground />
          ) : (
            // Android and Web use a simple background
            // Background is set on tabBarStyle instead
            // Android和Web使用简单背景
            // 背景色已在tabBarStyle中设置
            null
          ),
        // All screens share the same header configuration
        // 所有屏幕共享相同的标题配置
        headerStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
        headerTintColor: Colors[colorScheme].text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        // Header right component with achievements button
        // 带有成就按钮的标题右侧组件
        headerRight: () => (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={navigateToAchievements} style={{ marginRight: 16, flexDirection: 'row', alignItems: 'center' }}>
              <IconSymbol name="trophy.fill" size={24} color={Colors[colorScheme].tint} />
              <Text style={{ marginLeft: 4, color: Colors[colorScheme].tint }}>{t("achievements.title")}</Text>
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      {/* Home Tab - Shows favorites and quick access features
          主页标签 - 显示收藏和快速访问功能 */}
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color }) => (
            <IconSymbol name="house.fill" size={24} color={color} />
          ),
        }}
      />
      {/* Transport Tab - Browse routes and transport options
          交通标签 - 浏览路线和交通选项 */}
      <Tabs.Screen
        name="transport"
        options={{
          title: t("tabs.routes"),
          tabBarIcon: ({ color }) => (
            <IconSymbol name="bus.fill" size={24} color={color} />
          ),
        }}
      />
      {/* Plan Tab - Plan journeys between locations
          规划标签 - 规划地点之间的行程 */}
      <Tabs.Screen
        name="plan"
        options={{
          title: t("tabs.plan"),
          tabBarIcon: ({ color }) => (
            <IconSymbol name="arrow.triangle.swap" size={24} color={color} />
          ),
        }}
      />
      {/* Nearby Tab - Find nearby stops and stations
          附近标签 - 查找附近的站点和车站 */}
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
