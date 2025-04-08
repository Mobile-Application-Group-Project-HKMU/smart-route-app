// Import required React and React Native components
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
// Import navigation utilities from Expo Router
import { Stack, router } from 'expo-router';
// Import custom themed components for consistent UI
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
// Import language switching component
import LanguageSwitcher from '@/components/LanguageSwitcher';
// Import icon component for UI elements
import { IconSymbol } from '@/components/ui/IconSymbol';
// Import language context hook for translations
import { useLanguage } from '@/contexts/LanguageContext';

// Main Settings Screen component
export default function SettingsScreen() {
  // Get translation function from language context
  const { t } = useLanguage();
  
  return (
    // Main container with themed styling
    <ThemedView style={styles.container}>
      {/* Configure the screen header with title and back button */}
      <Stack.Screen options={{ 
        title: t('settings.title'),
        headerLeft: () => (
          // Back button with chevron icon
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color="#000000" />
          </TouchableOpacity>
        ),
      }} />
      
      {/* Language settings section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">{t('settings.language')}</ThemedText>
        <ThemedView style={styles.settingItem}>
          <LanguageSwitcher />
        </ThemedView>
      </ThemedView>
      

    </ThemedView>
  );
}

// Style definitions for the component
const styles = StyleSheet.create({
  // Main container styles - fills the screen with padding
  container: {
    flex: 1,
    padding: 16,
  },
  // Section container styles with bottom margin and item spacing
  section: {
    marginBottom: 24,
    gap: 16,
  },
  // Individual setting item style with top margin
  settingItem: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
 
  // Return button style with rounded corners and orange background
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD580',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    justifyContent: 'center',
  },
  // Text style for the return button
  returnButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#8B4513',
  },
});
