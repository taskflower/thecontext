// src/core/hooks/usePreloader.ts
import { useMemo, ComponentType } from "react";
import { useConfig } from "@/ConfigProvider";
const componentCache = new Map<string, ComponentType<any>>();

export const usePreloader = <P = any>(
  type: "component" | "layout" | "widget",
  tplDir: string,
  name: string
): ComponentType<P> => {
  const { preload } = useConfig();

  return useMemo(() => {
    const cacheKey = `${type}:${tplDir}:${name}`;
    
    if (componentCache.has(cacheKey)) {
      return componentCache.get(cacheKey) as ComponentType<P>;
    }
    
    let component: ComponentType<P>;
    switch (type) {
      case "component":
        component = preload.component(tplDir, name) as ComponentType<P>;
        break;
      case "layout":
        component = preload.layout(tplDir, name) as ComponentType<P>;
        break;
      case "widget":
        component = preload.widget(tplDir, name) as ComponentType<P>;
        break;
      default:
        throw new Error(`Nieznany typ modułu: ${type}`);
    }
    
    componentCache.set(cacheKey, component);
    return component;
  }, [type, tplDir, name, preload]);
};

export const useComponent = <P = any>(
  tplDir: string,
  name: string
): ComponentType<P> => usePreloader<P>("component", tplDir, name);

export const useLayout = <P = any>(
  tplDir: string,
  name: string
): ComponentType<P> => usePreloader<P>("layout", tplDir, name);

export const useWidget = <P = any>(
  tplDir: string,
  name: string
): ComponentType<P> => usePreloader<P>("widget", tplDir, name);