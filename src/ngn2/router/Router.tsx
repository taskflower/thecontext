// src/ngn2/router/Router.tsx - Z VITE GLOB IMPORTS
import {
  lazy,
  Suspense,
  createElement as h,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useParams } from "react-router-dom";
import { configManager } from "../config/ConfigManager";

// Vite glob imports - automatycznie ładuje wszystkie komponenty
const widgetModules = import.meta.glob('/src/themes/*/widgets/*.{tsx,jsx}');
const stepModules = import.meta.glob('/src/themes/*/steps/*.{tsx,jsx}');
const layoutModules = import.meta.glob('/src/themes/*/layouts/*.{tsx,jsx}');

// Component cache
const componentCache = new Map<string, any>();

function getComponent(theme: string, type: string, name: string) {
  // Usuń rozszerzenie jeśli jest podane
  const cleanName = name.replace(/\.(tsx|jsx)$/, "");
  const key = `${theme}/${type}/${cleanName}`;
  
  if (!componentCache.has(key)) {
    // Wybierz odpowiedni moduł na podstawie typu
    const modules = type === 'widgets' ? widgetModules : 
                   type === 'steps' ? stepModules : 
                   type === 'layouts' ? layoutModules : {};
    
    // Szukaj modułu pasującego do ścieżki
    const modulePath = `/src/themes/${theme}/${type}/${cleanName}.tsx`;
    const modulePathJsx = `/src/themes/${theme}/${type}/${cleanName}.jsx`;
    
    const moduleLoader = modules[modulePath] || modules[modulePathJsx];
    
    if (moduleLoader) {
      // Utwórz lazy component
      const LazyComponent = lazy(() => moduleLoader().then((module: any) => ({
        default: module.default || module
      })));
      
      componentCache.set(key, LazyComponent);
    } else {
      // Fallback component
      const ErrorComponent = () =>
        h(
          "div",
          { className: "p-4 text-red-600 border border-red-300 rounded" },
          h("h3", { className: "font-bold" }, "Missing Component"),
          h("p", null, `Component "${cleanName}" not found`),
          h("p", { className: "text-sm text-gray-600 mt-2" }, 
            `Expected: ${modulePath}`),
          h("div", { className: "text-xs mt-2" },
            h("details", null,
              h("summary", null, "Available modules:"),
              h("pre", { className: "mt-1 text-xs" }, 
                JSON.stringify(Object.keys(modules), null, 2))
            )
          )
        );
      
      componentCache.set(key, ErrorComponent);
    }
  }
  
  return componentCache.get(key);
}

function Layout({ theme, layout, children }: any) {
  const LayoutComponent = getComponent(theme, "layouts", layout);
  
  return h(
    Suspense,
    {
      fallback: h(
        "div",
        { className: "flex items-center justify-center p-8" },
        "Loading layout..."
      ),
    },
    h(LayoutComponent, null, children)
  );
}

function LoadingFallback({ message = "Loading..." }: { message?: string }) {
  return h(
    "div",
    { className: "flex items-center justify-center p-8" },
    h("div", {
      className:
        "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2",
    }),
    h("span", { className: "text-gray-600" }, message)
  );
}

export function Router() {
  const { config = "testApp", workspace, scenario, step, id } = useParams();
  const [app, setApp] = useState<any>(null);
  const [ws, setWs] = useState<any>(null);
  const [sc, setSc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadConfigs() {
      try {
        setLoading(true);
        setError(null);

        const appConfig = await configManager.loadConfig(
          `/src/!CONFIGS/${config}/app.json`
        );
        if (mounted) setApp(appConfig);

        if (workspace) {
          const workspaceConfig = await configManager.loadConfig(
            `/src/!CONFIGS/${config}/workspaces/${workspace}.json`
          );
          if (mounted) setWs(workspaceConfig);
        }

        if (scenario && workspace) {
          const scenarioConfig = await configManager.loadConfig(
            `/src/!CONFIGS/${config}/scenarios/${workspace}/${scenario}.json`
          );
          if (mounted) setSc(scenarioConfig);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load configuration"
          );
          console.error("Router config loading error:", err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadConfigs();
    return () => { mounted = false; };
  }, [config, workspace, scenario]);

  const content = useMemo(() => {
    if (loading) {
      return h(LoadingFallback, { message: "Loading application..." });
    }

    if (error) {
      return h(
        "div",
        { className: "p-8 text-center" },
        h("div", { className: "text-red-600 mb-4" }, `Error: ${error}`),
        h("button", {
          className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
          onClick: () => window.location.reload(),
        }, "Reload")
      );
    }

    if (!app) {
      return h("div", { className: "p-8 text-center text-gray-600" }, "Application not found");
    }

    // Scenario/Step mode
    if (scenario && sc) {
      const node = (step && sc.nodes.find((n: any) => n.slug === step)) || sc.nodes[0];
      if (node) {
        const StepComponent = getComponent(app.tplDir, "steps", node.tplFile);
        return h(
          Suspense,
          { fallback: h(LoadingFallback, { message: "Loading step..." }) },
          h(StepComponent, { attrs: { ...node.attrs, id } })
        );
      }
      return h("div", { className: "p-8 text-center text-gray-600" }, "Step not found");
    }

    // Workspace mode
    if (workspace && ws) {
      const widgets = ws.templateSettings?.widgets || [];
      
      if (widgets.length === 0) {
        if (workspace === 'tickets') {
          window.location.href = `/testApp/tickets/list`;
          return h(LoadingFallback, { message: "Redirecting..." });
        }
        return h("div", { className: "p-8 text-center text-gray-600" }, "No widgets configured");
      }

      return h(
        "div",
        { className: "space-y-4" },
        ...widgets.map((w: any, i: number) => {
          const WidgetComponent = getComponent(app.tplDir, "widgets", w.tplFile);
          
          return h(
            "div",
            { key: i },
            h(
              Suspense,
              { fallback: h(LoadingFallback, { message: `Loading ${w.tplFile}...` }) },
              h(WidgetComponent, w)
            )
          );
        })
      );
    }

    return h("div", { className: "p-8 text-center text-gray-600" }, "No route matched");
  }, [app, ws, sc, scenario, step, workspace, id, loading, error]);

  if (loading || error || !app) {
    return content;
  }

  return h(Layout, {
    theme: app.tplDir,
    layout: ws?.templateSettings?.layoutFile || "Simple",
  }, content);
}