import { Platform } from 'react-native';

/**
 * Detects if the app is running on iOS
 * 检测应用是否在iOS上运行
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Detects if the app is running on Android
 * 检测应用是否在Android上运行
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Detects if the app is running on Web
 * 检测应用是否在网页上运行
 */
export const isWeb = Platform.OS === 'web';

/**
 * Executes different functions based on platform.
 * This provides a cleaner alternative to platform-specific conditionals throughout the code.
 * 
 * 根据平台执行不同的函数。
 * 这提供了比代码中平台特定条件语句更清晰的替代方案。
 * 
 * @param options - Object containing platform-specific function implementations | 包含平台特定函数实现的对象
 * @returns Result of the platform-specific function | 平台特定函数的结果
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
 * Returns a platform-specific value.
 * Similar to platformSelect but works with values instead of functions.
 * 
 * 返回平台特定的值。
 * 与platformSelect类似，但使用值而不是函数。
 * 
 * @param options - Object containing platform-specific values | 包含平台特定值的对象
 * @returns The platform-specific value | 平台特定的值
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
