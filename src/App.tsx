import { useState } from "react";
import { Focus, PanelLeft, Puzzle, MessageSquare, Database, Layers, GitBranch, FolderOpen, Code, Sun, Moon } from "lucide-react";


import WorkspacesList from "./modules/workspaces/components/WorkspacesList";
import ScenariosList from "./modules/scenarios/components/ScenariosList";
import NodesList from "./modules/graph/components/NodesList";
import { EdgesList } from "./modules/graph/components";
import FlowGraph from "./modules/flow/components/FlowGraph";
import PluginsApp from "./modules/plugins/PluginsApp";

type PanelContentType = "context" | "conversation" | "plugins" | "";

const App = () => {
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [activeTab, setActiveTab] = useState("workspace");
  const [bottomPanelContent, setBottomPanelContent] = useState<PanelContentType>("");
  const [darkMode, setDarkMode] = useState(false);

  // Toggle panel handlers
  const togglePanel = (setter: React.Dispatch<React.SetStateAction<boolean>>, state: boolean) => () => setter(!state);
  
  // Toggle dark mode
  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  // Show bottom panel with specific content
  const showPanel = (content: PanelContentType) => {
    setBottomPanelContent(content);
    setShowBottomPanel(true);
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="border-b py-2 px-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold flex items-center">
            <Focus className="mr-2 transform rotate-6" />
            <span>Deep Context Studio</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="p-1.5 rounded hover:bg-gray-100"
            onClick={toggleDarkMode}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button 
            className={`p-1.5 rounded ${showLeftPanel ? 'bg-gray-200' : 'bg-transparent'}`}
            onClick={togglePanel(setShowLeftPanel, showLeftPanel)}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        {showLeftPanel && (
          <aside className="w-96 border-r bg-sidebar-background flex flex-col overflow-hidden">
            <div className="flex border-b bg-gray-50">
              <button 
                className={`flex-1 py-2 text-xs ${activeTab === 'workspace' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-700'}`}
                onClick={() => setActiveTab('workspace')}
              >
                <FolderOpen className="h-4 w-4 mx-auto mb-1" />
                Workspace
              </button>
              <button 
                className={`flex-1 py-2 text-xs ${activeTab === 'scenarios' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-700'}`}
                onClick={() => setActiveTab('scenarios')}
              >
                <GitBranch className="h-4 w-4 mx-auto mb-1" />
                Scenarios
              </button>
              <button 
                className={`flex-1 py-2 text-xs ${activeTab === 'nodes' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-700'}`}
                onClick={() => setActiveTab('nodes')}
              >
                <Layers className="h-4 w-4 mx-auto mb-1" />
                Nodes
              </button>
              <button 
                className={`flex-1 py-2 text-xs ${activeTab === 'edges' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-700'}`}
                onClick={() => setActiveTab('edges')}
              >
                <Code className="h-4 w-4 mx-auto mb-1" />
                Edges
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
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
          <div className={`flex-1 overflow-hidden ${showBottomPanel ? 'h-1/3' : 'h-full'}`}>
            <FlowGraph />
          </div>

          {/* Bottom panel */}
          {showBottomPanel && (
            <div className="border-t bg-card overflow-hidden flex flex-col h-2/3">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <h3 className="text-sm font-medium">
                  {bottomPanelContent === 'context' && 'Context Manager'}
                  {bottomPanelContent === 'conversation' && 'Conversation History'}
                  {bottomPanelContent === 'plugins' && 'Plugins'}
                </h3>
                <button 
                  className="p-1 text-sm"
                  onClick={() => setShowBottomPanel(false)}
                >
                  ×
                </button>
              </div>
              <div className="flex-1 bg-white overflow-auto">
                {bottomPanelContent === 'plugins' && <div className="p-3"><PluginsApp/></div>}
                {bottomPanelContent === 'context' && <div className="p-3">Context content</div>}
                {bottomPanelContent === 'conversation' && <div className="p-3">Conversation content</div>}
              </div>
            </div>
          )}
          
          {/* Bottom toolbar */}
          <div className="border-t bg-card py-1 px-3 flex items-center">
            <div className="flex items-center gap-2">
              <button 
                className={`py-1 px-2 rounded flex items-center gap-1 ${bottomPanelContent === 'context' && showBottomPanel ? 'bg-gray-200' : ''}`}
                onClick={() => bottomPanelContent === 'context' && showBottomPanel ? setShowBottomPanel(false) : showPanel('context')}
              >
                <Database className="h-3.5 w-3.5" />
                <span className="text-xs">Context</span>
              </button>
              <button 
                className={`py-1 px-2 rounded flex items-center gap-1 ${bottomPanelContent === 'conversation' && showBottomPanel ? 'bg-gray-200' : ''}`}
                onClick={() => bottomPanelContent === 'conversation' && showBottomPanel ? setShowBottomPanel(false) : showPanel('conversation')}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="text-xs">Conversation</span>
              </button>
              <button 
                className={`py-1 px-2 rounded flex items-center gap-1 ${bottomPanelContent === 'plugins' && showBottomPanel ? 'bg-gray-200' : ''}`}
                onClick={() => bottomPanelContent === 'plugins' && showBottomPanel ? setShowBottomPanel(false) : showPanel('plugins')}
              >
                <Puzzle className="h-3.5 w-3.5" />
                <span className="text-xs">Plugins</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;