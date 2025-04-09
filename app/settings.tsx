// Import required React and React Native components
// 导入所需的 React 和 React Native 组件
import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
// Import navigation utilities from Expo Router
// 从 Expo Router 导入导航工具
import { Stack, router } from "expo-router";
// Import custom themed components for consistent UI
// 导入自定义主题组件以保持 UI 一致性
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
// Import language switching component
// 导入语言切换组件
import LanguageSwitcher from "@/components/LanguageSwitcher";
// Import icon component for UI elements
// 导入用于 UI 元素的图标组件
import { IconSymbol } from "@/components/ui/IconSymbol";
// Import language context hook for translations
// 导入语言上下文钩子用于翻译
import { useLanguage } from "@/contexts/LanguageContext";
// Import settings storage utilities
// 导入设置存储工具
import { getSettings, saveSettings } from "@/util/settingsStorage";

// Main Settings Screen component
// 主设置屏幕组件
export default function SettingsScreen() {
  // Get translation function from language context
  // 从语言上下文中获取翻译函数
  const { t } = useLanguage();
  // State for crowd predictions toggle
  // 人群预测开关的状态
  const [showCrowdPredictions, setShowCrowdPredictions] = useState(true);

  useEffect(() => {
    // Load settings from storage on component mount
    // 组件挂载时从存储中加载设置
    const loadSettings = async () => {
      const settings = await getSettings();
      setShowCrowdPredictions(settings.showCrowdPredictions);
    };

    loadSettings();
  }, []);

  // Function to handle the toggle for crowd predictions
  // 处理人群预测开关切换的函数
  const handleToggleCrowdPredictions = async () => {
    // Toggle the current value
    // 切换当前值
    const newValue = !showCrowdPredictions;
    // Update state
    // 更新状态
    setShowCrowdPredictions(newValue);
    // Save to persistent storage
    // 保存到持久存储
    await saveSettings({ showCrowdPredictions: newValue });
  };

  return (
    // Main container with themed styling
    // 带有主题样式的主容器
    <ThemedView style={styles.container}>
      {/* Configure the screen header with title and back button */}
      {/* 配置带有标题和返回按钮的屏幕头部 */}
      <Stack.Screen
        options={{
          title: t("settings.title"),
          headerLeft: () => (
            // Back button with chevron icon
            // 带有箭头图标的返回按钮
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color="#000000" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Language settings section */}
      {/* 语言设置部分 */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">{t("settings.language")}</ThemedText>
        <ThemedView style={styles.settingItem}>
          <LanguageSwitcher />
        </ThemedView>
      </ThemedView>

      {/* Crowd Prediction Toggle Section */}
      {/* 人群预测开关部分 */}
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
          {/* Toggle switch knob that moves based on state */}
          {/* 基于状态移动的开关旋钮 */}
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
// 组件的样式定义
const styles = StyleSheet.create({
  // Main container styles - fills the screen with padding
  // 主容器样式 - 填充屏幕并添加内边距
  container: {
    flex: 1,
    padding: 16,
  },
  // Section container styles with bottom margin and item spacing
  // 部分容器样式，带有底部边距和项目间距
  section: {
    marginBottom: 24,
    gap: 16,
  },
  // Individual setting item style with top margin
  // 单个设置项的样式，带有顶部边距
  settingItem: {
    marginTop: 8,
    alignItems: "flex-start",
  },
  // Text styles for setting items
  // 设置项的文本样式
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
  // 返回按钮样式，带圆角和橙色背景
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
  // 返回按钮的文本样式
  returnButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#8B4513",
  },
  // Toggle button style - the background track
  // 开关按钮样式 - 背景轨道
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0E0E0",
    padding: 2,
    marginTop: 8,
  },
  // Active state style for toggle button
  // 开关按钮的激活状态样式
  toggleButtonActive: {
    backgroundColor: "#4CAF50",
  },
  // Toggle knob style - the moving part
  // 开关旋钮样式 - 移动部分
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
  // Active state style for toggle knob (moved position)
  // 开关旋钮的激活状态样式（移动位置）
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
});
