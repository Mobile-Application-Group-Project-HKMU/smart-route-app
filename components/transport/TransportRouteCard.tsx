// Import necessary components and hooks
// 导入必要的组件和钩子函数
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Language, useLanguage } from '@/contexts/LanguageContext';
import { TransportRoute } from '@/types/transport-types';
import { Colors } from '@/constants/Colors';


// Interface defining the props for the TransportRouteCard component
// 定义TransportRouteCard组件的属性接口
export interface TransportRouteCardProps {
  route: TransportRoute;      // Route information object | 路线信息对象
  onPress: () => void;        // Function to call when card is pressed | 卡片按下时调用的函数
  language?: Language;        // Optional language setting (defaults to 'en') | 可选语言设置（默认为'en'）
  colors: {                   // Colors configuration for the card | 卡片的颜色配置
    light: string;            // Light mode color | 亮色模式颜色
    dark: string;             // Dark mode color | 暗色模式颜色
    text: string;             // Text color | 文字颜色
  };
}
// Main component for displaying a transport route card
// 显示交通路线卡片的主要组件
export default function TransportRouteCard({ 
  route, 
  onPress, 
  language = 'en',
  colors 
}: TransportRouteCardProps) {
  const { t } = useLanguage();                      // Hook for translations | 用于翻译的钩子
  const colorScheme = useColorScheme() ?? 'light';  // Get current color scheme with fallback | 获取当前颜色方案，默认为亮色
  
  // Helper function to get the origin station name in the correct language
  // 辅助函数，用于获取正确语言的始发站名称
  const getTranslatedOrigin = () => {
    if (language === 'en') return route.orig_en || '';
    return route.orig_tc || '';
  };
  
  // Helper function to get the destination station name in the correct language
  // 辅助函数，用于获取正确语言的目的地站名称
  const getTranslatedDestination = () => {
    if (language === 'en') return route.dest_en || '';
    return route.dest_tc || '';
  };
  

  // Render the component UI
  // 渲染组件UI
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView 
        style={styles.card}
        lightColor={Colors.light.card}
        darkColor={Colors.dark.card}
      >
        {/* Route number badge with custom colors | 带有自定义颜色的路线号码徽章 */}
        <ThemedView 
          style={styles.routeNumberContainer} 
          lightColor={colors.light} 
          darkColor={colors.dark}
        >
          <ThemedText 
            style={[
              styles.routeNumber, 
              { color: colors.text }
            ]}
          >
            {route.route}
          </ThemedText>
        </ThemedView>
        
        {/* Route details section showing destination and origin | 路线详情部分，显示目的地和始发站 */}
        <ThemedView style={styles.routeDetails}>
          <ThemedText style={styles.routeDestination}>
            {getTranslatedDestination()}
          </ThemedText>
          <ThemedText style={styles.routeOrigin}>
            {t('bus.from')} {getTranslatedOrigin()}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

// Styles for the component
// 组件的样式定义
const styles = StyleSheet.create({
  card: {
    borderRadius: 10,            // Rounded corners | 圆角
    flexDirection: 'row',        // Horizontal layout | 水平布局
    padding: 12,                 // Inner spacing | 内部间距
    shadowColor: '#000',         // Shadow properties for depth effect | 阴影属性，用于深度效果
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,                // Android elevation for shadow | 安卓平台的阴影效果
    marginBottom: 10,            // Bottom margin between cards | 卡片之间的底部间距
  },
  routeNumberContainer: {
    borderRadius: 8,             // Rounded corners for route number box | 路线号码框的圆角
    padding: 8,                  // Inner spacing | 内部间距
    justifyContent: 'center',    // Center content vertically | 垂直居中内容
    alignItems: 'center',        // Center content horizontally | 水平居中内容
    minWidth: 60,                // Minimum width | 最小宽度
    height: 60,                  // Fixed height | 固定高度
  },
  routeNumber: {
    fontWeight: 'bold',          // Bold text for emphasis | 加粗文字以强调
    fontSize: 20,                // Larger font size | 较大字体大小
  },
  routeDetails: {
    flex: 1,                     // Take remaining space | 占用剩余空间
    marginLeft: 12,              // Left margin from route number | 与路线号码的左侧间距
    justifyContent: 'center',    // Center content vertically | 垂直居中内容
  },
  routeDestination: {
    fontSize: 14,                // Font size for destination | 目的地的字体大小
    marginBottom: 4,             // Bottom margin | 底部间距
  },
  routeOrigin: {
    fontSize: 12,                // Smaller font size for origin | 始发站较小的字体大小
    opacity: 0.7,                // Slightly transparent for less emphasis | 轻微透明以减少强调
  },
});
