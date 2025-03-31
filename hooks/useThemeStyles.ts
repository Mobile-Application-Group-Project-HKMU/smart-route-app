import { StyleSheet } from 'react-native';
import { useColorScheme } from './useColorScheme';
import { Colors } from '@/constants/Colors';

export function useThemeStyles() {
  const theme = useColorScheme() ?? 'light';
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[theme].background,
    },
    card: {
      backgroundColor: Colors[theme].card,
      borderRadius: 10,
      padding: 12,
      shadowColor: theme === 'dark' ? '#000' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.2,
      shadowRadius: theme === 'dark' ? 2 : 1.5,
      elevation: 2,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: Colors[theme].text,
      marginBottom: 12,
    },
    primaryButton: {
      backgroundColor: Colors[theme].buttonBackground,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    primaryButtonText: {
      color: Colors[theme].buttonText,
      fontWeight: '500',
      fontSize: 16,
    },
    secondaryButton: {
      backgroundColor: Colors[theme].secondaryBackground,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: Colors[theme].text,
      fontWeight: '500',
      fontSize: 16,
    },
    highlightContainer: {
      backgroundColor: theme === 'dark' ? '#3A2A15' : '#FFD580',
      borderRadius: 8,
      padding: 12,
    },
    highlightText: {
      color: theme === 'dark' ? '#FFD580' : '#8B4513',
      fontWeight: '500',
    },
    separatorLine: {
      height: 1,
      backgroundColor: Colors[theme].border,
      marginVertical: 16,
    },
    mutedText: {
      color: Colors[theme].muted,
      fontSize: 14,
    },
  });

  return styles;
}
