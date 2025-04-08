// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Views focused only on display without editing capabilities
import { WorkspaceView } from './views/WorkspaceView';
import { ScenarioView } from './views/ScenarioView';
import { FlowView } from './views/FlowView';

const App: React.FC = () => {
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
          {/* Strona główna wyświetlająca wszystkie workspaces */}
          <Route path="/" element={<WorkspaceView />} />
          
          {/* Workspace wyświetlający scenariusze dla wybranego workspace */}
          <Route path="/:workspace" element={<ScenarioView />} />
          
          {/* Scenariusz wyświetlający flow dla wybranego scenariusza */}
          <Route path="/:workspace/:scenario" element={<FlowView />} />
          
          {/* Węzeł wyświetlający konkretny node w flow */}
          <Route path="/:workspace/:scenario/:node" element={<FlowView />} />
          
          {/* Przekierowanie nieznanych ścieżek do strony głównej */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;