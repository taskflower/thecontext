/* eslint-disable @typescript-eslint/no-explicit-any */
// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

// Import components
import PluginsTab from "./components/plugins/PluginsTab";
import FlowEditor from "./components/nodes/FlowEditor";
import PluginInitializer from "./plugins/PluginInitializer";
import { ScenariosList } from "./components/scenarios/ScenariosList";
import { ScenarioExecution } from "./components/scenarios/ScenarioExecution";
import { WorkspacesList } from "./components/workspaces/WorkspacesList";
import { WorkspaceContextPanel } from "./components/workspaces/WorkspaceContextPanel";
import AppHeader from "./components/layout/AppHeader";

// Import icons
import {


  Puzzle,
  Play,
  Database,
  Cog,
  Box,
  Network,
} from "lucide-react";

// Import utilities
import { registerStoresForPlugins } from "./stores";
import { Toaster } from "./hooks/useToast";
import { useWorkspaceStore } from "./stores/workspaceStore";
import { useEffect } from "react";
import { registerAllPlugins } from "./plugins/registerPlugins";
import { cn } from "./utils/utils";

// Initialize plugin system
registerStoresForPlugins();

function SidebarNav() {
  return (
    <div className="space-y-1">
      <SidebarItem href="/" icon={<Box className="h-4 w-4 mr-2" />}>
        Containers
      </SidebarItem>
      <SidebarItem
        href="/scenarios"
        icon={<Cog className="h-4 w-4 mr-2" />}
      >
        Scenarios
      </SidebarItem>
      <SidebarItem href="/flow-editor" icon={<Network className="h-4 w-4 mr-2" />}>
        Flow Editor
      </SidebarItem>
      <SidebarItem href="/plugins" icon={<Puzzle className="h-4 w-4 mr-2" />}>
        Plugins
      </SidebarItem>
      <SidebarItem href="/execute" icon={<Play className="h-4 w-4 mr-2" />}>
        Execute
      </SidebarItem>
    </div>
  );
}

function SidebarItem({ href, icon, children }: any) {
  return (
    <NavLink to={href}>
      {({ isActive }) => (
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            isActive
              ? "bg-accent text-accent-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {icon}
          {children}
        </Button>
      )}
    </NavLink>
  );
}

// Individual page components
const WorkspacePage = () => {
  const { getCurrentWorkspace } = useWorkspaceStore();
  const workspace = getCurrentWorkspace();

  return (
    <div className="space-y-6">
      <WorkspacesList />
      {workspace && (
        <div className="mt-8">
          <WorkspaceContextPanel />
        </div>
      )}
    </div>
  );
};

const ScenariosPage = () => <ScenariosList />;

const FlowEditorPage = () => <FlowEditor />;

const PluginsPage = () => <PluginsTab />;

const ExecutePage = () => {
  const { getCurrentWorkspace } = useWorkspaceStore();
  const workspace = getCurrentWorkspace();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
      <ScenarioExecution />

      </div>
           <div className="border rounded-md">
        <div className="p-4 border-b">
          <h2 className="font-bold flex items-center">
            <Database className="h-4 w-4 mr-2 text-blue-500" />
            Container Context
          </h2>
        </div>
        <ScrollArea className="h-[500px]">
          <div className="p-4">
            {workspace ? (
              Object.keys(workspace.context).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(workspace.context).map(([key, value]) => (
                    <div key={key} className="border rounded p-3">
                      <div className="font-medium text-sm">{key}</div>
                      <div className="mt-1 text-xs bg-slate-50 p-2 rounded overflow-x-auto">
                        <pre>
                          {typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : String(value)}
                        </pre>
                      </div>
                    </div>
                  ))}
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
  );
};

function AppContent() {
  return (
    <div className="flex flex-col h-full">
      <AppHeader />

      <ScrollArea className="flex-1">
        <div className="p-6 pt-0 h-[calc(100vh-theme(spacing.6)-theme(spacing.16))]">
          <Routes>
            <Route path="/" element={<WorkspacePage />} />
            <Route path="/scenarios" element={<ScenariosPage />} />
            <Route path="/flow-editor" element={<FlowEditorPage />} />
            <Route path="/plugins" element={<PluginsPage />} />
            <Route path="/execute" element={<ExecutePage />} />
          </Routes>
        </div>
      </ScrollArea>

      <footer className="p-6 text-center text-sm text-slate-500">
        <p>
          © {new Date().getFullYear()} DEEP CONTEXT - Redesigned Architecture
        </p>
      </footer>
    </div>
  );
}

function App() {
  useEffect(() => {
    // Register all plugins on application start
    registerAllPlugins();

    // Register store API for plugin access
    registerStoresForPlugins();
  }, []);

  return (
    <Router>
      <div className="min-h-screen h-screen flex ">
        {/* Load plugins */}
        <PluginInitializer />

        {/* Toast notifications */}
        <Toaster />

        {/* Sidebar */}
        <aside className="w-64 bg-white h-full overflow-hidden flex flex-col">
          <div className="p-6">
            <h2 className="text-lg font-bold">DEEP CONTEXT</h2>
            <p className="text-sm text-muted-foreground">
              Build, test, and iterate on prompt workflows. v.0.24.13
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="px-3 py-2">
              <SidebarNav />
            </div>
          </ScrollArea>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppContent />
        </div>
      </div>
    </Router>
  );
}

export default App;
