// components/BottomPanel.tsx
import { PluginsApp } from "@/modules/plugins";
import { FiltersList } from "@/modules/filters";
import { ContextsList } from "@/modules/context";
import HistoryView from "@/modules/history/components/HistoryView";
import { useAppStore } from "@/modules/store";
import React from "react";

type PanelContentType = "context" | "filters" | "conversation" | "plugins" | "";

interface BottomPanelProps {
  content: PanelContentType;
  onClose: () => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({ content, onClose }) => {
  // Get selected workspace for context
  const selectedWorkspaceId = useAppStore((state) => state.selected.workspace);
  const selectedScenarioId = useAppStore((state) => state.selected.scenario);

  return (
    <div className="border-t border-border bg-background flex flex-col h-2/3">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/10">
        <h3 className="text-sm font-medium">
          {content === "context" && "Context Manager"}
          {content === "filters" && "Filters Manager"}
          {content === "conversation" && "Conversation History"}
          {content === "plugins" && "Plugins"}
        </h3>
        <button
          className="p-1 rounded-md hover:bg-muted/50"
          onClick={onClose}
        >
          <span className="sr-only">Close panel</span>
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
          >
            <path
              d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {content === "plugins" && (
          <div className="p-4">
            <PluginsApp />
          </div>
        )}
        {content === "filters" && (
          <div className="h-full">
            {selectedWorkspaceId && selectedScenarioId ? (
              <FiltersList />
            ) : (
              <div className="flex items-center justify-center h-full p-4 text-muted-foreground text-center">
                <div>
                  <p>Please select a workspace and scenario first</p>
                  <p className="text-sm mt-1">
                    Filters are associated with scenarios
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        {content === "context" && (
          <div className="h-full">
            {selectedWorkspaceId ? (
              <ContextsList />
            ) : (
              <div className="flex items-center justify-center h-full p-4 text-muted-foreground text-center">
                <div>
                  <p>Please select a workspace first</p>
                  <p className="text-sm mt-1">
                    Context items are associated with workspaces
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        {content === "conversation" && (
          <div className="p-4">
            <HistoryView />
          </div>
        )}
      </div>
    </div>
  );
};