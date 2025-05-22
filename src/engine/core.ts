// engine/core.ts
import { useState, useEffect, ComponentType } from "react";
import type { Widget } from "./types";

export const useDynamicComponent = (path?: string, file?: string) => {
  const [component, setComponent] = useState<ComponentType<any> | null>(null);

  useEffect(() => {
    if (!path || !file) return;

    import(`/src/${path}/${file}`)
      .then((module) => setComponent(() => module.default))
      .catch(() => setComponent(null));
  }, [path, file]);

  return component;
};

export const useConfig = <T>(configPath: string) => {
  const [config, setConfig] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!configPath) return;

    setLoading(true);
    import(configPath)
      .then((module) => setConfig(module.default))
      .catch(() => setConfig(null))
      .finally(() => setLoading(false));
  }, [configPath]);

  return { config, loading };
};

export const useAppWidgets = (widgets: Widget[] = [], templateDir?: string) => {
  const [loadedWidgets, setLoadedWidgets] = useState<
    Array<{ Component: ComponentType<any> } & Widget>
  >([]);

  useEffect(() => {
    if (!widgets.length || !templateDir) return;

    Promise.all(
      widgets.map(async (widget) => {
        try {
          const module = await import(
            `/src/themes/${templateDir}/widgets/${widget.tplFile}`
          );
          return { Component: module.default, ...widget };
        } catch {
          return null;
        }
      })
    ).then((results) => {
      setLoadedWidgets(results.filter(Boolean) as any);
    });
  }, [widgets, templateDir]);

  return loadedWidgets;
};
