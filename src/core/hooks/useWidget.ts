import { preloadWidget } from "@/preload";
import { useMemo } from "react";

export const useWidget = (tplDir: string, widgetFile: string) =>
  useMemo(() => preloadWidget(tplDir, widgetFile), [tplDir, widgetFile]);
