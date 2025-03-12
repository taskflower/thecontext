/* eslint-disable @typescript-eslint/no-explicit-any */
// src/App.tsx
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
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
import { useWorkspaceStore } from "./stores/workspaceStore";
import { useEffect } from "react";
import { registerAllPlugins } from "./plugins/registerPlugins";
import { cn } from "./utils/utils";

// Initialize plugin system
registerStoresForPlugins();

function SidebarNav() {
  return (
    <div className="space-y-1">
      <SidebarItem 
        href="/" 
        icon={<Folder className="h-4 w-4 mr-2" />}
      >
        Workspaces
      </SidebarItem>
      <SidebarItem 
        href="/scenarios" 
        icon={<LayoutDashboard className="h-4 w-4 mr-2" />}
      >
        Scenarios
      </SidebarItem>
      <SidebarItem 
        href="/flow-editor" 
        icon={<Code className="h-4 w-4 mr-2" />}
      >
        Flow Editor
      </SidebarItem>
      <SidebarItem 
        href="/plugins" 
        icon={<Puzzle className="h-4 w-4 mr-2" />}
      >
        Plugins
      </SidebarItem>
      <SidebarItem 
        href="/execute" 
        icon={<Play className="h-4 w-4 mr-2" />}
      >
        Execute
      </SidebarItem>
    </div>
  );
}

function SidebarItem({ href, icon, children }:any) {
  return (
    <NavLink to={href}>
      {({ isActive }) => (
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
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

const FlowEditorPage = () => (
  <div
    className="border rounded-md bg-white"
    style={{ height: "100%" }}
  >
    <FlowEditor />
  </div>
);

const PluginsPage = () => <PluginsTab />;

const ExecutePage = () => {
  const { getCurrentWorkspace } = useWorkspaceStore();
  const workspace = getCurrentWorkspace();
  
  return (
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
  );
};

// Route titles component
function RouteTitle({ title }:any) {
  return <h1 className="text-xl font-bold">{title}</h1>;
}

function AppContent() {
  const { getCurrentWorkspace } = useWorkspaceStore();
  const workspace = getCurrentWorkspace();
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6">
        <div>
          <Routes>
            <Route path="/" element={<RouteTitle title="Workspaces" />} />
            <Route path="/scenarios" element={<RouteTitle title="Scenarios" />} />
            <Route path="/flow-editor" element={<RouteTitle title="Flow Editor" />} />
            <Route path="/plugins" element={<RouteTitle title="Plugins" />} />
            <Route path="/execute" element={<RouteTitle title="Execute" />} />
          </Routes>
        </div>
        
        {workspace && (
          <div className="flex items-center text-sm border border-sidebar-foreground rounded-lg p-3 px-4 shadow-sidebar">
            <Folder className="h-4 w-4 mr-1" />
            Current workspace:{" "}
            <span className="font-medium ml-1">{workspace.name}</span>
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-6 pt-0">
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
          © {new Date().getFullYear()} THE CONTEXT - Redesigned Architecture
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
      <div className="min-h-screen h-screen flex bg-gray-50">
        {/* Load plugins */}
        <PluginInitializer />

        {/* Toast notifications */}
        <Toaster />

        {/* Sidebar */}
        <aside className="w-64 border-r bg-white h-full overflow-hidden flex flex-col">
          <div className="p-6">
            <h2 className="text-lg font-bold">THE CONTEXT</h2>
            <p className="text-sm text-muted-foreground">
              Build, test, and iterate on prompt workflows
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