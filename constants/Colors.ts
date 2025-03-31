/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#4dabcc'; // Adjusted to a lighter blue for better visibility in dark mode

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: '#f5f5f5',
    border: '#e0e0e0',
    buttonBackground: '#0a7ea4',
    buttonText: '#ffffff',
    secondaryBackground: '#f0f0f0',
    highlight: '#FFD580',
    highlightText: '#8B4513',
    muted: 'rgba(0, 0, 0, 0.7)',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    card: '#1e2022',
    border: '#2c2e30',
    buttonBackground: '#4dabcc',
    buttonText: '#ffffff',
    secondaryBackground: '#2a2c2e',
    highlight: '#8B4513',
    highlightText: '#FFD580',
    muted: 'rgba(255, 255, 255, 0.7)',
  },
};
