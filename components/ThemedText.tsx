import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * ThemedText Component - A Text component that adapts to the current theme
 * 主题文本组件 - 根据当前主题自适应的文本组件
 * 
 * Supports multiple predefined text styles and theme-aware colors
 * 支持多种预定义文本样式和主题感知颜色
 */
export type ThemedTextProps = TextProps & {
  lightColor?: string;  // Custom light theme color / 自定义亮色主题颜色
  darkColor?: string;   // Custom dark theme color / 自定义暗色主题颜色
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'muted';  // Text style type / 文本样式类型
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',  // Default text style if not specified / 未指定时的默认文本样式
  ...rest
}: ThemedTextProps) {
  const theme = useColorScheme() ?? 'light';  // Get current theme or default to light / 获取当前主题或默认为亮色主题
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');  // Get theme-aware text color / 获取主题感知的文本颜色

  return (
    <Text
      style={[
        { color },
        // Apply the appropriate style based on the type prop / 根据type属性应用相应的样式
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'muted' ? [styles.muted, { color: Colors[theme].muted }] : undefined,
        style,  // Custom style overrides / 自定义样式覆盖
      ]}
      {...rest}
    />
  );
}

// Predefined text styles for different purposes / 不同用途的预定义文本样式
const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
  muted: {
    fontSize: 14,
    opacity: 0.7,
  },
});
