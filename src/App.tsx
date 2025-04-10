// src/App.tsx
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FlowView from "./views/FlowView";
import ScenarioView from "./views/ScenarioView";

import InitialDataProvider from "./InitialDataProvider";
import { WorkspaceView } from "./views/WorkspaceView";
import { LoginView } from "./views/LoginView";
import { AuthProvider } from "./hooks/useAuth";

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <InitialDataProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<LoginView />} />
              <Route path="/" element={<WorkspaceView />} />
              <Route path="/:workspace" element={<ScenarioView />} />
              <Route path="/:workspace/:scenario" element={<FlowView />} />
            </Routes>
          </Suspense>
        </InitialDataProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
