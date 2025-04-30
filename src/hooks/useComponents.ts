// src/hooks/useComponents.ts
import { useState, useEffect } from 'react';
import { useAppStore } from '@/useAppStore';

// Definicja typów komponentów
export const COMPONENT_TYPES = ['flowStep', 'layout', 'widget'] as const;
export type ComponentType = typeof COMPONENT_TYPES[number];

/**
 * Hook do dynamicznego ładowania komponentów z szablonów
 */
export function useComponents<T = any>(
  componentType: ComponentType,
  componentId: string,
  fallbackToDefault = true
) {
  const [component, setComponent] = useState<React.ComponentType<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pobierz template z bieżącego workspace
  const getCurrentWorkspace = useAppStore(state => state.getCurrentWorkspace);
  const workspace = getCurrentWorkspace();
  const templateName = workspace?.templateSettings?.template || 'default';
  
  useEffect(() => {
    const loadComponent = async () => {
      if (!componentId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const formattedId = formatComponentId(componentId);
        const paths = getPossiblePaths(templateName, componentType, formattedId);
        const modules = getModulesByType(componentType);
        let loadedComponent = null;
        
        // Próba załadowania z głównych ścieżek
        for (const path of paths) {
          if (modules[path]) {
            try {
              const module = await modules[path]();
              if (module.default) {
                loadedComponent = module.default;
                break;
              }
            } catch (err) {
              console.error(`Error loading component from ${path}:`, err);
            }
          }
        }
        
        // Jeśli nie znaleziono, próba załadowania domyślnego komponentu
        if (!loadedComponent && fallbackToDefault) {
          const defaultPaths = getPossiblePaths('default', componentType, formattedId);
          
          for (const path of defaultPaths) {
            if (modules[path]) {
              try {
                const module = await modules[path]();
                if (module.default) {
                  loadedComponent = module.default;
                  break;
                }
              } catch (err) {
                console.error(`Error loading default component from ${path}:`, err);
              }
            }
          }
        }
        
        if (loadedComponent) {
          setComponent(() => loadedComponent);
        } else {
          const errorMsg = `Component not found: ${componentId} (${componentType})`;
          setError(errorMsg);
          console.error(errorMsg, { possiblePaths: paths });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error(`Error loading component ${componentId}:`, err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadComponent();
  }, [templateName, componentType, componentId, fallbackToDefault]);
  
  return { component, error, isLoading };
}

// Funkcje pomocnicze
function formatComponentId(id: string): string {
  // Konwersja kebab-case na PascalCase
  return id
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function getPossiblePaths(
  templateName: string,
  componentType: ComponentType,
  componentId: string
): string[] {
  const paths: string[] = [];
  const base = `/src/templates/${templateName}`;
  
  switch (componentType) {
    case 'flowStep':
      paths.push(
        `${base}/flowSteps/${componentId}Template.tsx`,
        `${base}/flowSteps/${componentId}.tsx`,
        `${base}/components/${componentId}Template.tsx`,
        `${base}/components/${componentId}.tsx`
      );
      break;
    case 'layout':
      paths.push(
        `${base}/layouts/${componentId}Layout.tsx`,
        `${base}/layouts/${componentId}.tsx`,
        `${base}/components/${componentId}Layout.tsx`,
        `${base}/components/${componentId}.tsx`
      );
      break;
    case 'widget':
      paths.push(
        `${base}/widgets/${componentId}Widget.tsx`,
        `${base}/widgets/${componentId}.tsx`,
        `${base}/components/${componentId}Widget.tsx`,
        `${base}/components/${componentId}.tsx`,
        `${base}/widgets/${componentId.toLowerCase()}.tsx`,
        `${base}/widgets/card-list.tsx` // Specjalny przypadek
      );
      break;
  }
  
  return paths;
}

function getModulesByType(componentType: ComponentType) {
  switch (componentType) {
    case 'flowStep': return import.meta.glob('/src/templates/*/flowSteps/*.tsx');
    case 'layout': return import.meta.glob('/src/templates/*/layouts/*.tsx');
    case 'widget': return import.meta.glob('/src/templates/*/widgets/*.tsx');
    default: return import.meta.glob('/src/templates/*/*.tsx');
  }
}