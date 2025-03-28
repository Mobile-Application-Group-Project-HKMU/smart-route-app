import React, { createContext, useState, useContext, ReactNode } from 'react';
import translations from '../translations';

// Define the available languages
export type Language = 'en' | 'zh-Hant' | 'zh-Hans';

// Define the context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, ...args: any[]) => string;
}

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: () => '',
});

// Provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Translation function
  const t = (key: string, ...args: any[]): string => {
    // Get the translation
    const translation = translations[key]?.[language];
    
    if (!translation) {
      console.warn(`Translation key not found: "${key}"`);
      return key;
    }

    // Replace placeholders with arguments
    return args.reduce((result, arg, index) => {
      return result.replace(`{${index}}`, String(arg));
    }, translation);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);