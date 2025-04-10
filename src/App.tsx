// src/App.tsx
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceView } from './views/WorkspaceView';
import { ScenarioView } from './views/ScenarioView';
import { FlowView } from './views/FlowView';
import { LoginView } from './views/LoginView';
import { useAppStore } from './lib/store';
import { useContextStore } from './lib/contextStore';
import { initializeTemplates } from './templates';

const App: React.FC = () => {
  const { workspaces } = useAppStore();
  const { setContext } = useContextStore();
  
  // Inicjalizacja szablonów przy pierwszym renderowaniu
  useEffect(() => {
    initializeTemplates();
  }, []);
  
  // Inicjalizacja kontekstu gdy załadują się workspaces
  useEffect(() => {
    if (workspaces.length > 0 && workspaces[0].initialContext) {
      setContext(workspaces[0].initialContext);
    }
  }, [workspaces, setContext]);

  return (
    <Router>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-600">Ładowanie aplikacji...</p>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<WorkspaceView />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/:workspace" element={<ScenarioView />} />
          <Route path="/:workspace/:scenario" element={<FlowView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;