// src/core/ComponentLoader.ts
import React from "react";

const modules = import.meta.glob("../themes/**/!(*.d).{tsx,jsx}", {
  eager: false,
});

const componentCache = new Map<string, React.ComponentType<any>>();

export function useComponent(
  theme: string,
  type: "steps" | "widgets" | "layouts",
  filename: string
) {
  const [Component, setComponent] =
    React.useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadComponent = async () => {
      setLoading(true);
      setError(null);

      // Buduj ścieżkę do komponentu
      const componentPath = `../themes/${theme}/${type}/${filename}`;
      const cacheKey = componentPath;

      // Sprawdź cache
      if (componentCache.has(cacheKey)) {
        setComponent(() => componentCache.get(cacheKey)!);
        setLoading(false);
        return;
      }

      // Znajdź matching moduł w glob imports
      const moduleKey = Object.keys(modules).find(
        (key) => key === componentPath
      );

      if (!moduleKey) {
        setError(`Component not found: ${componentPath}`);
        setLoading(false);
        return;
      }

      try {
        const module = await modules[moduleKey]();
        const component = (module as any).default;

        if (!component) {
          setError(`No default export in: ${componentPath}`);
          setLoading(false);
          return;
        }

        componentCache.set(cacheKey, component);
        setComponent(() => component);
      } catch (err) {
        setError(`Failed to load: ${componentPath}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [theme, type, filename]);

  return { Component, loading, error };
}

export function getAvailableThemes(): string[] {
  const themes = new Set<string>();

  Object.keys(modules).forEach((path) => {
    const match = path.match(/\.\.\/themes\/([^\/]+)\//);
    if (match) {
      themes.add(match[1]);
    }
  });

  return Array.from(themes);
}
