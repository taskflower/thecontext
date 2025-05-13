// src/core/hooks/usePreloader.ts
import { useMemo } from "react";
import { useConfig } from "@/ConfigProvider";
import { ComponentType } from "react";

export const usePreloader = <P = any>(
  type: "component" | "layout" | "widget",
  tplDir: string,
  name: string
): ComponentType<P> => {
  const { preload } = useConfig();

  return useMemo(() => {
    switch (type) {
      case "component":
        return preload.component(tplDir, name) as ComponentType<P>;
      case "layout":
        return preload.layout(tplDir, name) as ComponentType<P>;
      case "widget":
        return preload.widget(tplDir, name) as ComponentType<P>;
      default:
        throw new Error(`Nieznany typ modułu: ${type}`);
    }
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