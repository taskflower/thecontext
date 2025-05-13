// src/hooks/useWidget.ts (zoptymalizowana implementacja)
import { useConfig } from "@/ConfigProvider";
import { useMemo } from "react";

// Uproszczony hook useWidget
export const useWidget = (tplDir: string, widgetFile: string) => {
  const { preload } = useConfig();
  return useMemo(
    () => preload.widget(tplDir, widgetFile),
    [tplDir, widgetFile, preload]
  );
};

// Można dodać inne hooki związane z widgetami tutaj