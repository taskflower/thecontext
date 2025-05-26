// src/App.tsx - Poprawiona wersja
import { BrowserRouter, useRoutes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ConfigPage from "./pages/ConfigPage";
import AuthPage from "./pages/AuthPage";
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
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}