// src/hooks/useComponents.ts
import { useState, useEffect } from "react";
import { useAppStore } from "@/hooks/useAppStore";

export const COMPONENT_TYPES = ["flowStep", "layout", "widget"] as const;
export type ComponentType = (typeof COMPONENT_TYPES)[number];

export function useComponents<T = any>(
  componentType: ComponentType,
  componentId: string,
  fallbackToDefault = true
) {
  const [component, setComponent] = useState<React.ComponentType<T> | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentWorkspace = useAppStore((state) => state.getCurrentWorkspace);
  const workspace = getCurrentWorkspace();
  const tplDirName = workspace?.templateSettings?.tplDir || "default";

  useEffect(() => {
    const loadComponent = async () => {
      if (!componentId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Get exact path based on component type
        let componentPath = "";

        switch (componentType) {
          case "flowStep":
            componentPath = `/src/templates/${tplDirName}/flowSteps/${componentId}`;
            break;
          case "layout":
            componentPath = `/src/templates/${tplDirName}/layouts/${componentId}`;
            break;
          case "widget":
            componentPath = `/src/templates/${tplDirName}/widgets/${componentId}`;
            break;
        }

        const modules = getModulesByType(componentType);
        let loadedComponent = null;

        // First, try with the exact name
        if (modules[`${componentPath}.tsx`]) {
          try {
            const module: any = await modules[`${componentPath}.tsx`]();
            if (module.default) {
              loadedComponent = module.default;
            }
          } catch (e) {
            console.error(`Error loading component from ${componentPath}.tsx:`, e);
          }
        }

        // If not found and fallback is enabled, try the default template
        if (!loadedComponent && fallbackToDefault && tplDirName !== "default") {
          const defaultPath = componentPath.replace(`/${tplDirName}/`, "/default/");
          
          if (modules[`${defaultPath}.tsx`]) {
            try {
              const module: any = await modules[`${defaultPath}.tsx`]();
              if (module.default) {
                loadedComponent = module.default;
              }
            } catch (e) {
              console.error(`Error loading default component from ${defaultPath}.tsx:`, e);
            }
          }
        }

        if (loadedComponent) {
          setComponent(() => loadedComponent);
        } else {
          const errorMsg = `Component not found: ${componentId} (${componentType})`;
          setError(errorMsg);
          console.error(errorMsg, { path: componentPath });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error(`Error loading component ${componentId}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [tplDirName, componentType, componentId, fallbackToDefault]);

  return { component, error, isLoading };
}

function getModulesByType(componentType: ComponentType) {
  switch (componentType) {
    case "flowStep":
      return import.meta.glob("/src/templates/*/flowSteps/*.tsx");
    case "layout":
      return import.meta.glob("/src/templates/*/layouts/*.tsx");
    case "widget":
      return import.meta.glob("/src/templates/*/widgets/*.tsx");
    default:
      return import.meta.glob("/src/templates/*/*.tsx");
  }
}