/**
 * Language Switcher Component
 * 语言切换组件
 * 
 * This component allows users to switch between English, Traditional Chinese, and Simplified Chinese
 * 此组件允许用户在英文、繁体中文和简体中文之间切换
 */
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext'; // Import language context hook to manage language state | 导入语言上下文钩子以管理语言状态
import { ThemedText } from './ThemedText'; // Import themed text component | 导入主题文本组件

export default function LanguageSwitcher() {
  // Get current language and setter function from context | 从上下文中获取当前语言和设置函数
  const { language, setLanguage } = useLanguage();

  return (
    // Container for language buttons with horizontal layout | 水平布局的语言按钮容器
    <View style={styles.container}>
      {/* English language button | 英文语言按钮 */}
      <TouchableOpacity
        style={[styles.languageButton, language === 'en' && styles.activeLanguage]} // Apply active style when English is selected | 当选择英文时应用活动样式
        onPress={() => setLanguage('en')} // Change language to English when pressed | 点击时更改语言为英文
      >
        <ThemedText style={[styles.languageText, language === 'en' && styles.activeLanguageText]}>EN</ThemedText>
      </TouchableOpacity>
      
      {/* Traditional Chinese language button | 繁体中文语言按钮 */}
      <TouchableOpacity
        style={[styles.languageButton, language === 'zh-Hant' && styles.activeLanguage]} // Apply active style when Traditional Chinese is selected | 当选择繁体中文时应用活动样式
        onPress={() => setLanguage('zh-Hant')} // Change language to Traditional Chinese when pressed | 点击时更改语言为繁体中文
      >
        <ThemedText style={[styles.languageText, language === 'zh-Hant' && styles.activeLanguageText]}>繁</ThemedText>
      </TouchableOpacity>
      
      {/* Simplified Chinese language button | 简体中文语言按钮 */}
      <TouchableOpacity
        style={[styles.languageButton, language === 'zh-Hans' && styles.activeLanguage]} // Apply active style when Simplified Chinese is selected | 当选择简体中文时应用活动样式
        onPress={() => setLanguage('zh-Hans')} // Change language to Simplified Chinese when pressed | 点击时更改语言为简体中文
      >
        <ThemedText style={[styles.languageText, language === 'zh-Hans' && styles.activeLanguageText]}>简</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

// Styles for the language switcher component | 语言切换组件的样式
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Arrange buttons horizontally | 水平排列按钮
    borderRadius: 20, // Rounded corners for container | 容器的圆角
    backgroundColor: '#f0f0f0', // Light grey background | 浅灰色背景
    padding: 4, // Inner spacing | 内部间距
    justifyContent: 'center', // Center buttons horizontally | 水平居中按钮
    alignItems: 'center', // Center buttons vertically | 垂直居中按钮
  },
  languageButton: {
    paddingHorizontal: 12, // Horizontal padding for buttons | 按钮的水平内边距
    paddingVertical: 6, // Vertical padding for buttons | 按钮的垂直内边距
    borderRadius: 16, // Rounded corners for buttons | 按钮的圆角
    marginHorizontal: 2, // Horizontal spacing between buttons | 按钮之间的水平间距
  },
  activeLanguage: {
    backgroundColor: '#0a7ea4', // Blue background for active language | 活动语言的蓝色背景
  },
  languageText: {
    fontSize: 14, // Text size | 文本大小
    fontWeight: '500', // Medium text weight | 中等文本粗细
  },
  activeLanguageText: {
    color: 'white', // White text for active language | 活动语言的白色文本
  },
});
