// src/ngn2/router/Router.tsx
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

// Component cache
const componentCache = new Map<string, any>();
const layoutCache = new Map<string, any>();

function getComponent(theme: string, type: string, name: string) {
  const key = `${theme}/${type}/${name}`;
  if (!componentCache.has(key)) {
    componentCache.set(
      key,
      lazy(() =>
        import(`/src/themes/${theme}/${type}/${name}.tsx`)
          .catch(() => import(`/src/themes/${theme}/${type}/${name}.jsx`))
          .catch(() => ({
            default: () =>
              h(
                "div",
                { className: "p-4 text-red-600" },
                `Missing component: ${name}`
              ),
          }))
      )
    );
  }
  return componentCache.get(key);
}

function Layout({ theme, layout, children }: any) {
  const Comp = useMemo(() => {
    const key = `${theme}/${layout}`;
    if (!layoutCache.has(key)) {
      layoutCache.set(key, getComponent(theme, "layouts", layout));
    }
    return layoutCache.get(key);
  }, [theme, layout]);

  return h(
    Suspense,
    {
      fallback: h(
        "div",
        { className: "flex items-center justify-center p-8" },
        "Loading layout..."
      ),
    },
    h(Comp, null, children)
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

        // Load app config
        const appConfig = await configManager.loadConfig(
          `/src/!CONFIGS/${config}/app.json`
        );
        if (mounted) setApp(appConfig);

        // Load workspace config if needed
        if (workspace) {
          const workspaceConfig = await configManager.loadConfig(
            `/src/!CONFIGS/${config}/workspaces/${workspace}.json`
          );
          if (mounted) setWs(workspaceConfig);
        }

        // Load scenario config if needed
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

    return () => {
      mounted = false;
    };
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
        h(
          "button",
          {
            className:
              "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
            onClick: () => window.location.reload(),
          },
          "Reload"
        )
      );
    }

    if (!app) {
      return h(
        "div",
        { className: "p-8 text-center text-gray-600" },
        "Application not found"
      );
    }

    // Scenario/Step mode
    if (scenario && sc) {
      const node =
        (step && sc.nodes.find((n: any) => n.slug === step)) || sc.nodes[0];
      if (node) {
        const Comp = getComponent(
          app.tplDir,
          "steps",
          node.tplFile.replace(/\.(tsx|jsx)$/, "")
        );
        return h(
          Suspense,
          { fallback: h(LoadingFallback, { message: "Loading step..." }) },
          h(Comp, { attrs: { ...node.attrs, id } })
        );
      } else {
        return h(
          "div",
          { className: "p-8 text-center text-gray-600" },
          "Step not found"
        );
      }
    }

    // Workspace mode
    if (workspace && ws) {
      const widgets = ws.templateSettings?.widgets || [];
      if (widgets.length === 0) {
        return h(
          "div",
          { className: "p-8 text-center text-gray-600" },
          "No widgets configured"
        );
      }

      return h(
        "div",
        { className: "space-y-4" },
        ...widgets.map((w: any, i: number) =>
          h(
            "div",
            { key: i },
            h(
              Suspense,
              {
                fallback: h(LoadingFallback, { message: "Loading widget..." }),
              },
              h(getComponent(app.tplDir, "widgets", w.tplFile), w)
            )
          )
        )
      );
    }

    return h(
      "div",
      { className: "p-8 text-center text-gray-600" },
      "No route matched"
    );
  }, [app, ws, sc, scenario, step, workspace, id, loading, error]);

  // Don't render layout while loading or on error
  if (loading || error || !app) {
    return content;
  }

  return h(
    Layout,
    {
      theme: app.tplDir,
      layout: ws?.templateSettings?.layoutFile || "Simple",
    },
    content
  );
}
