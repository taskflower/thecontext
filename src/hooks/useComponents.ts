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

  // Get current application and workspace
  const getCurrentWorkspace = useAppStore((state) => state.getCurrentWorkspace);
  const getCurrentApplication = useAppStore(
    (state) => state.getCurrentApplication
  );

  const workspace = getCurrentWorkspace();
  const app = getCurrentApplication();

  // Try to get tplDir from multiple places in order of priority
  const getTplDir = () => {
    if (workspace?.templateSettings?.tplDir) {
      console.log(
        "Using tplDir from workspace.templateSettings:",
        workspace.templateSettings.tplDir
      );
      return workspace.templateSettings.tplDir;
    }

    if (app?.tplDir) {
      return app.tplDir;
    }

    console.log("No tplDir found, using default");
    return "default";
  };

  const tplDirName = getTplDir();

  useEffect(() => {
    const loadComponent = async () => {
      if (!componentId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Get directory path based on component type
        let componentDir;
        switch (componentType) {
          case "flowStep":
            componentDir = "flowSteps";
            break;
          case "layout":
            componentDir = "layouts";
            break;
          case "widget":
            componentDir = "widgets";
            break;
          default:
            componentDir = componentType + "s";
        }

        // Build exact paths for both the template directory and default
        const mainComponentPath = `/src/templates/${tplDirName}/${componentDir}/${componentId}.tsx`;
        const defaultComponentPath = `/src/templates/default/${componentDir}/${componentId}.tsx`;

        // Get all available modules
        const modules = getModulesByType(componentType);
        const modulePaths = Object.keys(modules);

        let loadedComponent = null;

        // First try the specific template directory
        if (modulePaths.includes(mainComponentPath)) {
          try {
            const module: any = await modules[mainComponentPath]();
            if (module.default) {
              loadedComponent = module.default;
            } else {
              console.error(
                `Module loaded but no default export found at ${mainComponentPath}`
              );
            }
          } catch (e) {
            console.error(
              `Error loading component from ${mainComponentPath}:`,
              e
            );
          }
        } else {
          console.log(
            `%c[APP-DEBUG] Component not found at: ${mainComponentPath}`,
            "background: #80322a; color: #fcfcfc; padding: 5px 10px; border-radius: 4px; border: 1px solid #ad5045;"
          );
        }

        // If component not found and fallback is enabled, try default template
        if (!loadedComponent && fallbackToDefault && tplDirName !== "default") {
          if (modulePaths.includes(defaultComponentPath)) {
            try {
              const module: any = await modules[defaultComponentPath]();
              if (module.default) {
                loadedComponent = module.default;
              } else {
                console.error(
                  `Module loaded but no default export found at ${defaultComponentPath}`
                );
              }
            } catch (e) {
              console.error(
                `Error loading fallback component from ${defaultComponentPath}:`,
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
                ? `${mainComponentPath} (fallback: ${defaultComponentPath})`
                : mainComponentPath,
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
