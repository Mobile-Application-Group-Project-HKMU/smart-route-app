// Bus Route Card Component - Displays information about a bus route
// 巴士路线卡片组件 - 显示巴士路线的相关信息
import { StyleSheet, TouchableOpacity } from "react-native";
import { Route } from "@/util/kmb";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Language } from "@/contexts/LanguageContext";

// Props definition for BusRouteCard component
// BusRouteCard组件的属性定义
interface BusRouteCardProps {
  route: Route;        // Route object containing bus route details | 包含巴士路线详情的对象
  onPress: () => void; // Function to call when card is pressed | 卡片按下时调用的函数
  language?: Language; // Current language setting (default: English) | 当前语言设置（默认：英文）
}

// BusRouteCard Component: Displays a clickable card with bus route information
// BusRouteCard组件：显示包含巴士路线信息的可点击卡片
export default function BusRouteCard({
  route,
  onPress,
  language = "en",
}: BusRouteCardProps) {
  // Get current color scheme (light/dark)
  // 获取当前的颜色模式（亮色/暗色）
  const colorScheme = useColorScheme() ?? "light";

  // Returns origin station name based on selected language
  // 根据所选语言返回起始站名称
  const getTranslatedOrigin = () => {
    if (language === "en") return route.orig_en;
    return route.orig_tc;
  };

  // Returns destination station name based on selected language
  // 根据所选语言返回终点站名称
  const getTranslatedDestination = () => {
    if (language === "en") return route.dest_en;
    return route.dest_tc;
  };

  // Render the bus route card UI
  // 渲染巴士路线卡片UI
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {/* Main card container with theme-aware background */}
      {/* 主卡片容器，具有主题感知背景 */}
      <ThemedView style={styles.card} lightColor="#f5f5f5" darkColor="#333333">
        {/* Route number display with colored background */}
        {/* 带有彩色背景的路线号码显示 */}
        <ThemedView
          style={styles.routeNumberContainer}
          lightColor="#FFD580"
          darkColor="#8B4513"
        >
          <ThemedText style={styles.routeNumber}>{route.route}</ThemedText>
        </ThemedView>

        {/* Container for route details (direction, origin, destination) */}
        {/* 路线详情的容器（方向、起点、终点） */}
        <ThemedView style={styles.routeInfo}>
          {/* Direction and service type information */}
          {/* 方向和服务类型信息 */}
          <ThemedText style={styles.direction}>
            {route.bound === "I" ? "Inbound" : "Outbound"} • Service Type:{" "}
            {route.service_type}
          </ThemedText>

          {/* Origin and destination stations */}
          {/* 起始站和终点站 */}
          <ThemedView style={styles.destinations}>
            <ThemedText style={styles.destination} numberOfLines={1}>
              From: {getTranslatedOrigin()}
            </ThemedText>
            <ThemedText style={styles.destination} numberOfLines={1}>
              To: {getTranslatedDestination()}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

// Styles for the BusRouteCard component
// BusRouteCard组件的样式
const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    flexDirection: "row",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  routeNumberContainer: {
    borderRadius: 8,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 60,
    height: 60,
  },
  routeNumber: {
    fontWeight: "bold",
    fontSize: 20,
  },
  routeInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  direction: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  destinations: {
    gap: 4,
  },
  destination: {
    fontSize: 14,
  },
});
