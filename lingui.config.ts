// lingui.config.ts
import type { LinguiConfig } from "@lingui/conf";

const config: LinguiConfig = {
  locales: ["en", "pl"],
  catalogs: [
    {
      // Tłumaczenia dla "auth"
      path: "<rootDir>/src/locales/auth/{locale}",
      include: ["src/routes/auth/**/*.{js,jsx,ts,tsx}"],
    },
    {
      // Tłumaczenia dla "boards"
      path: "<rootDir>/src/locales/boards/{locale}",
      include: ["src/routes/boards/**/*.{js,jsx,ts,tsx}"],
    },
    {
      // Tłumaczenia dla "documents"
      path: "<rootDir>/src/locales/documents/{locale}",
      include: ["src/pages/documents/**/*.{js,jsx,ts,tsx}"],
    },
    {
      // Tłumaczenia dla "projects"
      path: "<rootDir>/src/locales/projects/{locale}",
      include: ["src/pages/projects/**/*.{js,jsx,ts,tsx}"],
    },
    {
      // Tłumaczenia dla "public"
      path: "<rootDir>/src/locales/public/{locale}",
      include: ["src/pages/public/**/*.{js,jsx,ts,tsx}"],
    },
    {
      // Tłumaczenia dla "settings"
      path: "<rootDir>/src/locales/settings/{locale}",
      include: ["src/pages/settings/**/*.{js,jsx,ts,tsx}"],
    },
    {
      // Tłumaczenia dla "tasks"
      path: "<rootDir>/src/locales/tasks/{locale}",
      include: ["src/pages/tasks/**/*.{js,jsx,ts,tsx}"],
    },
    {
      // Tłumaczenia dla "users"
      path: "<rootDir>/src/locales/users/{locale}",
      include: ["src/pages/users/**/*.{js,jsx,ts,tsx}"],
    },
    {
      // Tłumaczenia dla "plugins"
      path: "<rootDir>/src/locales/plugins/{locale}",
      include: ["src/plugins/**/*.{js,jsx,ts,tsx}"],
    },
   
   
  ],
};

export default config;
