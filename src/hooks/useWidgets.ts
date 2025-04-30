// src/hooks/useWidgets.ts
import { useEffect, useState } from 'react';
import { useAppStore } from '@/useAppStore';
import { WidgetConfig } from '@/types';

/**
 * Uproszczony hook do zarządzania widgetami w aplikacji
 */
export function useWidgets(widgets: WidgetConfig[] = [], contextBasePath?: string) {
  const [widgetData, setWidgetData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pobieranie kontekstu z useAppStore
  const { getContextPath, processTemplate } = useAppStore();
  
  // Funkcja pomocnicza do sprawdzania, czy ścieżka jest absolutna
  const isAbsolutePath = (path: string): boolean => {
    return path && typeof path === 'string' && path.startsWith('data.') || path.includes('.');
  };

  useEffect(() => {
    const processWidgets = async () => {
      if (!widgets || widgets.length === 0) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Przetwarzanie każdego widgetu
        const processedWidgets = await Promise.all(widgets.map(async (widget, index) => {
          const widgetType = widget.type || 'unknown';
          let widgetDataObj: any = { ...widget };
          
          // Obsługa pojedynczej ścieżki danych (dataPath)
          if (widget.dataPath) {
            const fullPath = isAbsolutePath(widget.dataPath) 
              ? widget.dataPath 
              : contextBasePath 
                ? `${contextBasePath}.${widget.dataPath}` 
                : widget.dataPath;
                
            try {
              const pathData = getContextPath(fullPath);
              
              if (pathData !== undefined) {
                widgetDataObj.data = pathData;
              }
            } catch (err) {
              console.warn(`Error getting data from path ${widget.dataPath}:`, err);
            }
          }
          
          // Obsługa wielu ścieżek danych (dataPaths)
          if (widget.dataPaths) {
            const mappedData: Record<string, any> = {};
            
            for (const [key, path] of Object.entries(widget.dataPaths)) {
              const fullPath = isAbsolutePath(path) 
                ? path 
                : contextBasePath 
                  ? `${contextBasePath}.${path}` 
                  : path;
                  
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
          
          // Przetwórz templaty w tytule i opisie
          if (widget.title) {
            widgetDataObj.title = processTemplate(widget.title);
          }
          
          if (widget.description) {
            widgetDataObj.description = processTemplate(widget.description);
          }
          
          return {
            ...widgetDataObj,
            id: widget.id || `widget-${index}`,
            type: widgetType,
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
  
  return {
    widgetData,
    isLoading,
    error
  };
}