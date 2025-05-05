// src/hooks/useWidgets.ts - zoptymalizowana wersja
import { useEffect, useState } from "react";
import { useAppStore } from "@/hooks";
import { WidgetConfig } from "@/types";
import { resolveContextPath } from "@/utils/context";
import { getErrorMessage } from "@/utils/errors";

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

          if (widget.dataPath) {
            try {
              const fullPath = resolveContextPath(
                widget.dataPath,
                contextBasePath
              );
              const pathData = getContextPath(fullPath);
              if (pathData !== undefined) {
                widgetDataObj.data = pathData;
              }
            } catch (err) {
              console.warn(
                `Error getting data from path ${widget.dataPath}:`,
                getErrorMessage(err)
              );
            }
          }

          if (widget.dataPaths) {
            const mappedData: Record<string, any> = {};

            Object.entries(widget.dataPaths).forEach(([key, path]) => {
              try {
                const fullPath = resolveContextPath(path, contextBasePath);
                const pathData = getContextPath(fullPath);
                if (pathData !== undefined) {
                  mappedData[key] = pathData;
                }
              } catch (err) {
                console.warn(
                  `Error getting data from path ${path} for key ${key}:`,
                  getErrorMessage(err)
                );
              }
            });

            widgetDataObj.data = mappedData;
          }

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
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    processWidgets();
  }, [widgets, contextBasePath, getContextPath, processTemplate]);

  return { widgetData, isLoading, error };
}
