import { Platform } from 'react-native';

// Configuration options for maps
export const mapConfig = {
  // Only use Google Maps provider on Android
  // Use the default Apple Maps on iOS to avoid the AirGoogleMaps error
  // For web, we'll use mock components
  useGoogleMapsProvider: Platform.OS === 'android',
  
  // Disable actual map rendering on web to prevent errors
  shouldRenderMap: Platform.OS !== 'web',
};

// Other global configuration options
export const appConfig = {
  // Cache time in milliseconds
  apiCacheTTL: 5 * 60 * 1000, // 5 minutes
  // Default search radius in meters for nearby stops
  defaultNearbyRadius: 500,
};
