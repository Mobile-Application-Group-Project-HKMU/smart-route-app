import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SettingsScreen() {
  const { t } = useLanguage();
  
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        title: t('settings.title'),
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color="#000000" />
          </TouchableOpacity>
        ),
      }} />
      
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">{t('settings.language')}</ThemedText>
        <ThemedView style={styles.settingItem}>
          <LanguageSwitcher />
        </ThemedView>
        <TouchableOpacity 
          style={styles.returnButton} 
          onPress={() => router.back()}
        >
          <IconSymbol name="arrow.left.circle.fill" size={20} color="#8B4513" />
          <ThemedText style={styles.returnButtonText}>{t('settings.return')}</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    gap: 16,
  },
  settingItem: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
 
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD580',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    justifyContent: 'center',
  },
  returnButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#8B4513',
  },
});
