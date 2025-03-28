import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemedText } from './ThemedText';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.languageButton, language === 'en' && styles.activeLanguage]}
        onPress={() => setLanguage('en')}
      >
        <ThemedText style={[styles.languageText, language === 'en' && styles.activeLanguageText]}>EN</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.languageButton, language === 'zh-Hant' && styles.activeLanguage]}
        onPress={() => setLanguage('zh-Hant')}
      >
        <ThemedText style={[styles.languageText, language === 'zh-Hant' && styles.activeLanguageText]}>繁</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.languageButton, language === 'zh-Hans' && styles.activeLanguage]}
        onPress={() => setLanguage('zh-Hans')}
      >
        <ThemedText style={[styles.languageText, language === 'zh-Hans' && styles.activeLanguageText]}>简</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  activeLanguage: {
    backgroundColor: '#0a7ea4',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeLanguageText: {
    color: 'white',
  },
});
