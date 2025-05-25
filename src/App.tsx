/// src/App.tsx
import { BrowserRouter, useParams, useRoutes } from "react-router-dom";
import { useConfig } from "./hooks";
import React from "react";
import ConfigPage from "./pages/ConfigPage";

function AppRoutes() {
  const routes = [
    // NOWY: Route z ID dla edycji ticketów
    { path: ":config/:workspace/:scenario/:id", element: <ConfigPage /> },
    // ISTNIEJĄCE: Route z opcjonalnym step
    { path: ":config/:workspace/:scenario/:step?", element: <ConfigPage /> },
    // ISTNIEJĄCE: Route tylko z workspace
    { path: ":config/:workspace", element: <ConfigPage /> },
    { path: "*", element: <div>Not found</div> }
  ];
  return useRoutes(routes);
}

export function App() {
  const { config } = useParams<{ config: string }>();
  const cfgName = config || "testApp";  // Domyślnie 'testApp' jeśli brak 'config'
  const app = useConfig<any>(cfgName, `/src/!CONFIGS/${cfgName}/app.json`);
  const theme = app?.tplDir || 'test'; // Użyj domyślnego motywu jeśli nie ma

  // Ładowanie layoutu z motywu
  const Layout = React.lazy(() => import(`./themes/${theme}/layouts/Simple`));

  return (
    <BrowserRouter>
      <React.Suspense fallback={<div>Loading layout...</div>}>
        <Layout>
          <AppRoutes />
        </Layout>
      </React.Suspense>
    </BrowserRouter>
  );
}