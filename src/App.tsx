// src/App.tsx
import React, { Suspense } from "react";
import { BrowserRouter, useParams, useRoutes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ConfigPage from "./pages/ConfigPage";
import AuthPage from "./pages/AuthPage";
import { useConfig } from "./core/engine";

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
  const cfgName = config || "testApp";
  const app = useConfig<any>(cfgName, `/src/!CONFIGS/${cfgName}/app.json`);
  const theme = app?.tplDir || "test";
  const Layout = React.lazy(
    () => import(`./themes/${theme}/layouts/Simple`)
  );

  return (
    <Suspense fallback={<div>Loading layout...</div>}>
      <Layout>
        <AppRoutes />
      </Layout>
    </Suspense>
  );
}