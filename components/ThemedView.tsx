import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

/**
 * ThemedView Component - A View that adapts to the current theme
 * 主题视图组件 - 会根据当前主题自适应的视图组件
 * 
 * Extends the standard View component with theme-aware background colors
 * 扩展了标准View组件，背景色会根据主题自动调整
 */
export type ThemedViewProps = ViewProps & {
  lightColor?: string;  // Custom light theme color / 自定义亮色主题颜色
  darkColor?: string;   // Custom dark theme color / 自定义暗色主题颜色
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // Get the appropriate background color based on the current theme
  // 根据当前主题获取适当的背景颜色
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  // Return a View with the themed background color and other props
  // 返回一个带有主题背景色和其他属性的视图组件
  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
