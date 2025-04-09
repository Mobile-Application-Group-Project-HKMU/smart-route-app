// ImpactCard.tsx - A card component to display impact metrics with an icon and value
// ImpactCard.tsx - 用于显示带有图标和数值的影响指标卡片组件

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from './IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Props interface for the ImpactCard component
// ImpactCard组件的属性接口
interface ImpactCardProps {
  icon: string;       // Icon name to display / 要显示的图标名称
  value: string | number; // The main value to display / 要显示的主要数值
  label: string;      // Description label for the value / 数值的描述标签
  color?: string;     // Optional custom color for the icon / 图标的可选自定义颜色
  suffix?: string;    // Optional suffix to display after the value / 数值后显示的可选后缀
}

// ImpactCard component - Displays a card with an icon, value, and label
// ImpactCard组件 - 显示包含图标、数值和标签的卡片
export default function ImpactCard({ icon, value, label, color, suffix }: ImpactCardProps) {
  // Get current color scheme (light/dark) or default to light
  // 获取当前颜色方案（浅色/深色）或默认为浅色
  const colorScheme = useColorScheme() ?? 'light';
  
  // Set background color based on color scheme
  // 根据颜色方案设置背景颜色
  const cardBgColor = colorScheme === 'light' ? '#f0f8ff' : '#1c2a43';
  
  // Use provided color or default to theme tint color
  // 使用提供的颜色或默认使用主题色调
  const iconColor = color || Colors[colorScheme].tint;
  
  return (
    // Card container with dynamic background color
    // 具有动态背景颜色的卡片容器
    <ThemedView style={[styles.card, { backgroundColor: cardBgColor }]}>
      {/* Icon container section */}
      {/* 图标容器部分 */}
      <View style={styles.iconContainer}>
        <IconSymbol 
          name={icon as any} 
          size={28} 
          color={iconColor} 
        />
      </View>
      
      {/* Content container with value and label */}
      {/* 包含数值和标签的内容容器 */}
      <View style={styles.contentContainer}>
        <ThemedText style={styles.value}>
          {value}{suffix && <ThemedText style={styles.suffix}>{suffix}</ThemedText>}
        </ThemedText>
        <ThemedText style={styles.label}>{label}</ThemedText>
      </View>
    </ThemedView>
  );
}

// Component styles
// 组件样式
const styles = StyleSheet.create({
  card: {
    borderRadius: 12,     // Rounded corners / 圆角
    padding: 16,          // Inner spacing / 内部间距
    marginBottom: 12,     // Bottom margin / 底部边距
    flexDirection: 'row', // Horizontal layout / 水平布局
    alignItems: 'center', // Vertical centering / 垂直居中
    shadowColor: "#000",  // Shadow settings for elevation effect / 阴影设置，用于立体效果
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,         // Android elevation / Android 上的海拔效果
    minWidth: '45%',      // Minimum width / 最小宽度
  },
  iconContainer: {
    marginRight: 16,      // Right margin for spacing from content / 右边距，与内容保持间距
  },
  contentContainer: {
    flex: 1,              // Take remaining space / 占用剩余空间
  },
  value: {
    fontSize: 18,         // Large font for emphasis / 较大字体以强调
    fontWeight: '700',    // Bold text / 粗体文本
    marginBottom: 4,      // Space between value and label / 数值和标签之间的间距
  },
  suffix: {
    fontSize: 14,         // Smaller font for suffix / 较小字体用于后缀
    fontWeight: '500',    // Medium weight for suffix / 中等字体重量用于后缀
    opacity: 0.7,         // Slightly transparent / 略微透明
    marginLeft: 2,        // Left margin for spacing / 左边距用于间距
  },
  label: {
    fontSize: 14,         // Font size for label / 标签的字体大小
    opacity: 0.7,         // Slightly transparent / 略微透明
  }
});
