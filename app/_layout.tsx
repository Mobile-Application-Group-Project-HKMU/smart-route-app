// Import necessary packages and components for navigation, fonts, routing, and UI elements
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
// Import custom hooks and contexts
import { useColorScheme } from '@/hooks/useColorScheme';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Colors } from '@/constants/Colors';


// Prevent splash screen from auto-hiding until explicitly hidden
SplashScreen.preventAutoHideAsync();


// Define custom light theme by extending the default theme
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
export default function RootLayout() {
  // Get current color scheme (light/dark) from the custom hook
  const colorScheme = useColorScheme();
  // Load custom fonts and track loading state
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Return null while fonts are still loading
  if (!loaded) {
    return null;
  }

  // Render the app with language and theme providers
  return (
    // Wrap the app with language context for internationalization
    <LanguageProvider>
      {/* Apply the appropriate theme based on device color scheme */}
      <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomDefaultTheme}>
        {/* Configure navigation stack */}
        <Stack>
          {/* Main tab navigation with hidden header */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Screen for handling not found routes */}
          <Stack.Screen name="+not-found" />
        </Stack>
        {/* Status bar that adapts to current theme */}
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </LanguageProvider>
  );
}
