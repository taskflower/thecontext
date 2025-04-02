import {
  Filter,
  MessageSquare,
  Puzzle,
  LayoutDashboard,
  Save,
  Layers,
} from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";
import React from "react";
import { usePanelStore } from "@/modules/PanelStore";

export const BottomToolbar: React.FC = () => {
  const { bottomPanelTab, toggleBottomPanel } = usePanelStore();

  return (
    <div className="border-t border-border bg-muted/10 py-2 px-4 flex items-center">
      <div className="flex items-center gap-2 justify-between md:justify-start flex-1">
        <ToolbarButton
          icon={<MessageSquare className="h-4 w-4" />}
          label="Conversations History"
          active={bottomPanelTab === "conversation"}
          onClick={() => toggleBottomPanel("conversation")}
        />
        <ToolbarButton
          icon={<Layers className="h-4 w-4" />}
          label="Context"
          active={bottomPanelTab === "context"}
          onClick={() => toggleBottomPanel("context")}
        />
        <ToolbarButton
          icon={<Filter className="h-4 w-4" />}
          label="Filters"
          active={bottomPanelTab === "filters"}
          onClick={() => toggleBottomPanel("filters")}
        />

        <ToolbarButton
          icon={<Puzzle className="h-4 w-4" />}
          label="Plugins"
          active={bottomPanelTab === "plugins"}
          onClick={() => toggleBottomPanel("plugins")}
        />
        <ToolbarButton
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Dashboards"
          active={bottomPanelTab === "dashboard"}
          onClick={() => toggleBottomPanel("dashboard")}
        />
        <ToolbarButton
          icon={<Save className="h-4 w-4" />}
          label="Export/Import"
          active={bottomPanelTab === "exportimport"}
          onClick={() => toggleBottomPanel("exportimport")}
        />
      </div>
    </div>
  );
};
