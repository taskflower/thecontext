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
  const tplDirName = workspace?.templateSettings?.tplDir || "default"; // Zmienione z template na tplDir

  useEffect(() => {
    const loadComponent = async () => {
      if (!componentId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Określ podstawową ścieżkę do komponentu w zależności od typu
        let tplPath = "";

        switch (componentType) {
          case "flowStep":
            tplPath = `/src/templates/${tplDirName}/flowSteps/${componentId}.tsx`;
            break;
          case "layout":
            tplPath = `/src/templates/${tplDirName}/layouts/${componentId}.tsx`;
            break;
          case "widget":
            tplPath = `/src/templates/${tplDirName}/widgets/${componentId}.tsx`;
            break;
        }

        const mds = getModulesByType(componentType);
        let loadedComponent = null;

        if (mds[tplPath]) {
          try {
            const md: any = await mds[tplPath]();
            if (md.default) {
              loadedComponent = md.default;
            }
          } catch (e) {
            console.error(`Error loading component from ${tplPath}:`, e);
          }
        }

        if (!loadedComponent && fallbackToDefault && tplDirName !== "default") {
          const defaultPath = tplPath.replace(`/${tplDirName}/`, "/default/");

          if (mds[defaultPath]) {
            try {
              const md: any = await mds[defaultPath]();
              if (md.default) {
                loadedComponent = md.default;
              }
            } catch (e) {
              console.error(
                `Error loading default component from ${defaultPath}:`,
                e
              );
            }
          }
        }

        if (loadedComponent) {
          setComponent(() => loadedComponent);
        } else {
          const errorMsg = `Component not found: ${componentId} (${componentType})`;
          setError(errorMsg);
          console.error(errorMsg, { path: tplPath });
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