// components/layout/Sidebar.tsx
import React from 'react';
import WorkspacesList from '../workspaces/WorkspacesList';
import ScenariosList from '../scenarios/ScenariosList';
import NodesList from '../nodes/NodesList';
import ContextSection from '../context/ContextSection';
import useStore from '@/store';

const Sidebar: React.FC = () => {
  const view = useStore(state => state.view);
  
  return (
    <div className="w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gray-200">
        <h1 className="text-xl font-bold">Flow Builder</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {view === 'workspaces' && <WorkspacesList />}
        {view === 'scenarios' && <ScenariosList />}
        {(view === 'flow' || view === 'nodeEditor' || view === 'contextEditor') && <NodesList />}
      </div>
      
      {(view === 'flow' || view === 'nodeEditor' || view === 'contextEditor') && <ContextSection />}
    </div>
  );
};

export default Sidebar;