import { cn } from "@/utils/utils";
import { useAppStore } from "@/modules/store";

// Import components from barrel file
import { 
  Header,
  LeftPanel,
  BottomPanel,
  BottomToolbar,
  FlowGraph
} from "@/components/studio";
import { usePanelStore } from "@/modules/PanelStore";

// Import dialogs
import { 
  EditNode, 
  EditEdge, 
  PluginOptionsEditor,
  AddNewNode,
  AddNewEdge 
} from "@/modules/graph/components";
import PluginDialog from "@/components/studio/PluginDialog";

const Studio: React.FC = () => {
  // Get state and actions from panel store
  const {
    showLeftPanel,
    showBottomPanel,
    bottomPanelTab,
    toggleBottomPanel,
    
    // Dialog state and actions
    activeDialog,
    dialogProps,
    openDialog,
    closeDialog
  } = usePanelStore();
  
  // Get app store state
  const selectedNodeId = useAppStore((state) => state.selected.node);
  
  // Event handlers for child components
  const handleEditNode = () => {
    if (selectedNodeId) {
      openDialog('editNode', { nodeId: selectedNodeId });
    }
  };
  
  const handleConfigurePlugin = () => {
    if (selectedNodeId) {
      openDialog('configurePlugin', { nodeId: selectedNodeId });
    }
  };
  
  const handleEditPluginOptions = () => {
    if (selectedNodeId) {
      openDialog('editPluginOptions', { nodeId: selectedNodeId });
    }
  };
  
  const handleEditEdge = (edgeId: string) => {
    openDialog('editEdge', { edgeId });
  };
  
  const handleAddNode = () => {
    openDialog('addNode');
  };
  
  const handleAddEdge = () => {
    openDialog('addEdge');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <Header />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        {showLeftPanel && (
          <LeftPanel 
            onEditNode={handleEditNode}
            onConfigurePlugin={handleConfigurePlugin}
            onEditPluginOptions={handleEditPluginOptions}
            onEditEdge={handleEditEdge}
            onAddNode={handleAddNode}
            onAddEdge={handleAddEdge}
          />
        )}

        {/* Main workspace */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Flow graph area */}
          <div
            className={cn(
              "flex-1 overflow-hidden",
              showBottomPanel ? "h-1/3" : "h-full"
            )}
          >
            <FlowGraph 
              onEditNode={handleEditNode}
              onConfigurePlugin={handleConfigurePlugin}
              onEditPluginOptions={handleEditPluginOptions}
            />
          </div>

          {/* Bottom panel */}
          {showBottomPanel && (
            <BottomPanel
              content={bottomPanelTab}
              onClose={() => toggleBottomPanel()}
            />
          )}

          {/* Bottom toolbar */}
          <BottomToolbar />
        </main>
      </div>

      {/* Shared dialogs */}
      {activeDialog === 'editNode' && selectedNodeId && (
        <EditNode
          isOpen={true}
          setIsOpen={(isOpen) => !isOpen && closeDialog()}
          nodeId={selectedNodeId}
        />
      )}
      
      {activeDialog === 'configurePlugin' && selectedNodeId && (
        <PluginDialog
          isOpen={true}
          setIsOpen={(isOpen) => !isOpen && closeDialog()}
          nodeId={selectedNodeId}
        />
      )}
      
      {activeDialog === 'editPluginOptions' && selectedNodeId && (
        <PluginOptionsEditor
          nodeId={selectedNodeId}
          onClose={() => closeDialog()}
        />
      )}
      
      {activeDialog === 'editEdge' && dialogProps.edgeId && (
        <EditEdge
          isOpen={true}
          setIsOpen={(isOpen) => !isOpen && closeDialog()}
          edgeId={dialogProps.edgeId}
        />
      )}
      
      {activeDialog === 'addNode' && (
        <AddNewNode
          isOpen={true}
          setIsOpen={(isOpen) => !isOpen && closeDialog()}
        />
      )}
      
      {activeDialog === 'addEdge' && (
        <AddNewEdge
          isOpen={true}
          setIsOpen={(isOpen) => !isOpen && closeDialog()}
        />
      )}
    </div>
  );
};

export default Studio;