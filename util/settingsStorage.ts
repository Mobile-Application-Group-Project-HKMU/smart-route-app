import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Interface for app settings configuration.
 * 应用程序设置配置的接口。
 */
export interface AppSettings {
  language: 'en' | 'zh-Hant' | 'zh-Hans'; // Language preference (English, Traditional Chinese, Simplified Chinese)
                                           // 语言偏好（英文、繁体中文、简体中文）
  theme: 'light' | 'dark' | 'system';      // UI theme preference (light, dark, or follow system)
                                           // UI主题偏好（亮色、暗色或跟随系统）
  showCrowdPredictions: boolean;           // Whether to show crowd predictions
                                           // 是否显示人流预测
  // Add other settings here
  // 在此处添加其他设置
}

/**
 * Default application settings.
 * 默认应用程序设置。
 */
const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  theme: 'system',
  showCrowdPredictions: true,
};

/**
 * Gets current app settings, falling back to defaults if none are saved.
 * 获取当前应用程序设置，如果没有保存设置则使用默认设置。
 * 
 * @returns Promise with the current settings
 * @returns 包含当前设置的Promise
 */
export const getSettings = async (): Promise<AppSettings> => {
  try {
    const settingsJson = await AsyncStorage.getItem('appSettings');
    if (settingsJson) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to get settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Saves app settings to persistent storage.
 * 将应用程序设置保存到持久存储。
 * 
 * @param settings - Partial settings to update
 * @param settings - 要更新的部分设置
 */
export const saveSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  try {
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

/**
 * Toggles the crowd predictions feature and saves the new setting.
 * 切换人流预测功能并保存新设置。
 * 
 * @returns Promise with the new state (true if enabled, false if disabled)
 * @returns 包含新状态的Promise（true表示启用，false表示禁用）
 */
export const toggleCrowdPredictions = async (): Promise<boolean> => {
  try {
    const settings = await getSettings();
    const newValue = !settings.showCrowdPredictions;
    await saveSettings({ showCrowdPredictions: newValue });
    return newValue;
  } catch (error) {
    console.error('Failed to toggle crowd predictions setting:', error);
    return false;
  }
};
