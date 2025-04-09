import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TransportRoute } from '@/types/transport-types';
import { MTR_COLORS } from '@/util/mtr';
import { Language } from '@/contexts/LanguageContext';
import { IconSymbol } from '@/components/ui/IconSymbol';

/**
 * Props for the MTR route card component
 * MTR路线卡片组件的属性
 */
interface MtrRouteCardProps {
  route: TransportRoute;    // Route data object | 路线数据对象
  onPress: () => void;      // Handler for card press event | 卡片点击事件处理函数
  language: Language;       // Current application language | 当前应用语言
}

/**
 * Component that displays an MTR route as a card with line information
 * 显示MTR路线信息卡片的组件
 */
export function MtrRouteCard({ route, onPress, language }: MtrRouteCardProps) {
  /**
   * Returns the appropriate line name based on the selected language
   * 根据所选语言返回适当的线路名称
   */
  const getLineName = () => {
    if (language === "en") {
      // English format: "[Route code] Line"
      // 英文格式：「[路线代码] Line」
      return `${route.route} Line`;
    } else if (language === "zh-Hans") {
      // Simplified Chinese names mapping
      // 简体中文名称映射
      const lineNames: Record<string, string> = {
        'AEL': '机场快线',
        'TCL': '东涌线',
        'TML': '屯马线',
        'TKL': '将军澳线',
        'EAL': '东铁线',
        'TWL': '荃湾线',
        'ISL': '港岛线',
        'KTL': '观塘线',
        'SIL': '南港岛线',
        'DRL': '迪士尼线'
      };
      return lineNames[route.route] || `${route.route}线`;
    } else {
      // Traditional Chinese names mapping (default)
      // 繁体中文名称映射（默认）
      const lineNames: Record<string, string> = {
        'AEL': '機場快線',
        'TCL': '東涌綫',
        'TML': '屯馬綫',
        'TKL': '將軍澳綫',
        'EAL': '東鐵綫',
        'TWL': '荃灣綫',
        'ISL': '港島綫',
        'KTL': '觀塘綫',
        'SIL': '南港島綫',
        'DRL': '迪士尼綫'
      };
      return lineNames[route.route] || `${route.route}綫`;
    }
  };

  /**
   * Returns the color code for the MTR line or a default color if not found
   * 返回MTR线路的颜色代码，如果找不到则返回默认颜色
   */
  const getRouteColor = () => MTR_COLORS[route.route as keyof typeof MTR_COLORS] || '#666666';

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {/* Main container for route info | 路线信息的主容器 */}
      <View style={styles.routeInfoContainer}>
        {/* Route code chip with line color | 带有线路颜色的路线代码徽章 */}
        <ThemedView style={[styles.routeChip, { backgroundColor: getRouteColor() }]}>
          <ThemedText style={styles.routeCode}>{route.route}</ThemedText>
        </ThemedView>
        
        {/* Route details section | 路线详情部分 */}
        <ThemedView style={styles.routeDetails}>
          <ThemedText style={styles.routeName}>{getLineName()}</ThemedText>
          {/* Origin to destination display | 始发站到终点站显示 */}
          <ThemedText style={styles.routePath}>
            {language === 'en' ? route.orig_en : route.orig_tc} → {language === 'en' ? route.dest_en : route.dest_tc}
          </ThemedText>
        </ThemedView>
      </View>
      
      {/* Right chevron icon for navigation | 用于导航的右箭头图标 */}
      <IconSymbol name="chevron.right" size={20} color="#808080" />
    </TouchableOpacity>
  );
}

/**
 * Styles for the MTR route card component
 * MTR路线卡片组件的样式
 */
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',           // Horizontal layout | 水平布局
    alignItems: 'center',           // Vertically centered | 垂直居中
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 12,
    justifyContent: 'space-between', // Space between route info and chevron | 路线信息和箭头之间的空间
  },
  routeInfoContainer: {
    flexDirection: 'row',           // Horizontal layout | 水平布局
    flex: 1,
    alignItems: 'center',           // Vertically centered | 垂直居中
  },
  routeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',           // Center content | 居中内容
    justifyContent: 'center',
  },
  routeCode: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  routeDetails: {
    marginLeft: 12,
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  routePath: {
    fontSize: 14,
    opacity: 0.7,                   // Slightly dimmed text | 略微暗淡的文字
  },
});

export default MtrRouteCard;
