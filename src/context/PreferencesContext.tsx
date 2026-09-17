import React, { createContext, useContext, useEffect, useState } from "react";
import { TRANSLATIONS, LanguageCode, TranslationDictionary } from "../translations";

export type AppTheme = "light" | "dark" | "system";
export type AppLanguage = LanguageCode;

interface PreferencesContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  isDarkMode: boolean;
  t: TranslationDictionary;
}

const PreferencesContext = createContext<PreferencesContextType>({
  theme: "light",
  setTheme: () => {},
  language: "it",
  setLanguage: () => {},
  isDarkMode: false,
  t: TRANSLATIONS.it,
});

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem("pinna_pref_theme");
      if (saved === "dark" || saved === "light" || saved === "system") return saved;
    } catch {
      // ignore
    }
    return "light";
  });

  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem("pinna_pref_lang") as AppLanguage;
      if (saved && TRANSLATIONS[saved]) return saved;
    } catch {
      // ignore
    }
    return "it";
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const isDarkMode = theme === "dark" || (theme === "system" && systemIsDark);

  useEffect(() => {
    try {
      localStorage.setItem("pinna_pref_theme", theme);
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // ignore
    }
  }, [theme, isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem("pinna_pref_lang", language);
      document.documentElement.lang = language;
    } catch {
      // ignore
    }
  }, [language]);

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
  };

  const setLanguage = (l: AppLanguage) => {
    setLanguageState(l);
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.it;

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
        isDarkMode,
        t,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => useContext(PreferencesContext);
