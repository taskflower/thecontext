import React from "react";
import { EdgesList } from "./modules/edges";
import { FlowGraph } from "./modules/flow";
import { NodesList } from "./modules/nodes";
import { ScenariosList } from "./modules/scenarios";
import { WorkspacesList } from "./modules/workspaces";
import { PluginManager } from "./modules/plugin/components/PuginManager";
import { ThemeProvider } from "./components/ui/theme-provider";

const App: React.FC = () => (
  <ThemeProvider defaultTheme="dark">
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 grid gap-3">
          <WorkspacesList />
          <ScenariosList />
          <NodesList />
          <EdgesList />
          <PluginManager />
        </div>
        <div className="md:col-span-3"> 
          <FlowGraph />
        </div>
      </div>
    </div>
  </ThemeProvider>
);

export default App;