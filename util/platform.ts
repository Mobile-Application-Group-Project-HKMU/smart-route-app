import { Platform } from 'react-native';

/**
 * Detects if the app is running on iOS
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Detects if the app is running on Android
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Detects if the app is running on Web
 */
export const isWeb = Platform.OS === 'web';

/**
 * Executes different functions based on platform
 * @param options Object containing platform-specific implementations
 * @returns Result of the platform-specific function
 */
export function platformSelect<T>({ 
  ios, 
  android, 
  web, 
  fallback 
}: {
  ios?: () => T;
  android?: () => T;
  web?: () => T;
  fallback?: () => T;
}): T | undefined {
  if (isIOS && ios) return ios();
  if (isAndroid && android) return android();
  if (isWeb && web) return web();
  if (fallback) return fallback();
  return undefined;
}

/**
 * Returns a platform-specific value
 * @param options Object containing platform-specific values
 * @returns The platform-specific value
 */
export function platformValue<T>({ 
  ios, 
  android, 
  web, 
  fallback 
}: {
  ios?: T;
  android?: T;
  web?: T;
  fallback?: T;
}): T | undefined {
  if (isIOS && ios !== undefined) return ios;
  if (isAndroid && android !== undefined) return android;
  if (isWeb && web !== undefined) return web;
  if (fallback !== undefined) return fallback;
  return undefined;
}
