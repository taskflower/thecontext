// src/hooks/useComponents.ts - zoptymalizowana wersja
import { useState, useEffect } from "react";
import { useAppStore } from "@/hooks/useAppStore";
import { 
  getModulesByType, 
  buildComponentPath, 
  componentPathExists, 
  getTemplateDirectory 
} from "@/utils/components";

export const COMPONENT_TYPES = ["flowStep", "layout", "widget"] as const;
export type ComponentType = (typeof COMPONENT_TYPES)[number];

export function useComponents<T = any>(
  componentType: ComponentType,
  componentId: string,
  fallbackToDefault = true
) {
  const [component, setComponent] = useState<React.ComponentType<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentWorkspace = useAppStore((state) => state.getCurrentWorkspace);
  const getCurrentApplication = useAppStore((state) => state.getCurrentApplication);

  const workspace = getCurrentWorkspace();
  const app = getCurrentApplication();

  const tplDirName = getTemplateDirectory(workspace, app);

  useEffect(() => {
    const loadComponent = async () => {
      if (!componentId) return;

      setIsLoading(true);
      setError(null);

      try {
        const { mainPath, defaultPath } = buildComponentPath(
          tplDirName, 
          componentType, 
          componentId
        );

        const modules = getModulesByType(componentType);
        const modulePaths = Object.keys(modules);

        let loadedComponent = null;
        if (componentPathExists(modulePaths, mainPath)) {
          try {
            const module: any = await modules[mainPath]();
            if (module.default) {
              loadedComponent = module.default;
            } else {
              console.error(
                `Module loaded but no default export found at ${mainPath}`
              );
            }
          } catch (e) {
            console.error(
              `Error loading component from ${mainPath}:`,
              e
            );
          }
        } else {
          console.log(
            `%c[APP-DEBUG] Component not found at: ${mainPath}`,
            "background: #80322a; color: #fcfcfc; padding: 5px 10px; border-radius: 4px; border: 1px solid #ad5045;"
          );
        }

        if (!loadedComponent && fallbackToDefault && tplDirName !== "default") {
          if (componentPathExists(modulePaths, defaultPath)) {
            try {
              const module: any = await modules[defaultPath]();
              if (module.default) {
                loadedComponent = module.default;
              } else {
                console.error(
                  `Module loaded but no default export found at ${defaultPath}`
                );
              }
            } catch (e) {
              console.error(
                `Error loading fallback component from ${defaultPath}:`,
                e
              );
            }
          }
        }

        if (loadedComponent) {
          setComponent(() => loadedComponent);
        } else {
          const errorMsg = `Component not found: ${componentId} (${componentType})`;
          console.error(errorMsg, {
            path:
              tplDirName !== "default"
                ? `${mainPath} (fallback: ${defaultPath})`
                : mainPath,
          });
          setError(errorMsg);
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