// src/App.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import store hooks

// Import components

import PluginsTab from "./components/plugins/PluginsTab";

// Import icons
import {
  Folder,
  Code,
  Puzzle,
  Play,
  Database,
  LayoutDashboard,
} from "lucide-react";

// Import utilities
import { registerStoresForPlugins } from "./stores";
import { Toaster } from "./hooks/useToast";
import FlowEditor from "./components/nodes/FlowEditor";
import PluginInitializer from "./plugins/PluginInitializer";
import { ScenariosList } from "./components/scenarios/ScenariosList";
import { ScenarioExecution } from "./components/scenarios/ScenarioExecution";
import { WorkspacesList } from "./components/workspaces/WorkspacesList";
import { WorkspaceContextPanel } from "./components/workspaces/WorkspaceContextPanel";
import { useWorkspaceStore } from "./stores/workspaceStore";
import { useEffect } from "react";
import { registerAllPlugins } from "./plugins/registerPlugins";


// Initialize plugin system
registerStoresForPlugins();

function App() {
  const { getCurrentWorkspace } = useWorkspaceStore();
  const workspace = getCurrentWorkspace();
  

  useEffect(() => {
    // Register all plugins on application start
    registerAllPlugins();
    
    // Register store API for plugin access
    registerStoresForPlugins();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Load plugins */}
      <PluginInitializer />

      {/* Toast notifications */}
      <Toaster />

      <div className="container mx-auto py-8 px-4">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="">THE CONTEXT</p>

            <p className="text-muted-foreground">
              Build, test, and iterate on prompt workflows with plugins
            </p>
          </div>

          {workspace && (
            <div className="mt-2 flex items-center text-sm border border-sidebar-foreground rounded-lg p-3 px-4 shadow-sidebar">
              <Folder className="h-4 w-4 mr-1" />
              Current workspace:{" "}
              <span className="font-medium ml-1">{workspace.name}</span>
            </div>
          )}
        </header>

        <main>
          <Tabs defaultValue="workspaces" className="space-y-4">
            <TabsList className="grid grid-cols-6">
              <TabsTrigger value="workspaces">
                <Folder className="h-4 w-4 mr-2" />
                Workspaces
              </TabsTrigger>
              <TabsTrigger value="scenarios">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Scenarios
              </TabsTrigger>
              <TabsTrigger value="flow-editor">
                <Code className="h-4 w-4 mr-2" />
                Flow Editor
              </TabsTrigger>

              <TabsTrigger value="plugins">
                <Puzzle className="h-4 w-4 mr-2" />
                Plugins
              </TabsTrigger>
              <TabsTrigger value="execute">
                <Play className="h-4 w-4 mr-2" />
                Execute
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workspaces" className="space-y-6">
              <WorkspacesList />

              {workspace && (
                <div className="mt-8">
                  <WorkspaceContextPanel />
                </div>
              )}
            </TabsContent>

            <TabsContent value="scenarios">
              <ScenariosList />
            </TabsContent>

            <TabsContent value="flow-editor">
              <div
                className="border rounded-md bg-white"
                style={{ height: "calc(100vh - 240px)" }}
              >
                <FlowEditor />
              </div>
            </TabsContent>

            <TabsContent value="plugins">
              <PluginsTab />
            </TabsContent>

            <TabsContent value="execute">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScenarioExecution />

                <div className="border rounded-md">
                  <div className="p-4 border-b">
                    <h2 className="font-bold flex items-center">
                      <Database className="h-4 w-4 mr-2 text-blue-500" />
                      Workspace Context
                    </h2>
                  </div>
                  <ScrollArea className="h-[500px]">
                    <div className="p-4">
                      {workspace ? (
                        Object.keys(workspace.context).length > 0 ? (
                          <div className="space-y-2">
                            {Object.entries(workspace.context).map(
                              ([key, value]) => (
                                <div key={key} className="border rounded p-3">
                                  <div className="font-medium text-sm">
                                    {key}
                                  </div>
                                  <div className="mt-1 text-xs bg-slate-50 p-2 rounded overflow-x-auto">
                                    <pre>
                                      {typeof value === "object"
                                        ? JSON.stringify(value, null, 2)
                                        : String(value)}
                                    </pre>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-500">
                            No context data in this workspace.
                          </div>
                        )
                      ) : (
                        <div className="text-center py-6 text-slate-500">
                          No active workspace.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <footer className="mt-12 text-center text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} THE CONTEXT - Redesigned Architecture
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
