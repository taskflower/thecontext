import React, { useState, useEffect } from "react";
import { EdgesList } from "./modules/edges";
import { FlowGraph } from "./modules/flow";
import { NodesList } from "./modules/nodes";
import { ScenariosList } from "./modules/scenarios";
import { WorkspacesList } from "./modules/workspaces";
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
  FileCode,
  Puzzle,
  Focus,
} from "lucide-react";
import { ConversationPanel } from "./modules/conversation/ConversationPanel";
import { PluginsPanel } from "./modules/plugin/components/PluginsPanel";

const App: React.FC = () => {
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true); // Changed default to true
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [showConversationPanel, setShowConversationPanel] = useState(false);
  const [showPluginsPanel, setShowPluginsPanel] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState("nodes");

  // Get current scenario name for display in header
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const selected = useAppStore((state) => state.selected);
  const stateVersion = useAppStore((state) => state.stateVersion);
  const scenario = getCurrentScenario();

  // Auto-open right panel and select correct tab when node or edge is selected
  useEffect(() => {
    if (selected.node) {
      setShowRightPanel(true);
      setRightPanelTab("nodes");
    } else if (selected.edge) {
      setShowRightPanel(true);
      setRightPanelTab("edges");
    }
  }, [selected.node, selected.edge, stateVersion]);

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-background flex flex-col overflow-hidden">
        {/* Header Bar with slim toolbar */}
        <header className="border-b py-2 px-4 flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold flex items-center">
              <Focus className="mr-2 transform rotate-6" />
              <span className="">Deep Context Studio</span>
            </h1>
            <Separator orientation="vertical" className="h-6" />
            <div className="text-sm text-muted-foreground">
              {scenario?.name || "No scenario selected"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showLeftPanel ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              title="Toggle Navigation Panel"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={showRightPanel ? "secondary" : "ghost"}
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
            <aside className="w-64 border-r bg-sidebar-background flex flex-col overflow-hidden">
              <Tabs defaultValue="workspace" className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-3 px-2 py-1 h-auto rounded-none border-b">
                  <TabsTrigger
                    value="workspace"
                    title="Workspaces"
                    className="rounded-none"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="scenarios"
                    title="Scenarios"
                    className="rounded-none"
                  >
                    <Layers className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    title="Settings"
                    className="rounded-none"
                  >
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
            {/* Flow Graph Area - Adjusted height based on bottom panels */}
            <div
              className={`
                ${
                  showContextPanel || showConversationPanel || showPluginsPanel
                    ? "h-[45%]"
                    : "flex-1"
                } 
                overflow-hidden
              `}
            >
              <FlowGraph />
            </div>

            {/* Bottom Toolbar */}
            <div className="border-t bg-card py-1 px-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={showContextPanel ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => setShowContextPanel(!showContextPanel)}
                >
                  <Database className="h-3.5 w-3.5" />
                  Context
                </Button>
                <Button
                  variant={showConversationPanel ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() =>
                    setShowConversationPanel(!showConversationPanel)
                  }
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Conversation
                </Button>
                <Button
                  variant={showPluginsPanel ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => setShowPluginsPanel(!showPluginsPanel)}
                >
                  <Puzzle className="h-3.5 w-3.5" />
                  Plugins
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
                {scenario?.children?.length || 0} nodes ·{" "}
                {scenario?.edges?.length || 0} edges
              </div>
            </div>

            {/* Bottom Panels Container */}
            <div
              className={`${
                !showContextPanel && !showConversationPanel && !showPluginsPanel
                  ? "hidden"
                  : "flex"
              } border-t h-[55%]`}
            >
              {/* Context Panel (if visible) */}
              {showContextPanel && (
                <div
                  className={`${
                    showConversationPanel || showPluginsPanel ? "border-r" : ""
                  } 
                  ${
                    showConversationPanel && showPluginsPanel
                      ? "w-1/3"
                      : showConversationPanel || showPluginsPanel
                      ? "w-1/2"
                      : "w-full"
                  } 
                  bg-card overflow-auto`}
                >
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

              {/* Conversation Panel (if visible) */}
              {showConversationPanel && (
                <div
                  className={`${showPluginsPanel ? "border-r" : ""} 
                  ${
                    showContextPanel && showPluginsPanel
                      ? "w-1/3"
                      : showContextPanel || showPluginsPanel
                      ? "w-1/2"
                      : "w-full"
                  } 
                  bg-card overflow-auto`}
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b">
                    <h3 className="text-sm font-medium">
                      Conversation History
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowConversationPanel(false)}
                      className="h-7 w-7 p-0"
                    >
                      ×
                    </Button>
                  </div>
                  <div className="h-[calc(100%-40px)] overflow-auto">
                    <ConversationPanel />
                  </div>
                </div>
              )}

              {/* Plugins Panel (if visible) */}
              {showPluginsPanel && (
                <div
                  className={`
                  ${
                    showContextPanel && showConversationPanel
                      ? "w-1/3"
                      : showContextPanel || showConversationPanel
                      ? "w-1/2"
                      : "w-full"
                  } 
                  bg-card overflow-auto`}
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b">
                    <h3 className="text-sm font-medium">Plugins</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPluginsPanel(false)}
                      className="h-7 w-7 p-0"
                    >
                      ×
                    </Button>
                  </div>
                  <div className="h-[calc(100%-40px)] overflow-auto">
                    <PluginsPanel />
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Right Panel - Properties (collapsible) */}
          {showRightPanel && (
            <aside className="w-72 border-l bg-sidebar-background flex flex-col overflow-hidden">
              <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex-1 flex flex-col">
                <TabsList className="grid grid-cols-2 px-2 py-1 h-auto rounded-none border-b">
                  <TabsTrigger value="nodes" className="rounded-none">
                    Nodes
                  </TabsTrigger>
                  <TabsTrigger value="edges" className="rounded-none">
                    Edges
                  </TabsTrigger>
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
      </div>
    </ThemeProvider>
  );
};

export default App;