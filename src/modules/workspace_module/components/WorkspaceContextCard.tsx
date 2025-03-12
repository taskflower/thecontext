// src/modules/workspaces_module/components/WorkspaceContextCard.tsx
import React from "react";
import { Globe } from "lucide-react";

import MCard from "@/components/MCard";
import { useWorkspaceStore } from "../workspaceStore";
import WorkspaceContext from "../WorkspaceContext";

const WorkspaceContextCard: React.FC = () => {
  const { currentWorkspaceId } = useWorkspaceStore();

  if (!currentWorkspaceId) return null;

  return (
    <MCard
      title={
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 " />
          <span>Active Workspace Context</span>
        </div>
      }
      description="Context available to all scenarios in this workspace"
    >
      <WorkspaceContext workspaceId={currentWorkspaceId} />
    </MCard>
  );
};

export default WorkspaceContextCard;