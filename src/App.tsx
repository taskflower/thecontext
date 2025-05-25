// src/App.tsx - Zaktualizowana wersja
import { BrowserRouter, useParams, useRoutes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ConfigPage from "./pages/ConfigPage";
import AuthPage from "./pages/AuthPage";
import { useComponent, useConfig } from "./core/engine";


function AppRoutes() {
  const routes = [
    { path: "login", element: <AuthPage /> },
    { path: ":config/:workspace/:scenario/:id", element: <ConfigPage /> },
    { path: ":config/:workspace/:scenario/:step?", element: <ConfigPage /> },
    { path: ":config/:workspace", element: <ConfigPage /> },
    { path: "*", element: <div>Not found</div> },
  ];
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
  const { config } = useParams<{ config: string }>();
  const cfgName = config || "exampleTicketApp";
  const app = useConfig<any>(cfgName, `/src/_configs/${cfgName}/app.json`);
  const theme = app?.tplDir || "test";
  
  const { Component: Layout, loading, error } = useComponent(theme, 'layouts', 'Simple.tsx');
  
  if (loading) return <div>Loading layout...</div>;
  if (error) return <div>Layout error: {error}</div>;
  if (!Layout) return <div>Layout not found: {theme}/layouts/Simple.tsx</div>;
  
  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}