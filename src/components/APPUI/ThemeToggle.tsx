
import React from "react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="theme-toggle"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
    </button>
  );
}