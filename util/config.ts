import { Platform } from 'react-native';

/**
 * Configuration options for maps used throughout the application.
 * These settings control map provider selection based on platform and rendering options.
 * 
 * 应用程序中使用的地图配置选项。
 * 这些设置根据平台和渲染选项控制地图提供商的选择。
 */
export const mapConfig = {
  // Only use Google Maps provider on Android
  // Use the default Apple Maps on iOS to avoid the AirGoogleMaps error
  // For web, we'll use mock components
  // 仅在Android上使用Google Maps提供商
  // 在iOS上使用默认的Apple Maps以避免AirGoogleMaps错误
  // 对于网页版，我们将使用模拟组件
  useGoogleMapsProvider: Platform.OS === 'android',
  
  // Disable actual map rendering on web to prevent errors
  // 在网页上禁用实际地图渲染以防止错误
  shouldRenderMap: Platform.OS !== 'web',
};

/**
 * Global application configuration options.
 * Contains settings for caching, proximity searching, and other app-wide parameters.
 * 
 * 全局应用程序配置选项。
 * 包含缓存、临近搜索和其他应用范围参数的设置。
 */
export const appConfig = {
  // Cache time in milliseconds
  // 缓存时间（毫秒）
  apiCacheTTL: 5 * 60 * 1000, // 5 minutes | 5分钟
  // Default search radius in meters for nearby stops
  // 附近站点的默认搜索半径（米）
  defaultNearbyRadius: 500,
};
