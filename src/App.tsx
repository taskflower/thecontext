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
            {/* Home route showing all workspaces */}
            <Route path="/" element={<WorkspaceList />} />
            
            {/* Workspace route showing scenarios for a specific workspace */}
            <Route path="/:workspace" element={<ScenarioList />} />
            
            {/* Scenario route showing flow for a specific scenario */}
            <Route path="/:workspace/:scenario" element={<FlowView />} />
            
            {/* Node route showing a specific node in a flow */}
            <Route path="/:workspace/:scenario/:node" element={<FlowView />} />
            
            {/* Redirect unknown paths to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;