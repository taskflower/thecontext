import { useState } from "react";
import { cn } from "@/utils/utils";

import { Header } from "@/components/studio/Header";
import { LeftPanel } from "@/components/studio/LeftPanel";
import { BottomPanel } from "@/components/studio/BottomPanel";
import { BottomToolbar } from "@/components/studio/BottomToolbar";
import FlowGraph from "@/components/studio/FlowGraph";


// Typ dla zawartości dolnego panelu
type PanelContentType = "context" | "filters" | "conversation" | "plugins" | "";

const Studio: React.FC = () => {
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [bottomPanelContent, setBottomPanelContent] =
    useState<PanelContentType>("");

  // Toggle panel handler
  const toggleLeftPanel = (): void => setShowLeftPanel(!showLeftPanel);

  // Show bottom panel with specific content
  const showPanel = (content: PanelContentType): void => {
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
      <Header showLeftPanel={showLeftPanel} toggleLeftPanel={toggleLeftPanel} />

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
              content={bottomPanelContent}
              onClose={() => setShowBottomPanel(false)}
            />
          )}

          {/* Bottom toolbar */}
          <BottomToolbar
            activeContent={showBottomPanel ? bottomPanelContent : ""}
            onSelectContent={showPanel}
          />
        </main>
      </div>
    </div>
  );
};

export default Studio;
