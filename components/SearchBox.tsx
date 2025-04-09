import { StyleSheet, TextInput } from "react-native";
import { ThemedView } from "./ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { IconSymbol } from "./ui/IconSymbol";

/**
 * SearchBox Component - A themed search input with icon
 * 搜索框组件 - 带图标的主题化搜索输入框
 * 
 * Provides a search input field that adapts to the current theme
 * 提供一个会根据当前主题自适应的搜索输入字段
 */
interface SearchBoxProps {
  placeholder: string;                    // Placeholder text / 占位符文本
  value: string;                          // Current input value / 当前输入值
  onChangeText: (text: string) => void;   // Change handler / 文本变化处理函数
}

export default function SearchBox({
  placeholder,
  value,
  onChangeText,
}: SearchBoxProps) {
  // Get current theme and appropriate colors / 获取当前主题和适当的颜色
  const colorScheme = useColorScheme() ?? "light";
  const textColor = Colors[colorScheme].text;
  const iconColor = Colors[colorScheme].icon;

  return (
    <ThemedView
      style={styles.container}
      lightColor="#f0f0f0"   // Custom light background / 自定义亮色背景
      darkColor="#2A2A2A"    // Custom dark background / 自定义暗色背景
    >
      {/* Search icon / 搜索图标 */}
      <IconSymbol name="paperplane.fill" size={20} color={iconColor} />
      
      {/* Search input field / 搜索输入字段 */}
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder={placeholder}
        placeholderTextColor={Colors[colorScheme].tabIconDefault}
        value={value}
        onChangeText={onChangeText}
      />
    </ThemedView>
  );
}

// Component styles / 组件样式
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    padding: 4,
  },
});
