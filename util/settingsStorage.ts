import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  language: 'en' | 'zh-Hant' | 'zh-Hans';
  theme: 'light' | 'dark' | 'system';
  showCrowdPredictions: boolean;
  // Add other settings here
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  theme: 'system',
  showCrowdPredictions: true,
};

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

export const saveSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  try {
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

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
