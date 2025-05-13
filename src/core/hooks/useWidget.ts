// src/core/hooks/useWidget.ts
import { useConfig } from "@/provideConfig";
import { useMemo } from "react";

export const useWidget = (tplDir: string, widgetFile: string) => {
  const { preload } = useConfig();
  return useMemo(() => preload.widget(tplDir, widgetFile), [tplDir, widgetFile]);
};