// src/core/hooks/usePreloader.ts
import { useMemo, ComponentType } from "react";
import { useConfig } from "@/ConfigProvider";

// Stała mapa do cachowania wyników z komponentami szablonów
const componentCache = new Map<string, ComponentType<any>>();

export const usePreloader = <P = any>(
  type: "component" | "layout" | "widget",
  tplDir: string,
  name: string
): ComponentType<P> => {
  const { preload } = useConfig();

  return useMemo(() => {
    // Generowanie unikalnego klucza cache dla kombinacji typu, katalogu i nazwy
    const cacheKey = `${type}:${tplDir}:${name}`;
    
    // Sprawdzenie, czy komponent jest już w cache
    if (componentCache.has(cacheKey)) {
      return componentCache.get(cacheKey) as ComponentType<P>;
    }
    
    // Ładowanie komponentu przez preloader i zapisywanie do cache
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
    
    // Zapisanie do cache i zwrócenie
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