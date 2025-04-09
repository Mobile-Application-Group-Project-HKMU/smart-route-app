/**
 * Theme Styles Hook - Provides consistent styling based on current theme (light/dark)
 * 主题样式钩子 - 根据当前主题（明亮/暗黑）提供一致的样式
 */
import { StyleSheet } from 'react-native';
import { useColorScheme } from './useColorScheme';
import { Colors } from '@/constants/Colors';

/**
 * Custom hook that returns theme-based styles
 * 自定义钩子，返回基于主题的样式
 */
export function useThemeStyles() {
  // Get current theme or default to light theme
  // 获取当前主题，默认为亮色主题
  const theme = useColorScheme() ?? 'light';
  
  const styles = StyleSheet.create({
    // Main container style
    // 主容器样式
    container: {
      flex: 1,
      backgroundColor: Colors[theme].background,
    },
    // Card component style with theme-specific shadows
    // 卡片组件样式，包含特定主题的阴影效果
    card: {
      backgroundColor: Colors[theme].card,
      borderRadius: 10,
      padding: 12,
      shadowColor: theme === 'dark' ? '#000' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.2,
      shadowRadius: theme === 'dark' ? 2 : 1.5,
      elevation: 2,
    },
    // Section container style
    // 部分内容容器样式
    section: {
      marginBottom: 24,
    },
    // Section title style
    // 部分标题样式
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: Colors[theme].text,
      marginBottom: 12,
    },
    // Primary button style
    // 主按钮样式
    primaryButton: {
      backgroundColor: Colors[theme].buttonBackground,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Primary button text style
    // 主按钮文本样式
    primaryButtonText: {
      color: Colors[theme].buttonText,
      fontWeight: '500',
      fontSize: 16,
    },
    // Secondary button style
    // 次要按钮样式
    secondaryButton: {
      backgroundColor: Colors[theme].secondaryBackground,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Secondary button text style
    // 次要按钮文本样式
    secondaryButtonText: {
      color: Colors[theme].text,
      fontWeight: '500',
      fontSize: 16,
    },
    // Highlight container with theme-specific colors
    // 高亮容器，使用特定主题的颜色
    highlightContainer: {
      backgroundColor: theme === 'dark' ? '#3A2A15' : '#FFD580',
      borderRadius: 8,
      padding: 12,
    },
    // Highlight text style
    // 高亮文本样式
    highlightText: {
      color: theme === 'dark' ? '#FFD580' : '#8B4513',
      fontWeight: '500',
    },
    // Separator line style
    // 分隔线样式
    separatorLine: {
      height: 1,
      backgroundColor: Colors[theme].border,
      marginVertical: 16,
    },
    // Muted text style for less important text
    // 次要文本样式，用于不太重要的文字
    mutedText: {
      color: Colors[theme].muted,
      fontSize: 14,
    },
  });

  // Return the theme-aware styles
  // 返回随主题变化的样式
  return styles;
}
