// src/core/hooks/useComponent.tsx
import { ComponentType, useEffect, useState } from "react";
const modules = import.meta.glob("../themes/**/!(*.d).{tsx,jsx}", {
  eager: false,
});

const componentCache = new Map<string, ComponentType<any>>();
export function useComponent(
  theme: string,
  type: "steps" | "widgets" | "layouts",
  filename: string
) {
  const [Component, setComponent] = useState<ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComponent = async () => {
      setLoading(true);
      setError(null);

      const componentPath = `../themes/${theme}/${type}/${filename}`;
      const cacheKey = componentPath;

      if (componentCache.has(cacheKey)) {
        setComponent(() => componentCache.get(cacheKey)!);
        setLoading(false);
        return;
      }

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
