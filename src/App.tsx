// src/App.tsx
import React from 'react';
import { useAppStore } from './lib/store';
import { WorkspaceList } from './components/WorkspaceList';
import { ScenarioList } from './components/ScenarioList';
import { FlowView } from './components/FlowView';

const App: React.FC = () => {
  const { selectedWorkspace, selectedScenario } = useAppStore();

  const renderContent = () => {
    if (!selectedWorkspace) return <WorkspaceList />;
    if (!selectedScenario) return <ScenarioList />;
    return <FlowView />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;