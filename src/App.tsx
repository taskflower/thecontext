// src/App.tsx - Fixed version with proper redirect logic
import { BrowserRouter, useRoutes, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ConfigPage from "./pages/ConfigPage";
import AuthPage from "./pages/AuthPage";
import RedirectToDefault from "./pages/RedirectToDefault";
import { useMemo } from "react";

function AppRoutes() {
  const routes = useMemo(
    () => [
      { path: "login", element: <AuthPage /> },

      // Simplified routes - scenario/node structure
      {
        path: ":config/:workspace/:scenario/:node/:id",
        element: <ConfigPage />,
      },
      {
        path: ":config/:workspace/:scenario/:node",
        element: <ConfigPage />,
      },
      { path: ":config/:workspace", element: <ConfigPage /> },
      
      // 🔥 NOWE: Redirect dla root URL
      { path: "/", element: <RedirectToDefault /> },
      
      {
        path: "*",
        element: (
          <div className="flex items-center justify-center min-h-screen text-zinc-600">
            Page not found
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      {useRoutes(routes)}
    </>
  );
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