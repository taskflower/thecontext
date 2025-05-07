// // src/App.tsx
// import { Suspense, lazy } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Outlet,
//   Navigate,
// } from "react-router-dom";

// const FlowView = lazy(() => import("./views/FlowView"));

// const LoginView = lazy(() => import("./views/LoginView"));
// const ApplicationView = lazy(() => import("./views/ApplicationView"));
// const WorkspaceView = lazy(() => import("./views/WorkspaceView"));
// import SharedLoader from "./components/SharedLoader";
// import { AuthProvider } from "./hooks";
// import ScenarioView from "./views/ScenarioView";
// import { EnhancedFlowDebugger } from "./_modules/debug/EnhancedFlowDebugger";

// const AppWrapper = ({ children }: { children: React.ReactNode }) => (
//   <div className="flex w-full h-screen overflow-hidden">
//     <div
//       id="app-content"
//       className="h-full transition-all duration-300 ease-in-out w-full overflow-auto"
//     >
//       {children}
//     </div>
//   </div>
// );

// const App = () => (
//   <Router>
//     <AuthProvider>
//       <Suspense
//         fallback={
//           <SharedLoader message="Ładowanie..." size="lg" fullScreen={true} />
//         }
//       >
//         <AppWrapper>
//           <Routes>
//             {/* Auth routes */}
//             <Route path="/login" element={<LoginView />} />

           

//             {/* New flow with applications */}
//             <Route element={<Outlet />}>
//               {/* Home page - application selection */}
//               <Route path="/" element={<ApplicationView />} />

//               {/* Workspace selection within application */}
//               <Route path="/app/:applicationId" element={<WorkspaceView />} />

//               {/* Scenario selection within application and workspace */}
//               <Route
//                 path="/app/:application/:workspace"
//                 element={<ScenarioView />}
//               />

//               {/* Flow within application, workspace and scenario */}
//               <Route
//                 path="/app/:application/:workspace/:scenario"
//                 element={<FlowView />}
//               />

//               {/* Old flow (backward compatibility) */}
//               <Route path="/:workspace" element={<ScenarioView />} />
//               <Route path="/:workspace/:scenario" element={<FlowView />} />

//               {/* Redirects */}
//               <Route path="/workspaces" element={<Navigate to="/" replace />} />
//             </Route>
//           </Routes>
//         </AppWrapper>
//       </Suspense>

//       {/* Debug tools - loaded conditionally */}
//       <Suspense fallback={null}>
//         <EnhancedFlowDebugger />
//       </Suspense>
//     </AuthProvider>
//   </Router>
// );

// export default App;


import React, { Suspense, lazy, useState, useEffect } from 'react';
import { FlowEngine } from './core/engine';
import { useFlowStore } from './core/context';
import type { AppConfig } from './core/types';
import { AuthProvider } from './hooks';

// Dynamiczne ładowanie layoutu
const loadLayout = (tplDir: string, layoutFile: string) => 
  lazy(() => 
    import(`./themes/${tplDir}/layouts/${layoutFile}`)
      .catch(() => import('./themes/default/layouts/Simple'))
  );

export const App: React.FC<{ 
  configUrl?: string;
  initialConfig?: AppConfig;
}> = ({ configUrl = '/api/config', initialConfig }) => {
  const [config, setConfig] = useState<AppConfig | null>(initialConfig || null);
  const [loading, setLoading] = useState(!initialConfig);
  const [error, setError] = useState<string | null>(null);
  const { reset } = useFlowStore();
  
  // Ładowanie konfiguracji
  useEffect(() => {
    if (initialConfig) return;
    
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const res = await fetch(configUrl);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        
        const data = await res.json();
        setConfig(data);
      } catch (err) {
        console.error('Failed to load config:', err);
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, [configUrl, initialConfig]);
  
  // Resetowanie stanu przy zmianie konfiguracji
  useEffect(() => {
    if (config) reset();
  }, [config, reset]);
  
  if (loading) return <div>Ładowanie konfiguracji...</div>;
  if (error) return <div>Błąd: {error}</div>;
  if (!config) return <div>Brak konfiguracji</div>;
  
  // Wybór szablonu i layoutu
  const tplDir = config.tplDir || 'default';
  const layoutFile = config.templateSettings?.layoutFile || 'Simple';
  
  const Layout = loadLayout(tplDir, layoutFile);
  
  return (
    <Suspense fallback={<div>Ładowanie aplikacji...</div>}>
       <AuthProvider><Layout>
        <FlowEngine config={config} />
      </Layout></AuthProvider>
      
    </Suspense>
  );
};
