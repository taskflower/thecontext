// src/App.tsx - EditorControl inside Router
import { BrowserRouter, useRoutes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ConfigPage from "./pages/ConfigPage";
import AuthPage from "./pages/AuthPage";
import { useMemo, Suspense } from "react";
import { EditorModule } from "./modules/editor";
import EditorControl from "./modules/editor/components/EditorControl";


function AppRoutes() {
  const routes = useMemo(() => [
    { path: "login", element: <AuthPage /> },
    
    // Editor routes - lazy loaded
    { 
      path: "edit/:config/:workspace/:type", 
      element: (
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
              <span className="text-sm font-medium text-zinc-600">Loading editor...</span>
            </div>
          </div>
        }>
          <EditorModule />
        </Suspense>
      )
    },
    { 
      path: "edit/:config/:workspace/:scenario/:type", 
      element: (
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
              <span className="text-sm font-medium text-zinc-600">Loading editor...</span>
            </div>
          </div>
        }>
          <EditorModule />
        </Suspense>
      )
    },
    
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
      <EditorControl />
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