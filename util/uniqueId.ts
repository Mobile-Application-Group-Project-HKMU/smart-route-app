/**
 * Utility for generating unique identifiers.
 * This module will contain functions for creating unique IDs for various application purposes.
 * 
 * 生成唯一标识符的工具。
 * 此模块将包含为各种应用程序目的创建唯一ID的函数。
 */

/**
 * Generate a UUID v4 compatible string
 * @returns A unique identifier string
 */
export function generateUUID(): string {
  // Simple implementation of UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a simple numeric ID with optional prefix
 * @param prefix String to prepend to the ID
 * @returns A unique identifier with the given prefix
 */
export function generateSimpleId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
