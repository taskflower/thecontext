import { cn } from "@/utils/utils";

// Import components from barrel file
import { 
  Header,
  LeftPanel,
  BottomPanel,
  BottomToolbar,
  FlowGraph
} from "@/components/studio";
import { usePanelStore } from "@/modules/PanelStore";

// Import store


const Studio: React.FC = () => {
  // Get state and actions from the store
  const {
    showLeftPanel,

    showBottomPanel,
    bottomPanelTab,
    toggleBottomPanel
  } = usePanelStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <Header />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        {showLeftPanel && <LeftPanel />}

        {/* Main workspace */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Flow graph area */}
          <div
            className={cn(
              "flex-1 overflow-hidden",
              showBottomPanel ? "h-1/3" : "h-full"
            )}
          >
            <FlowGraph />
          </div>

          {/* Bottom panel */}
          {showBottomPanel && (
            <BottomPanel
              content={bottomPanelTab}
              onClose={() => toggleBottomPanel()}
            />
          )}

          {/* Bottom toolbar */}
          <BottomToolbar
            
          />
        </main>
      </div>
    </div>
  );
};

export default Studio;