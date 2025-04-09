/**
 * Language Context - Manages application internationalization
 * 语言上下文 - 管理应用程序的国际化
 */
import { translations } from "@/translations";
import React, { createContext, useState, useContext, ReactNode } from "react";

/**
 * Supported languages: English, Traditional Chinese, Simplified Chinese
 * 支持的语言：英文、繁体中文、简体中文
 */
export type Language = "en" | "zh-Hant" | "zh-Hans";

/**
 * Language Context Props Interface
 * 语言上下文属性接口
 */
interface LanguageContextProps {
  language: Language;               // Current language / 当前语言
  setLanguage: (lang: Language) => void;  // Function to change language / 改变语言的函数
  t: (key: string, ...args: any[]) => string;  // Translation function / 翻译函数
}

/**
 * Create the Language Context with default values
 * 创建语言上下文，设置默认值
 */
const LanguageContext = createContext<LanguageContextProps>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

/**
 * Language Provider Component - Wraps the app to provide language functionality
 * 语言提供者组件 - 包装应用程序以提供语言功能
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with English as default language
  // 初始化，默认语言为英文
  const [language, setLanguage] = useState<Language>("en");

  /**
   * Translation function that supports variable interpolation
   * 支持变量插值的翻译函数
   * @param key - Translation key / 翻译键
   * @param args - Variables to interpolate / 要插入的变量
   * @returns Translated string / 翻译后的字符串
   */
  const t = (key: string, ...args: any[]): string => {
    // Get translation for current language or fallback to key
    // 获取当前语言的翻译，如果没有则返回原始键
    const translation =
      translations[key as keyof typeof translations]?.[language] || key;

    // Handle variable interpolation if needed and if translation exists
    // 如果需要且翻译存在，则处理变量插值
    if (args.length > 0 && translation !== key) {
      return translation.replace(/\{(\d+)\}/g, (_: string, index: string) => {
        const argIndex = parseInt(index, 10);
        return args[argIndex] !== undefined
          ? String(args[argIndex])
          : `{${index}}`;
      });
    }

    return translation;
  };

  // Provide language context to child components
  // 向子组件提供语言上下文
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Custom hook to use the language context
 * 使用语言上下文的自定义钩子
 */
export function useLanguage() {
  return useContext(LanguageContext);
}
