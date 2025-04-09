import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import {
  CrowdLevel,
  getCrowdLevelColor,
  getCrowdLevelIcon,
  getCrowdLevelText,
} from "@/util/crowdPrediction";
import { useLanguage } from "@/contexts/LanguageContext";
import { IconSymbol } from "@/components/ui/IconSymbol";
// Import the correct type from expo-symbols
// 从expo-symbols导入正确的类型
import { SymbolViewProps } from "expo-symbols";

/**
 * Props for the CrowdIndicator component
 * CrowdIndicator组件的属性接口
 * 
 * @property level - Crowd level (e.g., low, medium, high)
 *                   拥挤程度 (例如: 低、中、高)
 * @property percentage - Optional fill percentage for the indicator bar
 *                        可选的指示条填充百分比
 * @property showText - Whether to display the text label (default: true)
 *                      是否显示文本标签 (默认: true)
 * @property size - Size variant of the indicator (default: "medium")
 *                  指示器的尺寸变体 (默认: "medium")
 */
interface CrowdIndicatorProps {
  level: CrowdLevel;
  percentage?: number;
  showText?: boolean;
  size?: "small" | "medium" | "large";
}

/**
 * CrowdIndicator - A component that visually represents crowd levels
 * CrowdIndicator - 可视化表示拥挤程度的组件
 * 
 * Displays an icon, optional percentage bar, and optional text label
 * 显示图标、可选的百分比条和可选的文本标签
 */
export function CrowdIndicator({
  level,
  percentage,
  showText = true,
  size = "medium",
}: CrowdIndicatorProps) {
  // Get current language from context
  // 从上下文获取当前语言
  const { language } = useLanguage();
  
  // Get color and icon based on crowd level
  // 根据拥挤程度获取颜色和图标
  const color = getCrowdLevelColor(level);
  const icon = getCrowdLevelIcon(level);

  // Determine icon and text size based on the size prop
  // 根据size属性确定图标和文本大小
  const iconSize = size === "small" ? 14 : size === "medium" ? 18 : 24;
  const textSize = size === "small" ? 12 : size === "medium" ? 14 : 16;

  return (
    <View style={styles.container}>
      {/* Icon representation of crowd level */}
      {/* 拥挤程度的图标表示 */}
      <IconSymbol
        name={icon as SymbolViewProps["name"]}
        size={iconSize}
        color={color}
      />
      
      {/* Optional percentage bar - only rendered if percentage prop is provided */}
      {/* 可选的百分比条 - 仅当提供percentage属性时渲染 */}
      {percentage && (
        <View style={[styles.percentageBar, { borderColor: color }]}>
          <View
            style={[
              styles.percentageFill,
              {
                backgroundColor: color,
                width: `${percentage}%`,
              },
            ]}
          />
        </View>
      )}
      
      {/* Optional text label - only rendered if showText is true */}
      {/* 可选的文本标签 - 仅当showText为true时渲染 */}
      {showText && (
        <ThemedText style={[styles.text, { fontSize: textSize, color }]}>
          {getCrowdLevelText(level, language)}
        </ThemedText>
      )}
    </View>
  );
}

/**
 * Styles for the CrowdIndicator component
 * CrowdIndicator组件的样式
 */
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  percentageBar: {
    height: 6,
    width: 40,
    borderRadius: 3,
    borderWidth: 1,
    overflow: "hidden",
  },
  percentageFill: {
    height: "100%",
  },
  text: {
    fontWeight: "500",
  },
});
