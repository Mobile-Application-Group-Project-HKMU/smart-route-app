// Import necessary packages and components for navigation, fonts, routing, and UI elements
// 导入必要的包和组件，用于导航、字体、路由和UI元素
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
// Import custom hooks and contexts
// 导入自定义钩子和上下文
import { useColorScheme } from '@/hooks/useColorScheme';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Colors } from '@/constants/Colors';


// Prevent splash screen from auto-hiding until explicitly hidden
// 防止启动屏幕自动隐藏，直到显式调用隐藏方法
SplashScreen.preventAutoHideAsync();


// Define custom light theme by extending the default theme
// 通过扩展默认主题来定义自定义亮色主题
const CustomDefaultTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

// Define custom dark theme by extending the dark theme
// 通过扩展暗色主题来定义自定义暗色主题
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
  },
};

// Root layout component that wraps the entire application
// 根布局组件，包装整个应用程序
export default function RootLayout() {
  // Get current color scheme (light/dark) from the custom hook
  // 从自定义钩子获取当前颜色方案（亮色/暗色）
  const colorScheme = useColorScheme();
  
  // Load custom fonts and track loading state
  // 加载自定义字体并跟踪加载状态
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Hide splash screen once fonts are loaded
  // 字体加载完成后隐藏启动屏幕
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Return null while fonts are still loading
  // 字体加载过程中返回null
  if (!loaded) {
    return null;
  }

  // Render the app with language and theme providers
  // 使用语言和主题提供者渲染应用程序
  return (
    // Wrap the app with language context for internationalization
    // 使用语言上下文包装应用程序以实现国际化
    <LanguageProvider>
      {/* Apply the appropriate theme based on device color scheme */}
      {/* 根据设备颜色方案应用适当的主题 */}
      <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomDefaultTheme}>
        {/* Configure navigation stack */}
        {/* 配置导航堆栈 */}
        <Stack>
          {/* Main tab navigation with hidden header */}
          {/* 主标签导航，隐藏头部 */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Screen for handling not found routes */}
          {/* 处理未找到路由的屏幕 */}
          <Stack.Screen name="+not-found" />
        </Stack>
        {/* Status bar that adapts to current theme */}
        {/* 适应当前主题的状态栏 */}
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </LanguageProvider>
  );
}
