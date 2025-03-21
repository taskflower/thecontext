import React, { useState } from "react";
import { Focus, PanelLeft, Puzzle, MessageSquare, Database, Layers, GitBranch, FolderOpen, Code } from "lucide-react";
import { WorkspacesList, ScenariosList, NodesList, EdgesList } from './features/Components';
import FlowGraph from './features/ReactFlow';
import PluginsApp from "./featuresPlugins/PluginsApp";

const App = () => {
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [activeTab, setActiveTab] = useState("workspace");
  const [bottomPanelContent, setBottomPanelContent] = useState("");

  // Toggle panel handlers
  const togglePanel = (panel, setter, state) => () => setter(!state);
  
  // Show bottom panel with specific content
  const showPanel = (content) => {
    setBottomPanelContent(content);
    setShowBottomPanel(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
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
            className={`p-1.5 rounded ${showLeftPanel ? 'bg-gray-200' : 'bg-transparent'}`}
            onClick={togglePanel('left', setShowLeftPanel, showLeftPanel)}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        {showLeftPanel && (
          <aside className="w-64 border-r bg-sidebar-background flex flex-col overflow-hidden">
            <div className="flex border-b">
              <button 
                className={`flex-1 py-2 ${activeTab === 'workspace' ? 'border-b-2 border-blue-500' : ''}`}
                onClick={() => setActiveTab('workspace')}
              >
                <FolderOpen className="h-4 w-4 mx-auto" />
              </button>
              <button 
                className={`flex-1 py-2 ${activeTab === 'scenarios' ? 'border-b-2 border-blue-500' : ''}`}
                onClick={() => setActiveTab('scenarios')}
              >
                <GitBranch className="h-4 w-4 mx-auto" />
              </button>
              <button 
                className={`flex-1 py-2 ${activeTab === 'nodes' ? 'border-b-2 border-blue-500' : ''}`}
                onClick={() => setActiveTab('nodes')}
              >
                <Layers className="h-4 w-4 mx-auto" />
              </button>
              <button 
                className={`flex-1 py-2 ${activeTab === 'edges' ? 'border-b-2 border-blue-500' : ''}`}
                onClick={() => setActiveTab('edges')}
              >
                <Code className="h-4 w-4 mx-auto" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-2">
              {activeTab === 'workspace' && <WorkspacesList />}
              {activeTab === 'scenarios' && <ScenariosList />}
              {activeTab === 'nodes' && <NodesList />}
              {activeTab === 'edges' && <EdgesList />}
            </div>
          </aside>
        )}

        {/* Main workspace */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <FlowGraph />
          </div>

          {/* Bottom toolbar */}
          <div className="border-t bg-card py-1 px-3 flex items-center">
            <div className="flex items-center gap-2">
              <button 
                className={`py-1 px-2 rounded ${bottomPanelContent === 'context' && showBottomPanel ? 'bg-gray-200' : ''}`}
                onClick={() => bottomPanelContent === 'context' && showBottomPanel ? setShowBottomPanel(false) : showPanel('context')}
              >
                <Database className="h-3.5 w-3.5" />
              </button>
              <button 
                className={`py-1 px-2 rounded ${bottomPanelContent === 'conversation' && showBottomPanel ? 'bg-gray-200' : ''}`}
                onClick={() => bottomPanelContent === 'conversation' && showBottomPanel ? setShowBottomPanel(false) : showPanel('conversation')}
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </button>
              <button 
                className={`py-1 px-2 rounded ${bottomPanelContent === 'plugins' && showBottomPanel ? 'bg-gray-200' : ''}`}
                onClick={() => bottomPanelContent === 'plugins' && showBottomPanel ? setShowBottomPanel(false) : showPanel('plugins')}
              >
                <Puzzle className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </main>
      </div>
      
      {/* Bottom panel */}
      {showBottomPanel && (
        <div className="h-2/3 absolute bottom-0 left-0 right-0 border-t bg-card p-3 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
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
          <div className="bg-white rounded h-[calc(100%-30px)] overflow-auto">
            {bottomPanelContent === 'plugins' && <div className="p-3"><PluginsApp/></div>}
            {bottomPanelContent === 'context' && <div className="p-3">Context content</div>}
            {bottomPanelContent === 'conversation' && <div className="p-3">Conversation content</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;