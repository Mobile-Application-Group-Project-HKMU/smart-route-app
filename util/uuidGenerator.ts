/**
 * Simple UUID generator for React Native
 * This avoids issues with the uuid package that might not be compatible
 * with certain React Native configurations.
 * 
 * 适用于React Native的简单UUID生成器
 * 这避免了uuid包可能与某些React Native配置不兼容的问题。
 */
export function generateUUID(): string {
  // RFC4122 version 4 compliant UUID
  // 符合RFC4122版本4的UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
