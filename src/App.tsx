import React from "react";
import { EdgesList } from "./modules/edges";
import { FlowGraph } from "./modules/flow";
import { NodesList } from "./modules/nodes";
import { ScenariosList } from "./modules/scenarios";
import { WorkspacesList } from "./modules/workspaces";

const App: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1 grid gap-3">
        <WorkspacesList />
        <ScenariosList />
        <NodesList />
        <EdgesList />
      </div>
      <div className="md:col-span-3  bg-red-200">
        <FlowGraph />
      </div>
    </div>
  </div>
);

export default App;
