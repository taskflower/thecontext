// src/layouts/StudioLayout.tsx
import React, { useState } from "react";
import { ThemeProvider } from "../components/ui/theme-provider";
import { DialogProvider } from "../components/APPUI/DialogProvider";
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

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/APPUI/ThemeToggle";
import { ScrollArea } from "../components/ui/scroll-area";

import { WorkspacesList } from "../modules/workspaces";
import { ScenariosList } from "../modules/scenarios";
import { FlowGraph } from "../modules/flow";
import { NodesList } from "../modules/nodes";
import { EdgesList } from "../modules/edges";
import { ContextsList } from "../modules/context";
import { ConversationPanel } from "../modules/conversation/ConversationPanel";
import { PluginsPanel } from "../modules/plugin/components/PluginsPanel";

import { useAppStore } from "../modules/store";

const StudioLayout: React.FC = () => {
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [showConversationPanel, setShowConversationPanel] = useState(false);
  const [showPluginsPanel, setShowPluginsPanel] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState("nodes");

  // Pobierz aktualny scenariusz oraz informacje o wybranym workspace
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const selected = useAppStore((state) => state.selected);
  const stateVersion = useAppStore((state) => state.stateVersion);
  const scenario = getCurrentScenario();
  const activeWorkspace = useAppStore((state) =>
    state.items.find((w) => w.id === selected.workspace)
  );
  const activeScenario = scenario;

  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  // Handle left panel toggling from FlowGraph
  const handleToggleLeftPanel = (show: boolean) => {
    setShowLeftPanel(show);
  };

  // Automatycznie otwieraj panel właściwości, gdy wybrany jest węzeł lub krawędź
  React.useEffect(() => {
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
      <DialogProvider>
        <div className="min-h-screen bg-background flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b py-2 px-4 flex items-center justify-between bg-card">
            <div className="flex items-center gap-3">
              <h1 className="text-sm font-bold flex items-center">
                <Focus className="mr-2 transform rotate-6" />
                <span>Deep Context Studio</span>
              </h1>
              <Separator orientation="vertical" className="h-6" />
              <div className="text-sm text-muted-foreground">
                {activeWorkspace?.title} /{" "}
                {activeScenario?.name || "No scenario selected"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showLeftPanel ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowLeftPanel(!showLeftPanel)}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={showRightPanel ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowRightPanel(!showRightPanel)}
              >
                <PanelRight className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <ThemeToggle />
            </div>
          </header>

          {/* Główna zawartość */}
          <div className="flex-1 flex overflow-hidden">
            {/* Lewy panel */}
            {showLeftPanel && (
              <aside className="w-96 border-r bg-sidebar-background flex flex-col overflow-hidden">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value)}
                  className="flex-1 flex flex-col"
                >
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

            {/* Główna strefa robocza */}
            <main className="flex-1 flex flex-col overflow-hidden">
              <div
                className={`
                  ${
                    showContextPanel ||
                    showConversationPanel ||
                    showPluginsPanel
                      ? "h-[45%]"
                      : "flex-1"
                  } 
                  overflow-hidden
                `}
              >
                <FlowGraph onToggleLeftPanel={handleToggleLeftPanel} />
              </div>

              {/* Dolny pasek narzędzi */}
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
                  {activeScenario?.children?.length || 0} nodes ·{" "}
                  {activeScenario?.edges?.length || 0} edges
                </div>
              </div>

              {/* Dolne panele */}
              <div
                className={`${
                  !showContextPanel &&
                  !showConversationPanel &&
                  !showPluginsPanel
                    ? "hidden"
                    : "flex"
                } border-t h-[55%]`}
              >
                {showContextPanel && (
                  <div
                    className={`${
                      showConversationPanel || showPluginsPanel
                        ? "border-r"
                        : ""
                    } 
                    ${
                      showConversationPanel && showPluginsPanel
                        ? "w-1/3"
                        : showConversationPanel || showPluginsPanel
                        ? "w-1/2"
                        : "w-full"
                    } 
                    bg-card`}
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b bg-background">
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
                    <ScrollArea className="h-[calc(100%-40px)]">
                      <ContextsList />
                    </ScrollArea>
                  </div>
                )}

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
                    bg-card`}
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b bg-background">
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
                    <ScrollArea className="h-[calc(100%-40px)]">
                      <ConversationPanel />
                    </ScrollArea>
                  </div>
                )}

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
                    bg-card`}
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b bg-background">
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
                    <ScrollArea className="h-[calc(100%-40px)]">
                      <PluginsPanel />
                    </ScrollArea>
                  </div>
                )}
              </div>
            </main>

            {/* Prawy panel właściwości */}
            {showRightPanel && (
              <aside className="w-80 border-l bg-sidebar-background flex flex-col overflow-hidden">
                <Tabs
                  value={rightPanelTab}
                  onValueChange={setRightPanelTab}
                  className="flex-1 flex flex-col"
                >
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
      </DialogProvider>
    </ThemeProvider>
  );
};

export default StudioLayout;