import React from 'react';
import { WorkspacesList } from './components/features/workspaces/WorkspacesList';
import { ScenariosList } from './components/features/scenarios/ScenariosList';
import { NodesList } from './components/features/nodes/NodesList';
import { EdgesList } from './components/features/edges/EdgesList';
import { FlowGraph } from './components/features/flow/FlowGraph';

const App: React.FC = () => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="text-sm font-medium mb-4">Workspace Manager (TypeScript + Zustand + Immer + React Flow)</div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1">
        <WorkspacesList />
        <ScenariosList />
        <NodesList />
        <EdgesList />
      </div>
      <div className="md:col-span-3">
        <FlowGraph />
      </div>
    </div>
  </div>
);

export default App;