import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { translations } from "./i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "fr");

  const setLanguageAndSave = useCallback((lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  }, []);

  const t = useCallback(
    (key, vars = {}) => {
      const dict = translations[language] || translations.fr;
      let str = dict[key] ?? translations.fr[key] ?? key;
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v);
      });
      return str;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage: setLanguageAndSave, t }),
    [language, setLanguageAndSave, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
