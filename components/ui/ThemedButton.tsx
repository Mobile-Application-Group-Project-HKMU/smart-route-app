// ThemedButton Component - A customizable button that adapts to the app's theme
// ThemedButton 组件 - 一个可根据应用主题自适应的可定制按钮
import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Props interface for ThemedButton component
// ThemedButton 组件的属性接口
interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;  // Button text (按钮文本)
  variant?: 'primary' | 'secondary';  // Button style variant - primary or secondary (按钮样式变体 - 主要或次要)
}

export function ThemedButton({
  title,
  variant = 'primary',  // Default to primary variant if not specified (如果未指定，默认为主要变体)
  style,
  ...otherProps
}: ThemedButtonProps) {
  // Get current theme (light/dark) or default to light
  // 获取当前主题（浅色/深色）或默认为浅色
  const theme = useColorScheme() ?? 'light';
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        // Apply different background colors based on variant and theme
        // 根据变体和主题应用不同的背景颜色
        variant === 'primary'
          ? { backgroundColor: Colors[theme].buttonBackground }
          : { backgroundColor: Colors[theme].secondaryBackground },
        style,  // Allow custom styles to override defaults (允许自定义样式覆盖默认值)
      ]}
      activeOpacity={0.7}  // Reduce opacity when pressed (按下时降低不透明度)
      {...otherProps}
    >
      <ThemedText
        style={[
          styles.buttonText,
          // Apply different text colors based on variant and theme
          // 根据变体和主题应用不同的文本颜色
          variant === 'primary'
            ? { color: Colors[theme].buttonText }
            : { color: Colors[theme].text }
        ]}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

// Component styles
// 组件样式
const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,    // Vertical padding (垂直内边距)
    paddingHorizontal: 20,  // Horizontal padding (水平内边距)
    borderRadius: 8,        // Rounded corners (圆角)
    justifyContent: 'center',  // Center content vertically (垂直居中内容)
    alignItems: 'center',      // Center content horizontally (水平居中内容)
    flexDirection: 'row',      // Arrange children in a row (子元素横向排列)
  },
  buttonText: {
    fontWeight: '600',  // Semi-bold text (半粗体文本)
    fontSize: 16,       // Text size (文本大小)
  },
});
