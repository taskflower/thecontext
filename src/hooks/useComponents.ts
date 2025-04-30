// src/hooks/useComponents.ts
import { useState, useEffect } from 'react';
import { useAppStore } from '@/useAppStore';

// Definicja typów komponentów
export const COMPONENT_TYPES = ['flowStep', 'layout', 'widget'] as const;
export type ComponentType = typeof COMPONENT_TYPES[number];

/**
 * Uproszczony hook do dynamicznego ładowania komponentów z szablonów.
 * Zastępuje useComponentLoader i upraszcza system szablonów.
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
        let loadedComponent = null;
        const formattedComponentId = formatComponentId(componentId);
        
        // Konstruuj możliwe ścieżki do komponentu
        const possiblePaths = getPossiblePaths(templateName, componentType, formattedComponentId);
        
        // Dynamicznie importuj moduły
        const modules = getModulesByType(componentType);
        
        // Spróbuj załadować z głównych ścieżek
        for (const path of possiblePaths) {
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
        
        // Jeśli nie znaleziono, spróbuj zastąpić nazwę komponentu
        if (!loadedComponent && fallbackToDefault) {
          const defaultPaths = getPossiblePaths('default', componentType, formattedComponentId);
          
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
          console.error(errorMsg, { possiblePaths });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        console.error(`Error loading component ${componentId}:`, err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadComponent();
  }, [templateName, componentType, componentId, fallbackToDefault]);
  
  return { component, error, isLoading };
}

// Funkcja formatująca ID komponentu
function formatComponentId(id: string): string {
  // Przekształca kebab-case na PascalCase (np. form-step => FormStep)
  return id
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// Funkcja generująca możliwe ścieżki
function getPossiblePaths(
  templateName: string,
  componentType: ComponentType,
  componentId: string
): string[] {
  const paths: string[] = [];
  
  switch (componentType) {
    case 'flowStep':
      paths.push(
        `/src/templates/${templateName}/flowSteps/${componentId}Template.tsx`,
        `/src/templates/${templateName}/flowSteps/${componentId}.tsx`,
        `/src/templates/${templateName}/components/${componentId}Template.tsx`,
        `/src/templates/${templateName}/components/${componentId}.tsx`
      );
      break;
    case 'layout':
      paths.push(
        `/src/templates/${templateName}/layouts/${componentId}Layout.tsx`,
        `/src/templates/${templateName}/layouts/${componentId}.tsx`,
        `/src/templates/${templateName}/components/${componentId}Layout.tsx`,
        `/src/templates/${templateName}/components/${componentId}.tsx`
      );
      break;
    case 'widget':
      paths.push(
        `/src/templates/${templateName}/widgets/${componentId}Widget.tsx`,
        `/src/templates/${templateName}/widgets/${componentId}.tsx`,
        `/src/templates/${templateName}/components/${componentId}Widget.tsx`,
        `/src/templates/${templateName}/components/${componentId}.tsx`,
        `/src/templates/${templateName}/widgets/${componentId.toLowerCase()}.tsx`,
        `/src/templates/${templateName}/widgets/card-list.tsx` // Specjalny przypadek dla CardListWidget
      );
      break;
  }
  
  return paths;
}

// Funkcja zwracająca odpowiednie dynamiczne importy według typu
function getModulesByType(componentType: ComponentType) {
  switch (componentType) {
    case 'flowStep':
      return import.meta.glob('/src/templates/*/flowSteps/*.tsx');
    case 'layout':
      return import.meta.glob('/src/templates/*/layouts/*.tsx');
    case 'widget':
      return import.meta.glob('/src/templates/*/widgets/*.tsx');
    default:
      return import.meta.glob('/src/templates/*/*.tsx');
  }
}