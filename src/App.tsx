// src/App.tsx - Cleaned version with EdV2 only
import { BrowserRouter, useRoutes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ConfigPage from "./pages/ConfigPage";
import AuthPage from "./pages/AuthPage";
import { useMemo } from "react";



function AppRoutes() {
  const routes = useMemo(() => [
    { path: "login", element: <AuthPage /> },
    
    // Regular config routes
    { path: ":config/:workspace/:scenario/:id", element: <ConfigPage /> },
    { path: ":config/:workspace/:scenario/:step?", element: <ConfigPage /> },
    { path: ":config/:workspace", element: <ConfigPage /> },
    { path: "/", element: <ConfigPage /> },
    { path: "*", element: <div className="flex items-center justify-center min-h-screen text-zinc-600">Page not found</div> },
  ], []);
  
  return (
    <>
      {useRoutes(routes)}
      {/* <EditorControlV2 /> */}
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