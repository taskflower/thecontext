// src/App.tsx
import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import FlowView from './views/FlowView';
import InitialDataProvider from './InitialDataProvider';
import { WorkspaceView } from './views/WorkspaceView';
import { LoginView } from './views/LoginView';
import { AuthProvider } from './hooks/useAuth';
import { ScenarioView } from './views/ScenarioView';
import ScenarioGenerator from './components/ScenarioGenerator';
import EnhancedFlowDebugger from './debug/EnhancedFlowDebugger';

const AppWrapper = ({ children }: any) => (
  <div className="flex w-full h-screen overflow-hidden">
    <div id="app-content" className="h-full transition-all duration-300 ease-in-out w-full overflow-auto">
      {children}
    </div>
  </div>
);

const App = () => (
  <Router>
    <AuthProvider>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <AppWrapper>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/generator" element={<ScenarioGenerator />} />

            {/* Routes requiring workspace params */}
            <Route element={<InitialDataProvider><Outlet /></InitialDataProvider>}>
              <Route path="/" element={<WorkspaceView />} />
              <Route path=":workspace" element={<ScenarioView />} />
              <Route path=":workspace/:scenario" element={<FlowView />} />
            </Route>
          </Routes>
        </AppWrapper>
      </Suspense>
      <EnhancedFlowDebugger />
    </AuthProvider>
  </Router>
);

export default App;
