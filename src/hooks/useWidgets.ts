// src/hooks/useWidgets.ts
import { useEffect, useState } from 'react'; // Dodany import useState
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
  
  // Dodana funkcja pomocnicza do sprawdzania, czy ścieżka jest absolutna
  const isAbsolutePath = (path: string): boolean => {
    return path && typeof path === 'string' && path.includes('.');
  };

  useEffect(() => {
    const processWidgets = async () => {
      if (!widgets || widgets.length === 0) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Przetwarzanie widgetów z danymi:", widgets);
        console.log("Context base path:", contextBasePath);
        
        // Przetwarzanie każdego widgetu
        const processedWidgets = await Promise.all(widgets.map(async (widget, index) => {
          const widgetType = widget.type || widget.file || 'unknown';
          let widgetDataObj: any = { ...widget };
          
          // Obsługa pojedynczej ścieżki danych (dataPath)
          if (widget.dataPath) {
            // Kluczowa zmiana: sprawdź czy ścieżka jest absolutna
            const fullPath = isAbsolutePath(widget.dataPath) 
              ? widget.dataPath 
              : contextBasePath 
                ? `${contextBasePath}.${widget.dataPath}` 
                : widget.dataPath;
                
            try {
              console.log(`Pobieranie danych dla widgetu ${widgetType} ze ścieżki:`, fullPath);
              const pathData = getContextPath(fullPath);
              
              if (pathData !== undefined) {
                console.log(`Znaleziono dane dla ścieżki ${fullPath}:`, pathData);
                widgetDataObj.data = pathData;
              } else {
                console.warn(`Nie znaleziono danych dla ścieżki ${fullPath}`);
              }
            } catch (err) {
              console.warn(`Błąd pobierania danych ze ścieżki ${widget.dataPath}:`, err);
            }
          }
          
          // Obsługa wielu ścieżek danych (dataPaths)
          if (widget.dataPaths) {
            const mappedData: Record<string, any> = {};
            
            console.log(`Pobieranie wielu ścieżek dla widgetu ${widgetType}:`, widget.dataPaths);
            
            for (const [key, path] of Object.entries(widget.dataPaths)) {
              // Kluczowa zmiana: sprawdź czy ścieżka jest absolutna
              const fullPath = isAbsolutePath(path) 
                ? path 
                : contextBasePath 
                  ? `${contextBasePath}.${path}` 
                  : path;
                  
              try {
                console.log(`Pobieranie danych dla klucza ${key} ze ścieżki:`, fullPath);
                const pathData = getContextPath(fullPath);
                
                if (pathData !== undefined) {
                  console.log(`Znaleziono dane dla ścieżki ${fullPath}:`, pathData);
                  mappedData[key] = pathData;
                } else {
                  console.warn(`Nie znaleziono danych dla ścieżki ${fullPath}`);
                }
              } catch (err) {
                console.warn(`Błąd pobierania danych ze ścieżki ${path} dla klucza ${key}:`, err);
              }
            }
            
            console.log(`Zebrane dane dla widgetu ${widgetType}:`, mappedData);
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
        
        console.log("Przetworzone widgety z danymi:", processedWidgets);
        setWidgetData(processedWidgets);
      } catch (err) {
        console.error('Błąd przetwarzania widgetów:', err);
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