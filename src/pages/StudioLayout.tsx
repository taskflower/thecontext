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
  Mail,
  ChevronDown,
  LogOut,
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

import { useAppStore } from "../modules/store";
import { PluginsPanel } from "@/modules/plugin";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

import { auth, googleProvider } from "@/firebase/config";

import { signInWithPopup } from "firebase/auth";
import { useAuthState } from "@/hooks";
import { useNavigate } from "react-router-dom";
import { ExportImport } from "@/components/ExportImport";

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
  const navigate = useNavigate();

  const { user } = useAuthState();
  const [showExportImport, setShowExportImport] = useState(false);

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/studio");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

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
              {/* User Authentication Section */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center text-sm gap-2 shadow-sm"
                    >
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Wyloguj się</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  size="default"
                  className="flex items-center gap-2"
                  onClick={handleGoogleLogin}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Continue with Google
                </Button>
              )}
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
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowExportImport(true)}
                        >
                          Data Management
                        </Button>
                        {showExportImport && (
                          <ExportImport
                            open={showExportImport}
                            onClose={() => setShowExportImport(false)}
                          />
                        )}
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
