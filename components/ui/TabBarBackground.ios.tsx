import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint={colorScheme === "dark" ? "dark" : "light"}
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  let tabHeight = 0;
  const { bottom } = useSafeAreaInsets();

  try {
    // This will throw an error if not inside a Bottom Tab Navigator
    tabHeight = useBottomTabBarHeight();
  } catch (error) {
    // Default fallback value for tab height if not in a tab navigator
    tabHeight = bottom + 49; // 49 is the default tab bar height in iOS
  }

  return tabHeight - bottom;
}
