import React from 'react';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';
import { recordJourney, mapLocationToDistrict } from '@/util/achievements';
import { TransportCompany, TransportMode, TransportRoute } from '@/types/transport-types';
import * as Location from 'expo-location';

/**
 * Props for the JourneyRecorder component
 * JourneyRecorder组件的属性定义
 */
interface JourneyRecorderProps {
  route: TransportRoute;  // The transport route information | 交通路线信息
  onAchievementUnlocked?: () => void;  // Callback when an achievement is unlocked | 成就解锁时的回调函数
}

/**
 * A component that allows users to record their journey on public transport
 * 允许用户记录公共交通旅程的组件
 */
export default function JourneyRecorder({ route, onAchievementUnlocked }: JourneyRecorderProps) {
  const { t } = useLanguage();
  
  /**
   * Handles the journey recording process when the user presses the button
   * 当用户点击按钮时处理旅程记录过程
   */
  const handleRecordJourney = async () => {
    try {
      // Get current location | 获取当前位置
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          t('achievements.permission.title'),
          t('achievements.permission.message')
        );
        return;
      }
      
      // Fetch user's current GPS coordinates | 获取用户当前GPS坐标
      const location = await Location.getCurrentPositionAsync({});
      // Map coordinates to a district name | 将坐标映射到地区名称
      const district = mapLocationToDistrict(
        location.coords.latitude,
        location.coords.longitude
      );
      
      // Record the journey with relevant details | 记录旅程的相关详细信息
      const { newlyUnlockedAchievements } = await recordJourney(
        getTransportMode(route.co as TransportCompany),
        route.co as TransportCompany,
        route.route,
        route.orig_en || '',
        route.dest_en || '',
        district
      );
      
      // Show success message | 显示成功消息
      Alert.alert(
        t('achievements.journeyRecorded.title'),
        t('achievements.journeyRecorded.message')
      );
      
      // Show achievement notifications if any were unlocked | 如果解锁了任何成就，显示成就通知
      if (newlyUnlockedAchievements.length > 0) {
        const achievement = newlyUnlockedAchievements[0];
        Alert.alert(
          t('achievements.unlocked.title'),
          `${achievement.title.en}: ${achievement.description.en}`,
          [
            { 
              text: t('achievements.view'), 
              onPress: () => {
                if (onAchievementUnlocked) {
                  onAchievementUnlocked();
                }
              }
            },
            { text: t('common.dismiss') }
          ]
        );
      }
    } catch (error) {
      console.error('Failed to record journey:', error);
      Alert.alert(
        t('achievements.error.title'),
        t('achievements.error.message')
      );
    }
  };
  
  /**
   * Maps public transport companies to their corresponding transport modes
   * 将公共交通公司映射到其对应的交通模式
   * 
   * @param company The transport company code | 交通公司代码
   * @returns The corresponding transport mode | 对应的交通模式
   */
  const getTransportMode = (company: TransportCompany): TransportMode => {
    switch (company) {
      case 'KMB':   // Kowloon Motor Bus | 九龙巴士
      case 'CTB':   // Citybus | 城巴
      case 'NWFB':  // New World First Bus | 新世界第一巴士
        return 'BUS';
      case 'GMB':   // Green Minibus | 绿色小巴
        return 'MINIBUS';
      case 'MTR':   // Mass Transit Railway | 港铁
      case 'LR':    // Light Rail | 轻铁
        return 'MTR';
      case 'HKKF':  // Hong Kong & Kowloon Ferry | 港九小轮
      case 'SF':    // Star Ferry | 天星小轮
      case 'FF':    // Fortune Ferry | 富裕小轮
      case 'NLB':   // New Lantao Bus | 新大屿山巴士
        return 'FERRY';
      default:
        return 'BUS';
    }
  };
  
  // Render the journey recording button | 渲染旅程记录按钮
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handleRecordJourney}
    >
      <View style={styles.iconContainer}>
        <IconSymbol name="trophy.fill" size={24} color="#8B4513" />
      </View>
      <ThemedText style={styles.text}>{t('achievements.recordJourney')}</ThemedText>
    </TouchableOpacity>
  );
}

/**
 * Styles for the JourneyRecorder component
 * JourneyRecorder组件的样式
 */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',            // Horizontal layout | 水平布局
    alignItems: 'center',            // Vertically center items | 垂直居中项目
    backgroundColor: '#FFD580',      // Light orange background | 浅橙色背景
    borderRadius: 12,                // Rounded corners | 圆角
    paddingVertical: 10,             // Vertical padding | 垂直内边距
    paddingHorizontal: 16,           // Horizontal padding | 水平内边距
    marginBottom: 12,                // Bottom margin | 底部外边距
  },
  iconContainer: {
    marginRight: 10,                 // Right margin for spacing | 右侧外边距，提供间距
  },
  text: {
    fontSize: 16,                    // Text size | 文字大小
    fontWeight: '600',               // Semi-bold text | 半粗体文字
    color: '#8B4513',                // Brown text color | 棕色文字颜色
  }
});
