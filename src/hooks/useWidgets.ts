// src/hooks/useWidgets.ts
import { useEffect, useState } from 'react';
import { useAppStore } from '@/hooks';
import { WidgetConfig } from '@/types';

// Rozszerzony interfejs dla wewnętrznego użytku, zawiera dodatkowe pola
interface ProcessedWidget extends WidgetConfig {
  id?: string;
  description?: string;
  [key: string]: any;
}

/**
 * Hook do zarządzania widgetami w aplikacji
 */
export function useWidgets(widgets: WidgetConfig[] = [], contextBasePath?: string) {
  const [widgetData, setWidgetData] = useState<ProcessedWidget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getContextPath, processTemplate } = useAppStore();
  
  // Sprawdza czy ścieżka jest absolutna
  const isAbsolutePath = (path: string): boolean => {
    if (!path || typeof path !== 'string') return false;
    return path.startsWith('data.') || path.includes('.');
  };

  useEffect(() => {
    const processWidgets = async () => {
      if (!widgets || widgets.length === 0) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const processedWidgets = await Promise.all(widgets.map(async (widget, index) => {
          const widgetTplFile = widget.tplFile || 'unknown'; // Zmienione z type na tplFile
          let widgetDataObj: ProcessedWidget = { ...widget };
          
          // Obsługa pojedynczej ścieżki danych
          if (widget.dataPath) {
            const fullPath = isAbsolutePath(widget.dataPath) 
              ? widget.dataPath 
              : contextBasePath ? `${contextBasePath}.${widget.dataPath}` : widget.dataPath;
                
            try {
              const pathData = getContextPath(fullPath);
              if (pathData !== undefined) {
                widgetDataObj.data = pathData;
              }
            } catch (err) {
              console.warn(`Error getting data from path ${widget.dataPath}:`, err);
            }
          }
          
          // Obsługa wielu ścieżek danych
          if (widget.dataPaths) {
            const mappedData: Record<string, any> = {};
            
            for (const [key, path] of Object.entries(widget.dataPaths)) {
              const fullPath = isAbsolutePath(path) 
                ? path 
                : contextBasePath ? `${contextBasePath}.${path}` : path;
                  
              try {
                const pathData = getContextPath(fullPath);
                if (pathData !== undefined) {
                  mappedData[key] = pathData;
                }
              } catch (err) {
                console.warn(`Error getting data from path ${path} for key ${key}:`, err);
              }
            }
            
            widgetDataObj.data = mappedData;
          }
          
          // Przetwarzanie szablonów
          if (widget.title) {
            widgetDataObj.title = processTemplate(widget.title);
          }
          
          if (widgetDataObj.description) {
            widgetDataObj.description = processTemplate(widgetDataObj.description);
          }
          
          return {
            ...widgetDataObj,
            id: widgetDataObj.id || `widget-${index}`,
            tplFile: widgetTplFile, // Zmienione na tplFile
          };
        }));
        
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