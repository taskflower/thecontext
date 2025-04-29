// src/hooks/useWidgets.ts
import { useEffect, useState } from 'react';
import { useComponentLoader } from './useComponentLoader';
import { useAppStore } from '@/useAppStore';

// Definicja typu widgetu
export interface WidgetConfig {
  type: string;
  title?: string;
  description?: string;
  data?: any;
  dataPath?: string;
  dataPaths?: Record<string, string>;
  [key: string]: any;
}

/**
 * Hook do zarządzania widgetami w aplikacji
 * 
 * @param widgets Lista konfiguracji widgetów do wyrenderowania
 * @param contextBasePath Opcjonalna ścieżka bazowa dla kontekstu
 * @returns Przygotowane dane widgetów z załadowanymi komponentami
 */
export function useWidgets(widgets: WidgetConfig[] = [], contextBasePath?: string) {
  const [widgetData, setWidgetData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pobieranie kontekstu z useAppStore
  const { getContextPath, processTemplate } = useAppStore();

  useEffect(() => {
    const processWidgets = async () => {
      if (!widgets || widgets.length === 0) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Przetwarzanie każdego widgetu
        const processedWidgets = await Promise.all(widgets.map(async (widget, index) => {
          // Określ typ widgetu (może być bezpośrednio typ lub z nazwy pliku)
          const widgetType = widget.type || widget.file || 'unknown';
          
          // Przygotuj dane dla widgetu
          let widgetDataObj: any = { ...widget };
          
          // Jeśli jest określona ścieżka do danych, pobierz dane z kontekstu
          if (widget.dataPath) {
            const fullPath = contextBasePath 
              ? `${contextBasePath}.${widget.dataPath}` 
              : widget.dataPath;
              
            try {
              const pathData = getContextPath(fullPath);
              if (pathData !== undefined) {
                widgetDataObj.data = pathData;
              }
            } catch (err) {
              console.warn(`Error getting data from path: ${widget.dataPath}`, err);
            }
          }
          
          // Jeśli są określone multiple ścieżki danych, pobierz każdą z nich
          if (widget.dataPaths) {
            const mappedData: Record<string, any> = {};
            
            for (const [key, path] of Object.entries(widget.dataPaths)) {
              const fullPath = contextBasePath 
                ? `${contextBasePath}.${path}` 
                : path;
                
              try {
                const pathData = getContextPath(fullPath);
                if (pathData !== undefined) {
                  mappedData[key] = pathData;
                }
              } catch (err) {
                console.warn(`Error getting data from path: ${path} for key: ${key}`, err);
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
          
          // Zwróć przetworzone dane widgetu
          return {
            ...widgetDataObj,
            id: `widget-${index}`,
            type: widgetType,
          };
        }));
        
        setWidgetData(processedWidgets);
      } catch (err) {
        console.error('Error processing widgets:', err);
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