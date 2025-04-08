// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight } from "expo-symbols";
import React from "react";
import { OpaqueColorValue, StyleProp, TextStyle, Platform } from "react-native";

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  "house.fill": "home",
  "paperplane.fill": "directions-bus",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "location.fill": "location-on",
  "star.fill": "star",
  star: "star-border",
  "arrow.clockwise": "refresh",
  "map.fill": "map",
  magnifyingglass: "search",
  "location.north.fill": "near-me",
  "arrow.triangle.turn.up.right.circle.fill": "directions",
  "location.circle.fill": "my-location",
  "info.circle.fill": "info",
  "gear.circle.fill": "settings",
  "xmark.circle.fill": "cancel",
  "mappin.circle.fill": "place",
  "bus.fill": "directions-bus",
  "tram.fill": "tram",
  "arrow.triangle.swap": "swap-vert",
  "figure.walk": "directions-walk",
  bus: "directions-bus",
  tram: "tram",
  "arrow.right": "arrow-forward",
  "arrow.right.circle": "arrow-circle-right",
  "chevron.down": "keyboard-arrow-down",
  "person.fill": "person",
  "person.crop.circle.fill": "account-circle",
  "checkmark.circle.fill": "check-circle",
  "clock.fill": "access-time-filled",
  clock: "access-time",
  ellipsis: "more-horiz",
  "ellipsis.circle": "more-horiz",
  "sun.max.fill": "wb-sunny",
  "moon.stars.fill": "nights-stay",
  "cloud.sun.fill": "wb-cloudy",
  "cloud.moon.fill": "nights-stay",
  "cloud.fill": "cloud",
  "smoke.fill": "cloud",
  "cloud.drizzle.fill": "grain",
  "cloud.rain.fill": "opacity",
  "cloud.bolt.fill": "bolt",
  "snow": "ac-unit",
  "cloud.fog.fill": "cloud",
  "humidity": "water-drop",
  "drop.fill": "opacity",
  "umbrella.fill": "beach-access",
} as Partial<
  Record<
    import("expo-symbols").SymbolViewProps["name"],
    React.ComponentProps<typeof MaterialIcons>["name"]
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * Helper function to determine if we're running on iOS
 */
const isIOS = Platform.OS === "ios";

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  // If the icon name isn't in our mapping, provide a sensible fallback
  const iconName = MAPPING[name] || "help-outline";

  return (
    <MaterialIcons color={color} size={size} name={iconName} style={style} />
  );
}
