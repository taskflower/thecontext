import { useState } from "react";
import { Focus, PanelLeft, Puzzle, MessageSquare, Database, Layers, GitBranch, FolderOpen, Code, Sun, Moon } from "lucide-react";


import WorkspacesList from "./modules/workspaces/components/WorkspacesList";
import ScenariosList from "./modules/scenarios/components/ScenariosList";
import NodesList from "./modules/graph/components/NodesList";
import { EdgesList } from "./modules/graph/components";
import FlowGraph from "./modules/flow/components/FlowGraph";
import PluginsApp from "./modules/plugins/PluginsApp";
import { useTheme } from "./components/ThemeProvider";
import { cn } from "./utils/utils";
import ConversationHistoryPanel from "./modules/conversation/components/ConversationHistoryPanel";

type PanelContentType = "context" | "conversation" | "plugins" | "";

const App = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [activeTab, setActiveTab] = useState("workspace");
  const [bottomPanelContent, setBottomPanelContent] = useState<PanelContentType>("");

  // Toggle panel handlers
  const togglePanel = (setter: React.Dispatch<React.SetStateAction<boolean>>, state: boolean) => () => setter(!state);
  
  // Show bottom panel with specific content
  const showPanel = (content: PanelContentType) => {
    if (bottomPanelContent === content && showBottomPanel) {
      setShowBottomPanel(false);
    } else {
      setBottomPanelContent(content);
      setShowBottomPanel(true);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border h-14 px-4 flex items-center justify-between bg-background z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold flex items-center">
            <Focus className="mr-2 h-5 w-5 text-primary" />
            <span>Deep Context Studio</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="p-2 rounded-md hover:bg-muted text-foreground"
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button 
            className={cn(
              "p-2 rounded-md text-foreground",
              showLeftPanel ? "bg-muted" : "hover:bg-muted/50"
            )}
            onClick={togglePanel(setShowLeftPanel, showLeftPanel)}
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        {showLeftPanel && (
          <aside className="w-80 border-r border-border flex flex-col overflow-hidden bg-muted/20">
            <nav className="p-1 flex border-b border-border">
              <TabButton 
                icon={<FolderOpen className="h-4 w-4" />}
                label="Workspace"
                active={activeTab === 'workspace'}
                onClick={() => setActiveTab('workspace')}
              />
              <TabButton 
                icon={<GitBranch className="h-4 w-4" />}
                label="Scenarios"
                active={activeTab === 'scenarios'}
                onClick={() => setActiveTab('scenarios')}
              />
              <TabButton 
                icon={<Layers className="h-4 w-4" />}
                label="Nodes"
                active={activeTab === 'nodes'}
                onClick={() => setActiveTab('nodes')}
              />
              <TabButton 
                icon={<Code className="h-4 w-4" />}
                label="Edges"
                active={activeTab === 'edges'}
                onClick={() => setActiveTab('edges')}
              />
            </nav>
            
            <div className="flex-1 overflow-auto">
              {activeTab === 'workspace' && <WorkspacesList />}
              {activeTab === 'scenarios' && <ScenariosList />}
              {activeTab === 'nodes' && <NodesList />}
              {activeTab === 'edges' && <EdgesList />}
            </div>
          </aside>
        )}

        {/* Main workspace */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Flow graph area */}
          <div className={cn(
            "flex-1 overflow-hidden",
            showBottomPanel ? "h-1/3" : "h-full"
          )}>
            <FlowGraph />
          </div>

          {/* Bottom panel */}
          {showBottomPanel && (
            <div className="border-t border-border bg-background flex flex-col h-2/3">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/10">
                <h3 className="text-sm font-medium">
                  {bottomPanelContent === 'context' && 'Context Manager'}
                  {bottomPanelContent === 'conversation' && 'Conversation History'}
                  {bottomPanelContent === 'plugins' && 'Plugins'}
                </h3>
                <button 
                  className="p-1 rounded-md hover:bg-muted/50"
                  onClick={() => setShowBottomPanel(false)}
                >
                  <span className="sr-only">Close panel</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                    <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                {bottomPanelContent === 'plugins' && <div className="p-4"><PluginsApp/></div>}
                {bottomPanelContent === 'context' && <div className="p-4">Context content</div>}
                {bottomPanelContent === 'conversation' && <div className="p-4">Conversation content
                  <ConversationHistoryPanel/>
                  </div>}
              </div>
            </div>
          )}
          
          {/* Bottom toolbar */}
          <div className="border-t border-border bg-muted/10 py-2 px-4 flex items-center">
            <div className="flex items-center gap-2">
              <ToolbarButton 
                icon={<Database className="h-4 w-4" />}
                label="Context"
                active={bottomPanelContent === 'context' && showBottomPanel}
                onClick={() => showPanel('context')}
              />
              <ToolbarButton 
                icon={<MessageSquare className="h-4 w-4" />}
                label="Conversation"
                active={bottomPanelContent === 'conversation' && showBottomPanel}
                onClick={() => showPanel('conversation')}
              />
              <ToolbarButton 
                icon={<Puzzle className="h-4 w-4" />}
                label="Plugins"
                active={bottomPanelContent === 'plugins' && showBottomPanel}
                onClick={() => showPanel('plugins')}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Tab button component
const TabButton = ({ icon, label, active, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => {
  return (
    <button 
      className={cn(
        "flex-1 py-2 px-3 text-xs font-medium rounded-md flex flex-col items-center gap-1",
        active 
          ? "bg-background text-primary" 
          : "text-muted-foreground hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

// Toolbar button component
const ToolbarButton = ({ icon, label, active, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => {
  return (
    <button 
      className={cn(
        "py-1.5 px-3 rounded-md flex items-center gap-2 text-sm font-medium",
        active 
          ? "bg-muted text-primary" 
          : "text-muted-foreground hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default App;