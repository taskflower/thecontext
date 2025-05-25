// src/core/hooks/useComponent.tsx
import { useEffect, useState } from "react";
import type { ComponentHookResult, ThemeType } from "../types";

const modules = import.meta.glob("../../themes/**/!(*.d).{tsx,jsx}", {
  eager: false,
});
const cache = new Map<string, any>();

export function useComponent(
  theme: string,
  type: ThemeType,
  filename: string
): ComponentHookResult {
  const [Component, setComponent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const path = `../../themes/${theme}/${type}/${filename}`;
      const pathWithExt = `${path}.tsx`;
      const cacheKey = path;
      
      if (cache.has(cacheKey)) {
        setComponent(() => cache.get(cacheKey));
        setLoading(false);
        return;
      }

      // Sprawdź oba warianty - z rozszerzeniem i bez
      const key = Object.keys(modules).find(k => k === path || k === pathWithExt);
      
      if (!key) {
        setError(`Component not found: ${path}`);
        setLoading(false);
        return;
      }

      try {
        const mod = await modules[key]();
        const comp = (mod as any).default;
        if (!comp) throw new Error(`No default export: ${path}`);
        
        cache.set(cacheKey, comp);
        setComponent(() => comp);
      } catch (err) {
        setError(`Failed to load: ${path}`);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [theme, type, filename]);

  return { Component, loading, error };
}