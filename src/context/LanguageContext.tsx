// src/context/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface LanguageContextValue {
  currentLang: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  currentLang: "en",
  setLanguage: () => {},
});

export const    LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang } = useParams<{ lang?: string }>();
  const [currentLang, setCurrentLang] = useState(lang || "en");

  useEffect(() => {
    if (lang) {
      setCurrentLang(lang);
    }
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage: setCurrentLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
