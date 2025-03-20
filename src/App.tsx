

import { EdgesList, NodesList, ScenariosList, WorkspacesList } from './features/Components';
import FlowGraph from './features/ReactFlow';
import PluginsApp from './featuresPlugins/PluginsApp';



// App Component
const App = () => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="text-sm font-medium mb-4">Workspace Manager (Zustand + Immer + React Flow)</div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1">
        <WorkspacesList />
        <ScenariosList />
        <NodesList />
        <EdgesList />
      </div>
      <div className="md:col-span-3">
        <FlowGraph />
        <PluginsApp/>
      </div>
    </div>
  </div>
);

export default App;