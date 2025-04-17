import  { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FlowView from "./views/FlowView";
import InitialDataProvider from "./InitialDataProvider";
import { WorkspaceView } from "./views/WorkspaceView";
import { LoginView } from "./views/LoginView";
import { AuthProvider } from "./hooks/useAuth";
import { ScenarioView } from "./views/ScenarioView";
import ScenarioGenerator from "./components/ScenarioGenerator";
import EnhancedFlowDebugger from "./debug/EnhancedFlowDebugger";

// New wrapper component that creates the split layout using Tailwind classes
const AppWrapper = ({ children }:any) => {
  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div id="app-content" className="h-full transition-all duration-300 ease-in-out w-full overflow-auto">
        {children}
      </div>
      {/* EnhancedFlowDebugger will render itself appropriately */}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <InitialDataProvider>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <AppWrapper>
              <Routes>
                <Route path="/login" element={<LoginView />} />
                <Route path="/generator" element={<ScenarioGenerator />} />
                <Route path="/" element={<WorkspaceView />} />
                <Route path="/:workspace" element={<ScenarioView />} />
                <Route path="/:workspace/:scenario" element={<FlowView />} />
              </Routes>
            </AppWrapper>
          </Suspense>
        </InitialDataProvider>
        <EnhancedFlowDebugger />
      </AuthProvider>
    </Router>
  );
};

export default App;