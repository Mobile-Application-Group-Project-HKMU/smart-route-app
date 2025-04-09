import { Route } from '@/util/kmb';
import { Language } from '@/contexts/LanguageContext';
import { TransportRoute } from '@/types/transport-types';
import TransportRouteCard from './TransportRouteCard';

// KmbRouteCard props interface - defines accepted properties
// KmbRouteCard 属性接口 - 定义接受的属性
interface KmbRouteCardProps {
  route: Route | TransportRoute;  // Route data from KMB API or formatted TransportRoute / 来自KMB API的路线数据或已格式化的TransportRoute
  onPress: () => void;            // Function to execute when card is pressed / 卡片按下时执行的函数
  language?: Language;            // UI language preference (default: 'en') / UI语言偏好（默认：'en'）
}

export default function KmbRouteCard({ route, onPress, language = 'en' }: KmbRouteCardProps) {
  // KMB theme colors (red theme for brand identity)
  // KMB主题颜色（红色主题，体现品牌标识）
  const colors = {
    light: '#FF5151', // Light red for highlights / 浅红色用于高亮显示
    dark: '#B30000',  // Dark red for borders and emphasis / 深红色用于边框和强调
    text: '#FFFFFF',  // White text for contrast / 白色文本提供对比度
  };
  
  // Transform input route to ensure compatibility with TransportRoute interface
  // This handles both Route objects from KMB API and existing TransportRoute objects
  // 转换输入的路线以确保与TransportRoute接口兼容
  // 这同时处理来自KMB API的Route对象和现有的TransportRoute对象
  const transportRoute: TransportRoute = {
    route: route.route,                   // Route number / 路线号码
    co: route.co || 'KMB',                // Company code (default to KMB) / 公司代码（默认为KMB）
    bound: route.bound,                   // Direction bound / 行驶方向
    service_type: route.service_type,     // Service type code / 服务类型代码
    orig_en: route.orig_en || '',         // Origin station (English) / 起始站（英文）
    dest_en: route.dest_en || '',         // Destination station (English) / 终点站（英文）
    orig_tc: typeof route.orig_tc === 'string' ? route.orig_tc : 
             route.orig_tc ? String(route.orig_tc) : undefined,  // Origin station (Traditional Chinese) / 起始站（繁体中文）
    dest_tc: typeof route.dest_tc === 'string' ? route.dest_tc : 
             route.dest_tc ? String(route.dest_tc) : undefined,  // Destination station (Traditional Chinese) / 终点站（繁体中文）
    data_timestamp: route.data_timestamp  // Data timestamp for freshness tracking / 数据时间戳，用于跟踪数据新鲜度
  };

  // Render transport route card with KMB styling and route information
  // 使用KMB样式和路线信息渲染交通路线卡片
  return (
    <TransportRouteCard 
      route={transportRoute} 
      onPress={onPress} 
      language={language}
      colors={colors}
    />
  );
}
