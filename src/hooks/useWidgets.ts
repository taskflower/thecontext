// src/hooks/useWidgets.ts - zoptymalizowana wersja
import { useEffect, useState } from "react";
import { useAppStore } from "@/hooks";
import { WidgetConfig } from "@/types";

interface ProcessedWidget extends WidgetConfig {
  description?: string;
  [key: string]: any;
}

export function useWidgets(
  widgets: WidgetConfig[] = [],
  contextBasePath?: string
) {
  const [widgetData, setWidgetData] = useState<ProcessedWidget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getContextPath, processTemplate } = useAppStore();

  // Ulepszona funkcja sprawdzająca typ ścieżki
  const resolveContextPath = (path: string): string => {
    if (!path) return "";
    // Wykorzystaj prostszą logikę - jeśli ścieżka zawiera kropkę, uznaj ją za absolutną
    return path.includes(".")
      ? path
      : contextBasePath
      ? `${contextBasePath}.${path}`
      : path;
  };

  useEffect(() => {
    if (!widgets || widgets.length === 0) return;

    const processWidgets = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const processedWidgets = widgets.map((widget, index) => {
          const widgetTplFile = widget.tplFile || "unknown";
          let widgetDataObj: ProcessedWidget = {
            ...widget,
            id: widget.id || `widget-${index}`,
            tplFile: widgetTplFile,
          };

          // Obsługa pojedynczej ścieżki danych - bardziej efektywna
          if (widget.dataPath) {
            try {
              const fullPath = resolveContextPath(widget.dataPath);
              const pathData = getContextPath(fullPath);
              if (pathData !== undefined) {
                widgetDataObj.data = pathData;
              }
            } catch (err) {
              console.warn(
                `Error getting data from path ${widget.dataPath}:`,
                err
              );
            }
          }

          // Obsługa wielu ścieżek danych - ulepszona
          if (widget.dataPaths) {
            const mappedData: Record<string, any> = {};

            Object.entries(widget.dataPaths).forEach(([key, path]) => {
              try {
                const fullPath = resolveContextPath(path);
                const pathData = getContextPath(fullPath);
                if (pathData !== undefined) {
                  mappedData[key] = pathData;
                }
              } catch (err) {
                console.warn(
                  `Error getting data from path ${path} for key ${key}:`,
                  err
                );
              }
            });

            widgetDataObj.data = mappedData;
          }

          // Przetwarzanie szablonów - zoptymalizowane
          if (widget.title) {
            widgetDataObj.title = processTemplate(widget.title);
          }

          if (widgetDataObj.description) {
            widgetDataObj.description = processTemplate(
              widgetDataObj.description
            );
          }

          return widgetDataObj;
        });

        setWidgetData(processedWidgets);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    processWidgets();
  }, [widgets, contextBasePath, getContextPath, processTemplate]);

  return { widgetData, isLoading, error };
}
