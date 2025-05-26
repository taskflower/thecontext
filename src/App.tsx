// src/App.tsx - Poprawiona wersja
import { BrowserRouter, useParams, useRoutes, useLocation } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ConfigPage from "./pages/ConfigPage";
import AuthPage from "./pages/AuthPage";
import { useComponent, useConfig } from "./core/engine";
import { useMemo, useEffect, useState } from "react";

function AppRoutes() {
  const routes = useMemo(() => [
    { path: "login", element: <AuthPage /> },
    { path: ":config/:workspace/:scenario/:id", element: <ConfigPage /> },
    { path: ":config/:workspace/:scenario/:step?", element: <ConfigPage /> },
    { path: ":config/:workspace", element: <ConfigPage /> },
    { path: "*", element: <div>Not found</div> },
  ], []);
  
  return useRoutes(routes);
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppContent() {
  return (
    <AppRoutes />
  );
}

// Nowy komponent LayoutWrapper, który będzie owijał ConfigPage
function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { config, workspace } = useParams<{ config: string; workspace: string }>();
  const location = useLocation();
  
  // Memoize config name to prevent re-renders
  const cfgName = useMemo(() => config || "exampleTicketApp", [config]);
  const workspaceName = useMemo(() => workspace || "main", [workspace]);
  
  const app = useConfig<any>(cfgName, `/src/_configs/${cfgName}/app.json`);
  const workspaceConfig = useConfig<any>(
    cfgName, 
    `/src/_configs/${cfgName}/workspaces/${workspaceName}.json`
  );
  
  // Memoize layout configuration - tylko te wartości mają wpływ na layout
  const layoutConfig = useMemo(() => {
    const theme = app?.tplDir || "test";
    const layoutFile = workspaceConfig?.templateSettings?.layoutFile || "Simple";
    return { theme, layoutFile };
  }, [app?.tplDir, workspaceConfig?.templateSettings?.layoutFile]);

  // State dla aktualnego layoutu - zmieni się tylko gdy layoutConfig się zmieni
  const [currentLayoutConfig, setCurrentLayoutConfig] = useState(layoutConfig);
  
  // Aktualizuj layout config tylko gdy rzeczywiście się zmienił
  useEffect(() => {
    if (
      layoutConfig.theme !== currentLayoutConfig.theme ||
      layoutConfig.layoutFile !== currentLayoutConfig.layoutFile
    ) {
      setCurrentLayoutConfig(layoutConfig);
    }
  }, [layoutConfig, currentLayoutConfig]);

  const {
    Component: Layout,
    loading,
    error,
  } = useComponent(currentLayoutConfig.theme, "layouts", currentLayoutConfig.layoutFile);

  if (loading) return <div>Loading layout...</div>;
  if (error) return <div>Layout error: {error}</div>;
  if (!Layout) return <div>Layout not found: {currentLayoutConfig.theme}/layouts/{currentLayoutConfig.layoutFile}</div>;

  return (
    <Layout>
      {children}
    </Layout>
  );
}