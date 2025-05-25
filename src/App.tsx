// src/App.tsx - Zaktualizowana wersja
import { BrowserRouter, useParams, useRoutes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ConfigPage from "./pages/ConfigPage";
import AuthPage from "./pages/AuthPage";
import { useComponent, useConfig } from "./core/engine";
import { useMemo } from "react";

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
  const { config, workspace } = useParams<{ config: string; workspace: string }>();
  
  // Memoize config name to prevent re-renders
  const cfgName = useMemo(() => config || "exampleTicketApp", [config]);
  const workspaceName = useMemo(() => workspace || "main", [workspace]);
  
  const app = useConfig<any>(cfgName, `/src/_configs/${cfgName}/app.json`);
  const workspaceConfig = useConfig<any>(
    cfgName, 
    `/src/_configs/${cfgName}/workspaces/${workspaceName}.json`
  );
  
  // Memoize layout configuration
  const layoutConfig = useMemo(() => {
    const theme = app?.tplDir || "test";
    const layoutFile = workspaceConfig?.templateSettings?.layoutFile || "Simple";
    return { theme, layoutFile };
  }, [app?.tplDir, workspaceConfig?.templateSettings?.layoutFile]);

  const {
    Component: Layout,
    loading,
    error,
  } = useComponent(layoutConfig.theme, "layouts", layoutConfig.layoutFile);

  if (loading) return <div>Loading layout...</div>;
  if (error) return <div>Layout error: {error}</div>;
  if (!Layout) return <div>Layout not found: {layoutConfig.theme}/layouts/{layoutConfig.layoutFile}</div>;

  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}