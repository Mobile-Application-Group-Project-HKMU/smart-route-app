import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';
import { WeatherData, getWeatherIcon } from '@/util/weather';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * WeatherInfo Component - Displays current weather information
 * 天气信息组件 - 显示当前天气信息
 * 
 * Renders either a compact or detailed weather card depending on the props
 * 根据传入的props渲染紧凑型或详细的天气信息卡片
 */
interface WeatherInfoProps {
  weatherData: WeatherData;  // Weather data object / 天气数据对象
  compact?: boolean;         // Whether to display in compact mode / 是否使用紧凑模式显示
}

export function WeatherInfo({ weatherData, compact = false }: WeatherInfoProps) {
  const { t } = useLanguage();  // Translation function / 翻译函数
  
  // Return null if weather data is missing / 如果天气数据缺失则返回null
  if (!weatherData || !weatherData.current) {
    return null;
  }
  
  // Extract and process weather data / 提取和处理天气数据
  const current = weatherData.current;
  const iconCode = current.weather[0]?.icon || '01d';  // Default to clear day if missing / 如果缺失则默认为晴天
  const iconName = getWeatherIcon(iconCode) as any;    // Convert API icon code to app icon name / 将API图标代码转换为应用图标名称
  const temperature = Math.round(current.temp);        // Round temperature / 四舍五入温度值
  const description = current.weather[0]?.description || '';  // Weather description / 天气描述
  const rainChance = weatherData.hourly[0]?.pop || 0;  // Probability of precipitation / 降水概率
  
  // Compact weather display for smaller spaces / 用于小空间的紧凑型天气显示
  if (compact) {
    return (
      <ThemedView style={styles.compactContainer}>
        <IconSymbol name={iconName} size={24} color="#0a7ea4" />
        <ThemedText style={styles.compactTemp}>{temperature}°C</ThemedText>
      </ThemedView>
    );
  }
  
  // Full weather display with details / 带有详细信息的完整天气显示
  return (
    <ThemedView style={styles.container}>
      {/* Header with icon and temperature / 带有图标和温度的标题栏 */}
      <View style={styles.header}>
        <IconSymbol name={iconName} size={36} color="#0a7ea4" />
        <ThemedText style={styles.temperature}>{temperature}°C</ThemedText>
      </View>
      
      {/* Weather description with first letter capitalized / 首字母大写的天气描述 */}
      <ThemedText style={styles.description}>
        {description.charAt(0).toUpperCase() + description.slice(1)}
      </ThemedText>
      
      {/* Additional weather details / 额外的天气详情 */}
      <View style={styles.detailsContainer}>
        {/* Humidity information / 湿度信息 */}
        <View style={styles.detailItem}>
          <IconSymbol name="humidity" size={16} color="#0a7ea4" />
          <ThemedText style={styles.detailText}>
            {current.humidity}% {t('humidity')}
          </ThemedText>
        </View>
        
        {/* Rain chance information / 降雨概率信息 */}
        <View style={styles.detailItem}>
          <IconSymbol name="drop.fill" size={16} color="#0a7ea4" />
          <ThemedText style={styles.detailText}>
            {Math.round(rainChance * 100)}% {t('rainChance')}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

// Styles for different layouts and elements / 不同布局和元素的样式
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  compactTemp: {
    marginLeft: 4,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  temperature: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
  },
});
