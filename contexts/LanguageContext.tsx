import { translations } from "@/translations";
import React, { createContext, useState, useContext, ReactNode } from "react";

// Language types
export type Language = "en" | "zh-Hant" | "zh-Hans";

// Context interface
interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, ...args: any[]) => string;
}

// Create context with default values
const LanguageContext = createContext<LanguageContextProps>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

// Provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  // Translation function
  const t = (key: string, ...args: any[]): string => {
    // Get translation for current language
    const translation =
      translations[key as keyof typeof translations]?.[language] || key;

    // Handle arguments for string interpolation
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

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  return useContext(LanguageContext);
}
