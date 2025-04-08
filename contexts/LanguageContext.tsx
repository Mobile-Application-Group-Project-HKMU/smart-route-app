import { translations } from "@/translations";
import React, { createContext, useState, useContext, ReactNode } from "react";


export type Language = "en" | "zh-Hant" | "zh-Hans";


interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, ...args: any[]) => string;
}


const LanguageContext = createContext<LanguageContextProps>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});


export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");


  const t = (key: string, ...args: any[]): string => {

    const translation =
      translations[key as keyof typeof translations]?.[language] || key;


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


export function useLanguage() {
  return useContext(LanguageContext);
}
