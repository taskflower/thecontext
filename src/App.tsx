/* eslint-disable @typescript-eslint/no-explicit-any */
// src/App.tsx
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

// UI Components
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Toaster } from "./hooks/useToast";

// App Components
import AppHeader from "./components/layout/AppHeader";
import PluginInitializer from "./plugins/PluginInitializer";
import PluginsTab from "./components/plugins/PluginsTab";
import FlowEditor from "./components/nodes/FlowEditor";
import { ScenariosList } from "./components/scenarios/ScenariosList";
import { ScenarioExecution } from "./components/scenarios/ScenarioExecution";
import { WorkspacesList } from "./components/workspaces/WorkspacesList";

// Icons
import { Puzzle, Play, Database, Cog, Box, Network } from "lucide-react";

// Utilities
import { cn } from "./utils/utils";
import { registerStoresForPlugins } from "./stores";
import { registerAllPlugins } from "./plugins/registerPlugins";
import { useWorkspaceStore } from "./stores/workspaceStore";

// Dialog System
import { AppDialogs } from "./components/dialogs/AppDialogs";
import { DialogProvider } from "./context/DialogContext";

// Initialize plugin system
registerStoresForPlugins();

// Types
interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const App = () => {
  useEffect(() => {
    // Register all plugins and stores on application start
    registerAllPlugins();
    registerStoresForPlugins();
  }, []);

  return (
    <Router>
      <DialogProvider>
        <div className="min-h-screen h-screen flex">
          <PluginInitializer />
          <Toaster />
          <Sidebar />
          <MainContent />
          <AppDialogs />
        </div>
      </DialogProvider>
    </Router>
  );
};

const Sidebar = () => (
  <aside className="w-64 bg-white h-full overflow-hidden flex flex-col">
    <div className="p-6">
      <h2 className="text-lg font-bold">DEEP CONTEXT</h2>
      <p className="text-sm text-muted-foreground">
        Build, test, and iterate on prompt workflows. v.0.24.60
      </p>
    </div>
    <ScrollArea className="flex-1">
      <div className="px-3 py-2">
        <SidebarNav />
      </div>
    </ScrollArea>
  </aside>
);

const SidebarNav = () => (
  <div className="space-y-1">
    <SidebarItem href="/" icon={<Box className="h-4 w-4 mr-2" />}>
      Containers
    </SidebarItem>
    <SidebarItem href="/scenarios" icon={<Cog className="h-4 w-4 mr-2" />}>
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

const SidebarItem = ({ href, icon, children }: SidebarItemProps) => (
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

const MainContent = () => (
  <div className="flex-1 flex flex-col overflow-hidden">
    <AppHeader />
    <ScrollArea className="flex-1">
      <div className="p-6 pt-0 h-[calc(100vh-theme(spacing.6)-theme(spacing.16))]">
        <Routes>
          <Route path="/" element={<WorkspacePage />} />
          <Route path="/scenarios" element={<ScenariosList />} />
          <Route path="/flow-editor" element={<FlowEditor />} />
          <Route path="/plugins" element={<PluginsTab />} />
          <Route path="/execute" element={<ExecutePage />} />
        </Routes>
      </div>
    </ScrollArea>
    <Footer />
  </div>
);

const Footer = () => (
  <footer className="p-6 text-center text-sm text-slate-500">
    <p>© {new Date().getFullYear()} DEEP CONTEXT - Redesigned Architecture</p>
  </footer>
);

// Page Components
const WorkspacePage = () => (
  <div className="space-y-6">
    <WorkspacesList />
  </div>
);

const ExecutePage = () => {
  const { getCurrentWorkspace } = useWorkspaceStore();
  const workspace = getCurrentWorkspace();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <ScenarioExecution />
      </div>
      <WorkspaceContext workspace={workspace} />
    </div>
  );
};

const WorkspaceContext = ({ workspace }: { workspace: any }) => (
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
                <ContextItem key={key} name={key} value={value} />
              ))}
            </div>
          ) : (
            <EmptyState message="No context data in this workspace." />
          )
        ) : (
          <EmptyState message="No active workspace." />
        )}
      </div>
    </ScrollArea>
  </div>
);

const ContextItem = ({ name, value }: { name: string; value: any }) => (
  <div className="border rounded p-3">
    <div className="font-medium text-sm">{name}</div>
    <div className="mt-1 text-xs bg-slate-50 p-2 rounded overflow-x-auto">
      <pre>
        {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
      </pre>
    </div>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-6 text-slate-500">{message}</div>
);

export default App;