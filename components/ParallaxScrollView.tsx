import type { PropsWithChildren, ReactElement } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";

/**
 * Constants for the parallax effect / 视差效果的常量
 */
const HEADER_HEIGHT = 250;  // Header height in pixels / 头部高度（像素）

/**
 * ParallaxScrollView Component - A scroll view with parallax header effect
 * 视差滚动视图组件 - 带有视差效果头部的滚动视图
 * 
 * The header image moves at a different rate than the scrolling content,
 * creating a depth effect
 * 头部图像以与滚动内容不同的速率移动，创造出深度效果
 */
type Props = PropsWithChildren<{
  headerImage: ReactElement;                      // Header image component / 头部图像组件
  headerBackgroundColor: { dark: string; light: string };  // Header background colors for themes / 不同主题的头部背景色
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";  // Get current theme / 获取当前主题
  const scrollRef = useAnimatedRef<Animated.ScrollView>();  // Reference to the scroll view / 滚动视图的引用
  const scrollOffset = useScrollViewOffset(scrollRef);  // Get scroll position / 获取滚动位置
  const bottom = useBottomTabOverflow();  // Get bottom tab height / 获取底部标签栏高度
  
  // Define animated styles for the parallax header effect
  // 定义视差头部效果的动画样式
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          // Translate the header based on scroll position / 根据滚动位置平移头部
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          // Scale the header based on scroll position / 根据滚动位置缩放头部
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1]
          ),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      {/* Animated ScrollView with parallax effect / 带有视差效果的动画滚动视图 */}
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}  // Optimize scroll performance / 优化滚动性能
        scrollIndicatorInsets={{ bottom }}  // Adjust scroll indicator for bottom tabs / 为底部标签调整滚动指示器
        contentContainerStyle={{ paddingBottom: bottom }}  // Add padding for bottom tabs / 为底部标签添加内边距
      >
        {/* Parallax header with animation / 带动画效果的视差头部 */}
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}
        >
          {headerImage}
        </Animated.View>
        
        {/* Content container / 内容容器 */}
        <ThemedView style={styles.content}>
          {children}
        </ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

// Component styles / 组件样式
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: "visible",
  },
});
