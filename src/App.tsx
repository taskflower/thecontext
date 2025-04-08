// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceList } from './components/WorkspaceList';
import { ScenarioList } from './components/ScenarioList';
import { FlowView } from './components/FlowView';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto">
          <Routes>
            <Route path="/" element={<WorkspaceList />} />
            <Route path="/scenarios" element={<ScenarioList />} />
            <Route path="/flow" element={<FlowView />} />
            {/* Przekierowanie nieznanych ścieżek do workspace'ów */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
