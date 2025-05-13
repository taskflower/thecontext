// src/themes/ThemeContext.tsx
import React, { createContext, useContext } from "react";

const ThemeContext = createContext<string>("default");

export const ThemeProvider: React.FC<{
  value: string;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);