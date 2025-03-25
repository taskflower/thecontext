// components/BottomToolbar.tsx
import { Database, Filter, MessageSquare, Puzzle } from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";
import React from "react";

type PanelContentType = "context" | "filters" | "conversation" | "plugins" | "";

interface BottomToolbarProps {
  activeContent: PanelContentType;
  onSelectContent: (content: PanelContentType) => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({ activeContent, onSelectContent }) => {
  return (
    <div className="border-t border-border bg-muted/10 py-2 px-4 flex items-center">
      <div className="flex items-center gap-2">
        <ToolbarButton
          icon={<Database className="h-4 w-4" />}
          label="Context"
          active={activeContent === "context"}
          onClick={() => onSelectContent("context")}
        />
        <ToolbarButton
          icon={<Filter className="h-4 w-4" />}
          label="Filters"
          active={activeContent === "filters"}
          onClick={() => onSelectContent("filters")}
        />
        <ToolbarButton
          icon={<MessageSquare className="h-4 w-4" />}
          label="Conversation"
          active={activeContent === "conversation"}
          onClick={() => onSelectContent("conversation")}
        />
        <ToolbarButton
          icon={<Puzzle className="h-4 w-4" />}
          label="Plugins"
          active={activeContent === "plugins"}
          onClick={() => onSelectContent("plugins")}
        />
      </div>
    </div>
  );
};