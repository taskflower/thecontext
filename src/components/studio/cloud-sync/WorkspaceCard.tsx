// src/components/studio/cloud-sync/WorkspaceCard.tsx
import React from "react";
import { Calendar } from "lucide-react";
import { formatDate } from "./workspaceUtils";


interface WorkspaceCardProps {
  id: string;
  title: string;
  description?: string;
  updatedAt: number;
  isSelected: boolean;
  existsLocally: boolean;
  onSelect: (id: string) => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  id,
  title,
  description,
  updatedAt,
  isSelected,
  existsLocally,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(id)}
      className={`p-3 rounded-md cursor-pointer transition-colors mb-1 ${
        isSelected
          ? "bg-secondary/50 border border-secondary"
          : "hover:bg-secondary/20 border border-transparent"
      }`}
    >
      <div className="flex items-center">
        <input
          type="radio"
          id={`workspace-${id}`}
          name="workspace-selection"
          checked={isSelected}
          onChange={() => onSelect(id)}
          className="mr-3"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <p className="font-medium">{title || "Untitled Workspace"}</p>
            {existsLocally && (
              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-100 px-2 py-0.5 rounded-sm">
                Exists locally
              </span>
            )}
          </div>

          {description && (
            <p className="text-sm text-muted-foreground truncate mt-1">
              {description}
            </p>
          )}

          <div className="flex items-center text-xs text-muted-foreground mt-2">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCard;