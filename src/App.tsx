import React, { useState } from "react";
import { EdgesList } from "./modules/edges";
import { FlowGraph } from "./modules/flow";
import { NodesList } from "./modules/nodes";
import { ScenariosList } from "./modules/scenarios";
import { WorkspacesList } from "./modules/workspaces";
import { PluginManager } from "./modules/plugin/components/PuginManager";
import { ThemeProvider } from "./components/ui/theme-provider";
import { ContextsList } from "./modules/context";
import { ThemeToggle } from "./components/APPUI/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Separator } from "./components/ui/separator";
import { Button } from "./components/ui/button";
import { useAppStore } from "./modules/store";
import { 
  LayoutGrid, 
  Database, 
  Settings, 
  Layers, 
  PanelLeft, 
  PanelRight,
  MessageSquare,
  FileCode
} from "lucide-react";

const App: React.FC = () => {
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [showContextPanel, setShowContextPanel] = useState(false);
  
  // Get current scenario name for display in header
  const getCurrentScenario = useAppStore(state => state.getCurrentScenario);
  const scenario = getCurrentScenario();
  
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-background flex flex-col overflow-hidden">
        {/* Header Bar with slim toolbar */}
        <header className="border-b py-2 px-4 flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Flow Studio</h1>
            <Separator orientation="vertical" className="h-6" />
            <div className="text-sm text-muted-foreground">
              {scenario?.name || "No scenario selected"}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              title="Toggle Navigation Panel"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowRightPanel(!showRightPanel)}
              title="Toggle Properties Panel"
            >
              <PanelRight className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content with Flexible Panels */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Collapsible */}
          {showLeftPanel && (
            <aside className="w-56 border-r bg-sidebar-background flex flex-col overflow-hidden">
              <Tabs defaultValue="workspace" className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-3 px-2 py-1 h-auto rounded-none border-b">
                  <TabsTrigger value="workspace" title="Workspaces" className="rounded-none">
                    <LayoutGrid className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="scenarios" title="Scenarios" className="rounded-none">
                    <Layers className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="settings" title="Settings" className="rounded-none">
                    <Settings className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex-1 overflow-auto">
                  <TabsContent value="workspace" className="m-0 p-0 h-full">
                    <WorkspacesList />
                  </TabsContent>
                  <TabsContent value="scenarios" className="m-0 p-0 h-full">
                    <ScenariosList />
                  </TabsContent>
                  <TabsContent value="settings" className="m-0 p-3 h-full">
                    <div className="text-sm text-muted-foreground">
                      Settings panel (placeholder)
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </aside>
          )}

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Flow Graph Area */}
            <div className="flex-1 overflow-hidden">
              <FlowGraph />
            </div>

            {/* Bottom Toolbar */}
            <div className="border-t bg-card py-1 px-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => setShowContextPanel(!showContextPanel)}
                >
                  <Database className="h-3.5 w-3.5" />
                  Context
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Conversation
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                >
                  <FileCode className="h-3.5 w-3.5" />
                  Export
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {scenario?.children?.length || 0} nodes · {scenario?.edges?.length || 0} edges
              </div>
            </div>
            
            {/* Context Panel (collapsible from bottom) */}
            {showContextPanel && (
              <div className="border-t h-64 bg-card overflow-auto">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                  <h3 className="text-sm font-medium">Context Manager</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowContextPanel(false)}
                    className="h-7 w-7 p-0"
                  >
                    ×
                  </Button>
                </div>
                <ContextsList />
              </div>
            )}
          </main>

          {/* Right Panel - Properties (collapsible) */}
          {showRightPanel && (
            <aside className="w-64 border-l bg-sidebar-background flex flex-col overflow-hidden">
              <Tabs defaultValue="nodes" className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-2 px-2 py-1 h-auto rounded-none border-b">
                  <TabsTrigger value="nodes" className="rounded-none">Nodes</TabsTrigger>
                  <TabsTrigger value="edges" className="rounded-none">Edges</TabsTrigger>
                </TabsList>
                
                <div className="flex-1 overflow-auto">
                  <TabsContent value="nodes" className="m-0 p-0 h-full">
                    <NodesList />
                  </TabsContent>
                  <TabsContent value="edges" className="m-0 p-0 h-full">
                    <EdgesList />
                  </TabsContent>
                </div>
              </Tabs>
            </aside>
          )}
        </div>

        {/* Plugin Manager as floating button */}
        <PluginManager />
      </div>
    </ThemeProvider>
  );
};

export default App;