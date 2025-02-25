import type { LinguiConfig } from "@lingui/conf";

const config: LinguiConfig = {
  locales: ["en", "pl"],
  sourceLocale: "en",
  pseudoLocale: "pseudo",
  fallbackLocales: {
    default: "en",
  },
  format: "po",
  formatOptions: {
    origins: true,
    lineNumbers: true,
  },
  catalogs: [
    // {
    //   // Tłumaczenia dla "auth"
    //   path: "<rootDir>/src/locales/auth/{locale}",
    //   include: ["src/pages/auth/**/*.{js,jsx,ts,tsx}"],
    // },
    {
      // Tłumaczenia dla "boards"
      path: "<rootDir>/src/locales/boards/{locale}",
      include: ["src/pages/boards/**/*.{js,jsx,ts,tsx}"],
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
    {
      // Tłumaczenia dla wspólnych komponentów
      path: "<rootDir>/src/locales/common/{locale}",
      include: ["src/components/**/*.{js,jsx,ts,tsx}"],
    },
    {
      // Tłumaczenia dla layoutów
      path: "<rootDir>/src/locales/layouts/{locale}",
      include: ["src/layouts/**/*.{js,jsx,ts,tsx}"],
    },
    {
      // Tłumaczenia dla hooks
      path: "<rootDir>/src/locales/hooks/{locale}",
      include: ["src/hooks/**/*.{js,jsx,ts,tsx}"],
    },
    {
      // Tłumaczenia dla wiadomości systemowych i błędów
      path: "<rootDir>/src/locales/system/{locale}",
      include: ["src/services/**/*.{js,jsx,ts,tsx}"],
    }
  ],
  rootDir: ".",
  compileNamespace: "cjs",
  runtimeConfigModule: ["@lingui/core", "i18n"],
  orderBy: "messageId",
};

export default config;