// src/App.tsx
import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate
} from "react-router-dom";

// Lazy loaded components
const FlowView = lazy(() => import("./views/FlowView"));
const ScenarioView = lazy(() => import("./views/ScenarioView"));
const LoginView = lazy(() => import("./views/LoginView"));
const ApplicationView = lazy(() => import("./views/ApplicationView"));
const WorkspaceView = lazy(() => import("./views/WorkspaceView"));
const AdminPanelView = lazy(() => import("./views/AdminPanelView"));

// Providers and utilities
import InitialDataProvider from "./InitialDataProvider";
import { AuthProvider } from "./_npHooks/useAuth";

// Development tools
import ScenarioGenerator from "./_local_modules/scenarioGenerator/components/ScenarioGenerator";
import EnhancedFlowDebugger from "./_local_modules/debug/EnhancedFlowDebugger";
import { AuthWrapper } from "./_auth/AuthWrapper";

// Import SharedLoader dla spójnego wyglądu ładowania
import SharedLoader from "./components/SharedLoader";

const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex w-full h-screen overflow-hidden">
    <div
      id="app-content"
      className="h-full transition-all duration-300 ease-in-out w-full overflow-auto"
    >
      {children}
    </div>
  </div>
);

const App = () => (
  <Router>
    <AuthProvider>
      <Suspense
        fallback={
          <SharedLoader message="Ładowanie..." size="lg" fullScreen={true} />
        }
      >
        <AppWrapper>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<LoginView />} />
            
            {/* Dev tools */}
            <Route path="/generator" element={<ScenarioGenerator />} />
            
            {/* Admin Panel - oddzielna podstrona */}
            <Route path="/admin" element={
              <AuthWrapper>
                <AdminPanelView />
              </AuthWrapper>
            } />
            
            {/* Nowy przepływ z aplikacjami */}
            <Route
              element={
                <InitialDataProvider>
                  <Outlet />
                </InitialDataProvider>
              }
            >
              {/* Strona główna - wybór aplikacji */}
              <Route path="/" element={<ApplicationView />} />
              
              {/* Wybór workspace w ramach aplikacji */}
              <Route path="/app/:applicationId" element={<WorkspaceView />} />
              
              {/* Wybór scenariusza w ramach aplikacji i workspace */}
              <Route path="/app/:application/:workspace" element={<ScenarioView />} />
              
              {/* Flow w ramach aplikacji, workspace i scenariusza */}
              <Route path="/app/:application/:workspace/:scenario" element={<FlowView />} />
              
              {/* Stary przepływ (kompatybilność wsteczna) */}
              <Route path="/:workspace" element={<ScenarioView />} />
              <Route path="/:workspace/:scenario" element={<FlowView />} />
              
              {/* Redirects */}
              <Route path="/workspaces" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AppWrapper>
      </Suspense>
      
      {/* Debug tools - loaded conditionally */}
      <Suspense fallback={null}>
        <EnhancedFlowDebugger />
      </Suspense>
    </AuthProvider>
  </Router>
);

export default App;