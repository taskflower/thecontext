// src/themes/ThemeContext.tsx
import { createContext, useContext } from "react";

/**
 * Kontekst motywu przekazujący katalog tplDir wszystkim komponentom.
 */
const ThemeContext = createContext<string>("default");

export const ThemeProvider = ThemeContext.Provider;
export const useTheme = (): string => useContext(ThemeContext);
