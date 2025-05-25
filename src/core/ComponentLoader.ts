// src/core/ComponentLoader.ts
import { ComponentType, useEffect, useState } from "react";

type ThemeType = "steps" | "widgets" | "layouts";

interface ComponentHookResult<T = any> {
  Component: ComponentType<T> | null;
  loading: boolean;
  error: string | null;
}

const modules = import.meta.glob("../themes/**/!(*.d).{tsx,jsx}", {
  eager: false,
});

const cache = new Map<string, ComponentType<any>>();

export function useComponent(
  theme: string,
  type: ThemeType,
  filename: string
): ComponentHookResult {
  const [Component, setComponent] = useState<ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      const path = `../themes/${theme}/${type}/${filename}`;
      
      if (cache.has(path)) {
        setComponent(() => cache.get(path)!);
        setLoading(false);
        return;
      }

      const key = Object.keys(modules).find(k => k === path);
      if (!key) {
        setError(`Component not found: ${path}`);
        setLoading(false);
        return;
      }

      try {
        const mod = await modules[key]();
        const comp = (mod as { default: ComponentType<any> }).default;

        if (!comp) {
          setError(`No default export in: ${path}`);
          setLoading(false);
          return;
        }

        cache.set(path, comp);
        setComponent(() => comp);
      } catch (err) {
        setError(`Failed to load: ${path}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [theme, type, filename]);

  return { Component, loading, error };
}

export function getAvailableThemes(): string[] {
  const themes = new Set<string>();

  Object.keys(modules).forEach((path: string) => {
    const match = path.match(/\.\.\/themes\/([^\/]+)\//);
    if (match?.[1]) themes.add(match[1]);
  });

  return Array.from(themes);
}